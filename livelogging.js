// import [

var _ = require('underscore'),
  fs = require('fs')

// import ]
// config [

var defaultServerOptions = {
  port: 7089,
  datafile: undefined,
  logfile: undefined,
  logToConsole: true
}

var config = {
  logToConsole: true
}
var status = 'local'
var dataFile

// config ]
// DataFile [

var DataFile = function(file) {
  this.file = file
  this.tree = {name: '-*-LiveLogging-*-', children: {}, items: []}

  this.flush()
}

DataFile.prototype.log = function log(path, message) {
  var words = path.split('/')

  var node = this.tree
  _.each(words, function (word) {
    node = node.children[word] || (node.children[word] = {name: word, children: {}, items: []})
  })

  if (typeof message == 'object')
    message = JSON.stringify(message, null, 2);
  node.items.push(message)

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
  if (fs.exists(file)) {
    var suffix = (new Date()).toJSON()
    console.log(file+suffix)
  }
  dataFile = new DataFile(file)
}

// local open datafile ]
// log function [

function log(path, message) {
  if (config.logToConsole)
    console.log(path, message)
  if (dataFile) {
    dataFile.log(path, message)
  }
}

// log function ]
// replace function [



// replace function ]
// module.exports [

module.exports = {
  server: server,
  client: client,
  open: open,
  log: log,

  status: status,
  config: config
}

// module.exports ]
