import * as fs from 'fs'
import * as path from "path"
import logManager from '../common/logger'
import MediaFile from "./MediaFile";

const logger = logManager.logger("media")

export default class MediaSources {
    public list:Array<MediaFile>
    public rootDir:string


    constructor(rootDir:string, recursive:boolean=true) {
        this.rootDir = rootDir
        this.list = []
        this.listFiles(rootDir, recursive)
    }

    private listFiles(parentPath:string, recursive:boolean=true) {
        const names = fs.readdirSync(parentPath)
        names.forEach((name, index)=>{
            try {
                const path = `${parentPath}/${name}`
                const stat = fs.statSync(path)
                if(stat.isFile()) {
                    this.list.push(new MediaFile(path, stat.size))
                } else if(recursive && stat.isDirectory()) {
                    this.listFiles(path, recursive)
                }
            } catch (e) {
                logger.stack(e)
            }
        })
    }

    public dump() {
        this.list.forEach((e)=>{
            logger.debug(`${e.path} (${e.length})`)
        })
    }
}