export default class MediaFile {
    public path:string
    public ext:string
    public title:string
    public length:number
    constructor(path:string, ext:string, title:string, length:number) {
        this.path = path
        this.ext = ext
        this.length = length
        this.title = title
    }

    public mimeType():string {
        switch(this.ext) {
            case ".mp3": return "audio/mp3"
            case ".mp4": return "video/mp4"
            default: return "video/mp4"
        }
    }
}