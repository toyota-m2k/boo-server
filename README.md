# boo-server
Standalone server for [BooDroid](https://github.com/toyota-m2k/boodroid)

## Setup

### private/config.json

- ffprobe (required)
 
  Path to ffprove(.exe) of ffmpeg.

- port (optional - default: 3000)

  Listening port number in boo-server.
 
- player (optional - default: unavailable)

  Server root for index.html.
 
### private/target.json

Specify media sources.

- roots
  
  Array of media sources.

  Media source:
  - path
  
    Path to the directory that stores media files.
  - name
    
    Any label.
  - recursive
  
    true: to find all media files from the directory and its sub-directories.
 
## Startup

```
yarn start
```

 
