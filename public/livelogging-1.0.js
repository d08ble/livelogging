(function() {
  var ws
  var connected = false
  var queueMax = 1
  var queueMessages = []
  var messagesLost = 0
  var reconnectionTimeout = 1000

  function flush() {
    queueMessages.forEach(function (message) {
      ws.send(message)
    })
    queueMessages = []
    if (messagesLost > 0) {
      var message = ""+messagesLost+' messages is dropped'
      messagesLost = 0
      send('*** ERROR ***', message) // warning! recursive
    }
  }
  function send(path, message, type) {
    if (queueMessages.length <= queueMax) {
      queueMessages.push(JSON.stringify({time:(new Date()).getTime(), path:path, data:message, type:type}))
    }
    else {
      console.log('LiveLogging: Message dropped:', path, message, type)
      messagesLost++
    }
    if (connected) {
      flush()
    }
  }

  this.LiveLogging = {
    connect: function connect(url, cb) {
      var self = this
      ws = new WebSocket(url)
      ws.onopen = function (e) {
//        console.log('ws open')
        connected = true
        flush()
      }
      ws.onclose = function (e) {
//        console.log('ws close')
        connected = false

        setTimeout(function () {
          self.connect(url)
        }, reconnectionTimeout);
      }
      ws.onerror = function (e) {
//        console.log('ws error')
      }
      ws.onabort = function (e) {
        console.log('ws abort')
        connected = false
      }
    },
    log: function log(path, message) {
      send(path, message, 'log')
    },
    replace: function replace(path, message) {
      send(path, message, 'replace')
    }
  }
}).call(this)
