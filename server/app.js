const express = require('express')
const path = require('path')
const app = express()
const fs = require('fs')

// 使用静态资源访问public为跟目录
app.use(express.static('./public'))
app.get('/', (req, res, next) => {
  res.writeHead(200, { 'Content-Type': 'text/html' })
  fs.readFile('./public/chat.html', 'utf-8', (err, data) => {
    if (err) throw err
    res.end(data)
  })
  console.log(req.path)
})
app.get('/aa.js', (req, res) => {
  fs.readFile('./public/client.js', 'utf-8', (err, data) => {
    if (err) throw err
    res.end(data)
  })
})

app.listen(8000, () => {
  console.log('app 客户端 listening at port 8000')
})