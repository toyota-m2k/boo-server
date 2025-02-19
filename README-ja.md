# BooServer

ローカルフォルダに保存した動画(*.mp4)、音楽(*.mp3)、写真(*.jpg,*.png) を宅内LAN上に配信するジュークボックスサーバーです。
拙作 BooDroid (Android Native) または、BooTauri2 (Windows/MacOS/Linux/Android/iOS) で再生できます。


## Setup

### private/config.json
サーバーの基本的な設定を行います。
```json
{
  "ffprobe": "c:/bin/ffmpeg/ffprobe.exe",
  "port": 8000
}
```
- ffprobe (required)

  ffmpeg の ffprove(.exe) のフルパスを指定します。
  ffproveは、動画の再生時間などのプロパティを取得するために使用します。

- port (optional - default: 3000)

  このサーバーが使用するポート番号を指定します。
 
### private/target.json
メディアファイル（動画・音楽・写真）のソースを指定します。
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
  
  メディアファイルソース定義を配列で指定します。

  - path
  
    メディアファイルの入ったディレクトリのパスを指定します。

  - name
    
    任意の名前を指定します。
    
  - recursive

    trueを指定すると、path で指定したディレクトリと、そのサブフォルダ内のすべてのメディアファイルを列挙します。

## Build

```
yarn install
tsc
```
 
## Startup

```
yarn start
```

