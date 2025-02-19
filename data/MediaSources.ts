import * as fs from 'fs'
import * as path from "path"
import logManager from '../common/logger'
import MediaFile from "./MediaFile"
import { default as cv } from '../common/converter'
import targets from "../private/targets.json";

const logger = logManager.enable("media")

export class MediaSources {
    public list:Array<MediaFile>
    private categoriesSet:Set<string>
    private checker:Set<string>|null
    private prepared:Boolean = false

    public get categories():Array<string> {
        return Array.from(this.categoriesSet)
    }
    constructor() {
        this.list = []
        this.checker = null
        this.categoriesSet = new Set<string>()

        // this.addRoot(targets.roots, "")
    }

    // private withChecker(fn: () => void) {
    //     let checkerPrepared = false
    //     if(!this.checker) {
    //         this.checker = new Set<string>(this.list.map((v)=>v.path))
    //         checkerPrepared = true
    //     }
    //     fn()
    //     if(checkerPrepared) {
    //         delete this.checker
    //     }
    // }

    public prepare(recursive:boolean=true) {
        if(this.prepared) return
        this.prepared = true
        this.addRoot(targets.roots, "", recursive).then();
    }


    public async addRoot(rootPath:string|Array<object>, groupName:string, recursive:boolean = true) {
        this.checker = new Set<string>(this.list.map((v)=>v.path))
        if(typeof rootPath === 'string') {
            await this.listFiles(rootPath, groupName, recursive)
        } else {
            for(const v of rootPath) {
                await this.listFiles(v["path"], cv.safe_text(v["name"]), v["recursive"])
            }
        }
        delete this.checker
    }

    // public addRoot(rootPaths:Array<string>, recursive:boolean = true) {
    //     this.withChecker(()=>{
    //         rootPaths.forEach((rootPath)=>{
    //             this.listFiles(rootPath, recursive)
    //         })
    //     })
    // }

    private async listFiles(parentPath:string, dirName:string, recursive:boolean=true) {
        const names = fs.readdirSync(parentPath)
        for(const name of names) {
            try {
                const filePath = path.join(parentPath, name)
                const stat = fs.statSync(filePath)
                if(stat.isFile()) {
                    const rawExt = path.extname(name)
                    const ext = rawExt.toLowerCase()
                    if(ext==".mp4"||ext==".mp3"||ext==".jpg"||ext==".jpeg"||ext==".png") {
                        if (!this.checker.has(filePath)) {
                            let title = path.basename(name, rawExt)
                            if(dirName.length>0) {
                                title = dirName + '/' + title
                            }
                            // this.list.push((new MediaFile(filePath, ext, title, stat.size)).getDuration())
                            this.list.push(await MediaFile.create(filePath, ext, title, dirName, stat.size, stat.ctimeMs))
                            this.categoriesSet.add(dirName)
                            this.checker.add(filePath)
                        }
                    }
                } else if(recursive && stat.isDirectory()) {
                    let itemName = path.basename(name)
                    await this.listFiles(filePath, itemName, recursive)
                }
            } catch (e) {
                logger.stack(e)
            }
        }
    }

    public dump() {
        this.list.forEach((v)=>{
            logger.debug(`${v.path} (${v.length})`)
        })
    }
}

const sources = new MediaSources()
export default sources