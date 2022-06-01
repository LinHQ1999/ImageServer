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
	Path   string `db:"path" json:"path"`
	Author string `db:"author" json:"author"`
}

// Author 作者相关信息，不持久化
type Author struct {
	Author      string `db:"author" json:"author"`
	Submissions int    `db:"submissions" json:"submissions"`
}

// InitDB 由 start 数调用进行初始化
func InitDB() {
	db, err := sqlx.Connect("sqlite3", "file:imgdata.db")
	if err != nil {
		log.Panicln(err)
	}
	DB = db
	db.MustExec(`CREATE TABLE IF NOT EXISTS images(
		id integer primary key,
		name text,
		path text,
		author text
	);`)

	log.Println("数据库已初始化")
}

// Add 插入图片索引
func (image *ImageIndex) Add(tx *sqlx.Tx) {
	tx.MustExec(`INSERT INTO images VALUES(?, ?, ?, ?)`, image.ID, image.Name, image.Path, image.Author)
}

// Submissions 根据作者，起始点，页面大小获取一系列作品
func Submissions(author, keyword string, page, size int) ([]ImageIndex, error) {
	page--
	images := []ImageIndex{}
	if err := DB.Select(&images, `SELECT * FROM images WHERE author=? AND name LIKE ? LIMIT ? OFFSET ?`, author, fmt.Sprintf("%%%s%%", keyword), size, page*size); err != nil {
		return images, err
	}
	return images, nil
}

// Delete 封装一层基本操作
func Delete(author string) {
	DB.MustExec(`DELETE FROM images WHERE author=?`, author)
}

// Authors 获取所有的作者
func Authors() ([]Author, error) {
	authors := []Author{}
	if err := DB.Select(&authors, `SELECT author, count(author) AS submissions FROM images GROUP BY author`); err != nil {
		return authors, err
	}
	return authors, nil
}
