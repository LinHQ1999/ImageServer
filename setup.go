package imgServer

import (
	"embed"
	"fmt"
	"imgServer/db"
	"io/fs"
	"log"
	"net/http"
	"os"
	"strconv"

	"github.com/gin-gonic/gin"
)

//go:embed statics
var static embed.FS

// Serve 开始把 db 所在的目录作为服务
func Serve() {
	if _, err := os.Stat("imgdata.db"); os.IsNotExist(err) {
		log.Fatalln("索引不存在")
	}
	ro := gin.Default()
	// ro.Use(cors.Default())

	app, err := fs.Sub(static, "statics")
	if err != nil {
		log.Fatalln("错误的嵌入目录结构")
	}

	ro.Static("/pics", ".")
	ro.StaticFS("/app", http.FS(app))

	api := ro.Group("/api")
	{
		api.GET("authors", func(ctx *gin.Context) {
			authors, err := db.Authors()
			if err != nil {
				ctx.AbortWithStatusJSON(http.StatusNotFound, gin.H{"msg": "No such author"})
				log.Println(err)
				return
			}
			ctx.JSON(http.StatusOK, authors)
		})

		api.GET(":author/submissions", func(ctx *gin.Context) {
			author := ctx.Param("author")
			qpage, qsize := ctx.Query("pg"), ctx.Query("sz")
			page, err1 := strconv.Atoi(qpage)
			size, err2 := strconv.Atoi(qsize)
			keyword := ctx.Query("query")
			if err1 != nil || err2 != nil {
				ctx.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"msg": fmt.Sprintf("Invalid range st:%s sz:%s", qpage, qsize)})
				return
			}
			images, err := db.Submissions(author, keyword, page, size)
			if err != nil {
				ctx.AbortWithStatusJSON(http.StatusNotFound, gin.H{"msg": "No such author"})
				log.Println(err)
				return
			}
			ctx.JSON(http.StatusOK, images)
		})
	}

	ro.Run(":9080")
}
