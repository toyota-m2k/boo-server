import * as fs from 'fs'
import * as path from "path"
import logManager from '../common/logger'
import MediaFile from "./MediaFile"

const targets = require('../private/targets.json')

const logger = logManager.enable("media")

export class MediaSources {
    public list:Array<MediaFile>
    private checker:Set<string>


    constructor(recursive:boolean=true) {
        this.list = []
        this.addRoot(targets.roots)
    }

    private withChecker(fn: () => void) {
        let checkerPrepared = false
        if(!this.checker) {
            this.checker = new Set<string>(this.list.map((v)=>v.path))
            checkerPrepared = true
        }
        fn()
        if(checkerPrepared) {
            delete this.checker
        }
    }


    public addRoot(rootPath:string|Array<object>, recursive:boolean = true) {
        this.withChecker(()=>{
            if(typeof rootPath === 'string') {
                this.listFiles(rootPath, recursive)
            } else {
                rootPath.forEach((v)=> {
                    this.listFiles(v["path"], v["recursive"])
                })
            }
        })
    }

    // public addRoot(rootPaths:Array<string>, recursive:boolean = true) {
    //     this.withChecker(()=>{
    //         rootPaths.forEach((rootPath)=>{
    //             this.listFiles(rootPath, recursive)
    //         })
    //     })
    // }

    private listFiles(parentPath:string, recursive:boolean=true) {
        const names = fs.readdirSync(parentPath)
        names.forEach((name, index)=>{
            try {
                const filePath = path.join(parentPath, name)
                const stat = fs.statSync(filePath)
                if(stat.isFile()) {
                    const rawExt = path.extname(name)
                    const ext = rawExt.toLowerCase()
                    if(ext==".mp4"||ext==".mp3") {
                        if (!this.checker.has(filePath)) {
                            const title = path.basename(name, rawExt)
                            this.list.push(new MediaFile(filePath, ext, title, stat.size))
                            this.checker.add(filePath)
                        }
                    }
                } else if(recursive && stat.isDirectory()) {
                    this.listFiles(filePath, recursive)
                }
            } catch (e) {
                logger.stack(e)
            }
        })
    }

    public dump() {
        this.list.forEach((v)=>{
            logger.debug(`${v.path} (${v.length})`)
        })
    }
}

const sources = new MediaSources()
export default sources