package utils

import (
	"imgServer/db"
	"io/fs"
	"log"
	"path/filepath"
	"regexp"
	"strconv"
	"strings"
	"time"
)

// Index 从当前目录中向下索引所有图片
func Index() error {
	if db.IsEmpty() {
		st := time.Now()
		tx := db.DB.MustBegin()
		err := filepath.WalkDir(".", func(path string, d fs.DirEntry, err error) error {
			matched, err := regexp.MatchString(`^\d{2,}[._].+(png|jpg|jpeg|webp|gif)$`, d.Name())
			if err != nil {
				return err
			}
			if matched {
				doti := strings.IndexAny(d.Name(), "._")
				sid := d.Name()[:doti]
				id, _ := strconv.Atoi(sid)
				name := d.Name()[doti+1:]
				img := db.ImageIndex{
					ID:     int64(id),
					Name:   name,
					Path:   path,
					Author: filepath.Base(filepath.Dir(path)),
				}
				img.Add(tx)
			}
			return nil
		})
		if err != nil {
			return err
		}
		err = tx.Commit()
		if err != nil {
			return err
		}
		ed := time.Now().Sub(st)
		log.Printf("索引处理完成，用时 %+v", ed)
		return nil
	}
	return nil
}
