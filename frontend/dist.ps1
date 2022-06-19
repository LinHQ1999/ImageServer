yarn build
cp dist/* ../img-server/statics -Force -Recurse
cd ../tfs-crawler
go install
cd -
