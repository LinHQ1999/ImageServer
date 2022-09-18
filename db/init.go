package db

import (
	"fmt"
	"log"

	"github.com/jmoiron/sqlx"
	_ "github.com/mattn/go-sqlite3"
)

var DB *sqlx.DB

// ImageIndex 图片的索引信息 [pics/author/1089(ID).TFTG.png(name)] (path)
type ImageIndex struct {
	ID     int64  `db:"id" json:"id"`
	Name   string `db:"name" json:"name"`
	From   string `db:"from" json:"from"`
	Path   string `db:"path" json:"path"`
	Author string `db:"author" json:"author"`
}

// Author 作者相关信息，不持久化
type Author struct {
	Author      string `db:"author" json:"author"`
	Submissions int    `db:"submissions" json:"submissions"`
	LatestImg   string `db:"latest_img" json:"latest_img"`
	From        string `db:"from"`
}

// Submission 结果汇总
type Submission struct {
	Indexes []ImageIndex
	Total   int
}

// InitDB 由 start 数调用进行初始化
func InitDB() {
	dsn := "file:imgdata.db?_vacuum=1"
	db, err := sqlx.Connect("sqlite3", dsn)
	if err != nil {
		log.Panicln(err)
	}
	DB = db
	tx := db.MustBegin()
	// 建表
	tx.MustExec(`CREATE TABLE IF NOT EXISTS images(
		id integer primary key,
		name text COLLATE NOCASE,
		'from' text,
		path text,
		author text
	);`)
	// 建索引
	res := tx.MustExec(`CREATE INDEX IF NOT EXISTS images_search_IDX ON images (author,name)`)
	tx.Commit()
	count, err := res.RowsAffected()
	if count != 0 && err != nil {
		log.Println("数据库表初始化成功")
	} else {
		log.Println("数据库已成功连接")
	}
}

func IsEmpty() bool {
	var indexes []ImageIndex
	DB.Select(&indexes, `SELECT * FROM images`)
	return len(indexes) == 0
}

// Add 插入图片索引
func (image *ImageIndex) Add(tx *sqlx.Tx) {
	_, err := tx.Exec(`INSERT OR REPLACE INTO images VALUES($1, $2, $3, $4, $5)`, image.ID, image.Name, image.From, image.Path, image.Author)
	if err != nil {
		log.Printf("因为 %s，跳过 %+v",err.Error(), *image)
		return
	}
}

// Submissions 根据作者，起始点，页面大小获取一系列作品
func Submissions(author, keyword string, page, size int) (*Submission, error) {
	page--
	images := []ImageIndex{}
	total := 0
	res := new(Submission)

	if err := DB.Select(&images, `SELECT * FROM images WHERE author=? AND name LIKE ? ORDER BY id LIMIT ? OFFSET ?`, author, fmt.Sprintf("%%%s%%", keyword), size, page*size); err != nil {
		return res, err
	}
	if err := DB.Get(&total, `SELECT count(*) as total FROM images WHERE author=$1 AND name LIKE $2`, author, fmt.Sprintf("%%%s%%", keyword)); err != nil {
		return res, err
	}

	res.Indexes = images
	res.Total = total
	return res, nil
}

// Delete 封装一层基本操作
func Delete(author string) int64 {
	rs := DB.MustExec(`DELETE FROM images WHERE author=?`, author)
	count, _ := rs.RowsAffected()
	return count
}

// Authors 获取所有的作者
func Authors() ([]Author, error) {
	authors := []Author{}
	if err := DB.Select(&authors, `SELECT author, count(author) AS submissions, "from", path AS latest_img FROM (SELECT * FROM images ORDER BY id DESC) GROUP BY author`); err != nil {
		return authors, err
	}
	return authors, nil
}
