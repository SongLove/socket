// BackCompat：标准兼容模式关闭。
// CSS1Compat：标准兼容模式开启。

(function () {
  var d = document,
    w = window,
    p = parseInt,
    dd = d.documentElement,
    db = d.body,
    dc = d.compatMode == 'CSSICompat',
    dx = dc ? dd : db,
    ec = encodeURIComponent

  w.CHAT = {
    // 信息
    msgObj: d.getElementById('message'),
    screenheight: w.innerHeight ? w.innerHeight : dx.clientHeight,
    username: null,
    userid: null,
    socket: null,
    // 让浏览器滚动条保持在底部
    scrollToBottom: function () {
      w.scrollTo(0, this.msgObj.clientHeight)
    },
    // 退出
    logout: function () {
      location.reload()
    },
    // 提交聊天消息内容
    submit: function () {
      var content = d.getElementById('content').value
      if (content) {
        var obj = {
          userid: this.userid,
          username: this.username,
          content
        }
        this.socket.emit('message', obj)
        d.getElementById('content').value = ''
      }
      return false
    },
    // 自定义uid
    genUid: function () {
      return new Date().getTime() + '' + Math.floor(Math.random() * 899 + 100)
    },
    // 更新系统消息
    updateSysMsg: function (o, action) {
      // 当前在线用户列表
      var onlineUsers = o.onlineUsers
      // 当前在线人数
      var onlineCount = o.onlineCount
      // 新加入用户的消息
      var user = o.user

      // 更新在线人数
      var userhtml = ''
      var separator = ''
      for (key in onlineUsers) {
        if (onlineUsers.hasOwnProperty(key)) {
          userhtml += separator + '、' + onlineUsers[key]
          separator = ''
        }
      }
      d.getElementById('onlinecount').innerHTML = '当前共有' + onlineCount + '人在线' + userhtml

      // 添加系统消息
      var html = `
        <div class="msg-system">
          ${user.username} ${action == 'login' ? '进入聊天室' : '退出聊天室'}
        </div>
      `
      var section = d.createElement('section')
      section.className = 'system J-mjrlinkWrap J-cutMsg'
      section.innerHTML = html
      this.msgObj.appendChild(section)
      this.scrollToBottom()
    },
    // 第一个页面用户提交用户名 也就是登陆
    usernameSubmit: function () {
      var username = d.getElementById('username').value
      if (username) {
        d.getElementById('username').value = ''
        d.getElementById('loginbox').style.display = 'none'
        d.getElementById('chatbox').style.display = 'block'
        this.init(username)
      }
      return false
    },
    // 登陆后初始化
    init: function (username) {
      /*
     客户端根据时间和随机数生成uid,这样使得聊天室用户名称可以重复。
     实际项目中，如果是需要用户登录，那么直接采用用户的uid来做标识就可以
     */
      this.userid = this.genUid()
      this.username = username

      d.getElementById('showusername').innerHTML = this.username
      this.msgObj.style.minHeight = (this.screenheight - db.clientHeight + this.msgObj.clientHeight) + 'px'
      this.scrollToBottom()

      // 连接websocket后端服务器
      this.socket = io.connect('ws://127.0.0.1:3300/')

      // 告诉服务器有用户登陆
      this.socket.emit('login', { userid: this.userid, username: this.username })

      // 监听新用户登陆
      this.socket.on('login', (o) => {
        console.log('有人登陆:', o)
        CHAT.updateSysMsg(o, 'login')
      })

      // 监听用户退出
      this.socket.on('logout', (o) => {
        CHAT.updateSysMsg(o, 'logout')
      })

      //监听消息发送
      this.socket.on('message', (obj) => {
        console.log(obj)
        var isme = (obj.userid == CHAT.userid) ? true : false
        var contentBox = `
          <div class="content">
            <div class="head-img"> ${isme ? '<img src="./static/23.png"/>' : '<img src="./static/24.png"/>'}</div>
            <p class="content-msg"> ${obj.content}</p>
          </div>
        `
        var section = d.createElement('section')

        if (isme) section.className = 'user'
        else section.className = 'service'

        section.innerHTML = contentBox
        CHAT.msgObj.appendChild(section)
        CHAT.scrollToBottom()
      })
    }
  }

  // 回车提交用户名
  d.getElementById('username').onkeydown = function (e) {
    e = e || event
    if (e.keyCode === 13) {
      CHAT.usernameSubmit()
    }
  }

  // 回车提交信息
  d.getElementById('content').onkeydown = function (e) {
    e = e || event
    if (e.keyCode === 13) {
      CHAT.submit()
    }
  }

})()