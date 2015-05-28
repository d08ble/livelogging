// import [

var _ = require('underscore'),
  dateFormat = require('dateformat'),
  fs = require('fs'),
  WebSocketServer = require('ws').Server

// import ]
// config [

var defaultServerOptions = {
  port: 7089,
  datafile: undefined,
  logfile: undefined,
  logToConsole: true,
  queueMessagesMax: 50,
  queueMessagesCount: 25,
  serverFlushTimeout: 500
}

var config = {
  logToConsole: true
}
var status = 'local'
var dataFile

// config ]
// DataFile [

var DataFile = function(file) {
  console.log("✔ datafile", file)
  this.file = file
  this.tree = {name: '-*-LiveLogging-*-', children: {}, items: []}

  this.flush()
}

DataFile.prototype.log = function log(time, path, message, mode) {
  var words = path.split('/')

  var node = this.tree
  _.each(words, function (word) {
    node = node.children[word] || (node.children[word] = {name: word, children: {}, items: []})
  })

  if (typeof message == 'object')
    message = JSON.stringify(message, null, 2);
  message = '|' + dateFormat(time, "yyyy-mm-dd HH:MM:ss.l") + '| ' + message
  if (mode == 'replace') {
    node.items = [message]
  }
  else {
    node.items.push(message)
  }

  this.flush() // todo: timeout
}

DataFile.prototype.flush = function flush() {
  var s = ''
  function recursive(node) {
    if (node) {
      s += node.name + '[\n'
      if (node.items.length)
        s += node.items.join('\n') + '\n'
      for (var i in node.children) {
        recursive(node.children[i])
      }
      s += node.name + ']\n'
    }
  }
  recursive(this.tree)

  fs.writeFileSync(this.file, s)
}

// DataFile ]
// server [

function server(options) {
  status = 'server.started'
  config = _.extend(defaultServerOptions, options)

  open(config.datafile)

  if (config.logToConsole)
    console.log("✔ log to stdout")

  // ws [
  var ServerMessageLog = {}
  var queueMessages = []
  var timer

  function flushMessages(n) {
    var messages = queueMessages.slice(0, n)
    queueMessages = queueMessages.slice(n)
    var messages = _.sortBy(messages, 'time')
    console.log(messages);
    _.each(messages, function (m) {
//      var filename = options.logpath+'/1.log'
//      logString(filename, m.text)
      logMessage(new Date(m.time), m.path, m.data, m.type == 'log' ? '' : m.type)
    })
  }

  console.log("✔ ws server listening on port %d", config.port)

  var wss = new WebSocketServer({port: config.port});

  wss.on('connection', function(ws) {
    ws.on('message', function(m) {
      var message = JSON.parse(m)
      queueMessages.push(message)
      if (queueMessages.length > config.queueMessagesMax)
        flushMessages(config.flushMessagesCount)

      if (timer)
        clearTimeout(timer)
      timer = setTimeout(function () {
        timer = null
        flushMessages(queueMessages.length)
      }, config.serverFlushTimeout)
    })
  })
  // ws ]
}

// server ]
// client [

function client(url) {
//  status = 'client.connected'
  console.log('CLIENT IS NOT IMPLEMENTED!') // todo
}

// client ]
// local open datafile [

function open(file) {
  if (!file) {
    console.log('No output file, force logging to console')
    config.logToConsole = true
    return
  }
  if (fs.existsSync(file)) {
    var suffix = (new Date()).toJSON()//(new Date()).getTime()
    var newfile = file+'.'+suffix
    console.log('Move datafile to', newfile)
    fs.renameSync(file, newfile)
  }
  dataFile = new DataFile(file)
}

// local open datafile ]
// logMessage [

function logMessage(time, path, message, mode) {
  if (config.logToConsole) {
    console.log(mode ? '['+mode+']' : '', path, message)
  }
  if (dataFile) {
    dataFile.log(time, path, message, mode)
  }
}

// logMessage ]
// log function [

function log(path, message) {
  logMessage(new Date(), path, message)
}

// log function ]
// replace function [

function replace(path, message) {
  logMessage(new Date(), path, message, 'replace')
}

// replace function ]
// module.exports [

module.exports = {
  server: server,
  client: client,
  open: open,
  log: log,

  status: function () {return status},
  config: function () {return config}
}

// module.exports ]
