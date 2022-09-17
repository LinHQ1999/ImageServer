package imgServer

import (
	"embed"
	"fmt"
	"imgServer/db"
	"imgServer/utils"
	"io/fs"
	"log"
	"net"
	"net/http"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
)

//go:embed statics
var static embed.FS

// Serve 开始把 db 所在的目录作为服务
func Serve() {
	if err := utils.Index(); err != nil {
		log.Fatalln("索引检查失败：\n", err)
	}
	gin.SetMode(gin.ReleaseMode)
	addrs, _ := net.InterfaceAddrs()

	ro := gin.Default()

	app, err := fs.Sub(static, "statics")
	if err != nil {
		log.Fatalln("错误的嵌入目录结构")
	}

	ro.Static("/pics", ".")
	ro.StaticFS("/app", http.FS(app))

	ro.NoRoute(func(ctx *gin.Context) {
		ctx.Redirect(http.StatusPermanentRedirect, "/app/index.html")
	})

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
				ctx.AbortWithStatusJSON(http.StatusNotFound, gin.H{"msg": "No such author!\n" + err.Error()})
				log.Println(err)
				return
			}
			ctx.JSON(http.StatusOK, gin.H{
				"max":  images.Total,
				"data": images.Indexes,
			})
		})
	}

	for _, v := range addrs {
		if ip, ok := v.(*net.IPNet); ok {
			ipt4 := ip.IP.To4()
			if ipt4 != nil && strings.Contains(ipt4.String(), "192") {
				log.Printf("访问 App：http://%s:9080/app", ipt4.String())
			}
		}
	}
	ro.Run(":9080")
}
