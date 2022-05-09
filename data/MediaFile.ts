export default class MediaFile {
    public path:string
    public length:Number
    constructor(path:string, length:Number) {
        this.path = path
        this.length = length
    }
}