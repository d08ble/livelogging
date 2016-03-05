### LiveLogging for [LiveComment](https://github.com/d08ble/livecomment)

#### API

```
log(path, message)
replace(path, message)
erase(path)
```

#### Usage NodeJS

```
var LiveLogging = require('../livelogging')

var options = {
    datafile: '1.log',
    logToConsole: true,
    server: true,
    port: 7089
}

// A. Run server

LiveLogging.server(options)

// B. Open file, no server

LiveLogging.open(options.datafile)

// LiveLog message to path

LiveLogging.log('path', 'message')
LiveLogging.replace('path', 'message')
LiveLogging.erase('path')

```

#### Usage Browser

```
    ...
    <script src="livelogging-1.0.js"></script>
    ...
    <script>
        // connect
        var livelogging_port = 7089
        var url = 'ws://localhost:'+livelogging_port
        LiveLogging.connect(url, function () {
            // connected
            LiveLogging.log('path', 'message')
            LiveLogging.replace('path', 'message')
            LiveLogging.erase('path')
            ...
        })
    <script>
```

#### Run Demo Sever

```
cd bin
./livelogging logs/1.log --server --commentPrefix="@'_'@"
```

#### Log file sample
See like that logs/1.log
```
@'_'@ -*-LiveLogging-*-[
@'_'@ LiveLogging[
@'_'@ Status[
|2016-03-05 16:41:09.822| server.started
@'_'@ Status]
@'_'@ Config[
|2016-03-05 16:41:09.826| {
  "port": 7089,
  "commentPrefix": "@'_'@",
  "datafile": "logs/1.log",
  "logToConsole": false,
  "queueMessagesMax": 50,
  "queueMessagesCount": 25,
  "serverFlushTimeout": 500
}
@'_'@ Config]
@'_'@ LiveLogging]
@'_'@ -*-LiveLogging-*-]
```

#### Open test page
```
open public/index.html
```
Wait some seconds & refresh log file

#### Final

Configure [LiveComment](https://github.com/d08ble/livecomment) and see LiveLogging process in browser

#### License

[MIT](https://github.com/d08ble/livelogging/blob/master/LICENSE)
