# boo-server
Standalone server for [BooDroid](https://github.com/toyota-m2k/boodroid)

## Setup

### private/config.json
```
{
  "ffprobe": "c:/bin/ffmpeg/ffprobe.exe",
  "port": 8000,
  "player": ""
}
```
- ffprobe (required)
 
  Path to ffprove(.exe) in ffmpeg.

- port (optional - default: 3000)

  Listening port number in boo-server.
 
- player (optional - default: unavailable)

  Server root for index.html.
 
### private/target.json
Specify media sources.
```
{
  "roots":[
    {
      "path": "C:/Users/Hoge/Videos",
      "name": "My Videos"
      "recursive": false
    },
    {
      "path": "d:/data/music",
      "name": "Music collection",
      "recursive": true
    },
  ]
}
```

- root
  
  Array of media sources.

  - path
  
    Path to the directory that stores media files.

  - name
    
    Any label.
    
  - recursive
  
    true: to find all media files from the directory and its sub-directories.

## Build

```
yarn install
tsc
```
 
## Startup

```
yarn start
```

 
