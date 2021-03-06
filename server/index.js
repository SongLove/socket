let app = require('express')()
let http = require('http').Server(app)
let io = require('socket.io')(http)

app.get('/', (req, res) => {
  res.send('<h1>1111111</h1>')
})

// 在线人 名称
let onlineUsers = {}
// 当前在线人数
let onlineCount = 0

io.on('connection', (socket) => {
  console.log('a user connected')

  // 监听新用户加入
  socket.on('login', (obj) => {
    // 将新加入用户的唯一标识当作socket的名称，后面退出的时候会用到
    socket.name = obj.userid

    // 检查在线列表，如果不在里面就加入
    if (!onlineUsers.hasOwnProperty(obj.userid)) {
      onlineUsers[obj.userid] = obj.username
      // +1
      onlineCount++
    }
    // 向所有客户端广播有用户加入
    io.emit('login', { onlineUsers, onlineCount, user: obj })
    console.log(obj.username + '加入')
  })

  // 监听退出
  socket.on('disconnect', () => {
    // 将退出的用户从在线列表删除
    if (onlineUsers.hasOwnProperty(socket.name)) {
      // 退出用户的信息
      let obj = { userid: socket.name, username: onlineUsers[socket.name] }
      // 删除
      delete onlineUsers[socket.name]
      // 在线人数-1
      onlineCount--
      // 向所有客户端用户广播退出
      io.emit('logout', { onlineUsers, onlineCount, user: obj })
      console.log(obj.username + '退出了')
    }
  })

  // 监听用户发布的内容
  socket.on('message', (obj) => {
    // 向所有客户端广播消息
    io.emit('message', obj)
    console.log(obj.username + '说：' + obj.content)
  })
})

http.listen(3300, () => {
  console.log('listening on: 3300')
})