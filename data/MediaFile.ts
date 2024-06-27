import {getVideoDurationInSeconds} from "get-video-duration"
import config from "../private/config.json"

export default class MediaFile {
    public path:string
    public ext:string
    public title:string
    public length:number
    public duration:number
    constructor(path:string, ext:string, title:string, length:number) {
        this.path = path
        this.ext = ext
        this.length = length
        this.title = title
    }

    public mimeType():string {
        switch(this.ext) {
            case ".mp3": return "audio/mpeg"
            case ".mp4": return "video/mp4"
            default: return "video/mp4"
        }
    }

    public booType():string {
        return this.ext.startsWith(".") ? this.ext.substring(1) : this.ext
    }

    get mediaType():string {
        switch(this.ext) {
            case ".mp3": return "a"
            case ".mp4": return "v"
            default: return "v"
        }
    }

    public async getDuration():Promise<MediaFile> {
        this.duration = await getVideoDurationInSeconds(this.path, config.ffprobe)
        return this;
    }

    public static async create(path:string, ext:string, title:string, length:number):Promise<MediaFile> {
        const e = new MediaFile(path, ext, title, length)
        await e.getDuration()
        return e;
    }
}