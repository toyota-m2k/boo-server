import * as express from 'express'
import sources from '../data/MediaSources'
import * as fs from 'fs'
import * as path from "path"
import { default as cv } from '../common/converter'
import logManager from '../common/logger'
import MediaFile from '../data/MediaFile'
import {ReadStream} from "fs";
const router = express.Router()
const logger = logManager.enable("media")

sources.prepare();

router.get('/capability', (req, res, next)=>{
    res.json( {
        cmd: "capability",
        serverName: "BooServer",
        version:2,
        root: '/',
        category:false,
        rating:false,
        mark:false,
        chapter:false,
        reputation: 0,
        diff: true,
        sync: false,
        acceptRequest:false,
        hasView:false,
        authentication:false,
        types: "vap",   // video, audio, photo
    })
})

const date = new Date()

router.get('/check', (req,res,next)=>{
    const ds = req.query.date as string
    const dn = parseInt(ds??'0')
    const update = (date.getTime()>dn) ? "1" : "0"
    res.json({
        cmd: "check",
        update,
        status: "ok"
    })
})

router.get('/list', (req,res,next)=>{
    const type = req.query.type as string
    const types = req.query.f as string
    let video = true
    let audio = true
    let photo = true
    if(types) {
        video = types.includes("v")
        audio = types.includes("a")
        photo = types.includes("p")
    } else if (type) {
        video = type === "video" || type === "all"
        audio = type === "audio" || type === "all"
        photo = type === "photo" || type === "all"
    }

    function filter(file:MediaFile):boolean {
        if(video && file.mediaType==='v') return true
        if(audio && file.mediaType==='a') return true
        if(photo && file.mediaType==='p') return true
        return false
    }

    try {
        const o = {
            cmd: "list",
            date: date.getTime(),
            list: sources.list.map((v, i) => {
                return {
                    id: `${i + 1}`,
                    name: v.title,
                    start: 0,
                    end: 0,
                    volume: 0.5,
                    type: v.booType(),  // deprecated
                    media: v.mediaType,
                    size: v.length,
                    duration: v.duration?.toFixed() ?? 0,
                }
            })
        }
        res.json(o)
    } catch (e) {
        logger.stack(e, "list error")
        res.sendStatus(500)
    }

})

function getItem(req,res) {
    const id = cv.int(req.query.id)-1
    if(id<0) {
        logger.warn("no id")
        res.locals.message = "no id"
        res.sendStatus(404)
        return
    }
    const file = sources.list[id]
    if(!file) {
        logger.warn("invalid id")
        res.locals.message = "invalid id"
        res.sendStatus(404)
        return
    }
    const range = req.range(file.length)
    let stream :ReadStream
    if(!range) {
        logger.debug(`${file.title}`)
        res.writeHead(200, {
            "Content-Length": file.length,
            "Content-Type": file.mimeType(),
            "Accept-Ranges": "bytes"
        })
        stream = fs.createReadStream(file.path)
    } else if(range.type==='bytes') {
        let start = cv.int(range[0].start) ?? 0
        let end = cv.int(range[0].end) ?? file.length - 1
        if(end>=file.length) {
            end = file.length -1
        }
        if(start<0 || end<=start) {
            logger.warn("invalid range")
            res.locals.message = "invalid range"
            res.sendStatus(500)
            return
        }
        logger.debug(`${file.title} :: ${start}-${end}`)
        res.writeHead(206, {
            "Content-Length": end-start+1,
            "Content-Type": file.mimeType(),
            "Accept-Ranges": "bytes",
            "Content-Range": `bytes ${start}-${end}/${file.length}`
        })
        stream = fs.createReadStream(file.path, {start:start, end:end})
    } else {
        res.locals.message = "range parser error"
        res.sendStatus(500)
        return
    }
    stream.on("error", (error)=>{
        logger.stack(error, "stream error")
        res.sendStatus(500)
    })
    stream.pipe(res)
}

router.get('/video', (req, res, next)=>{
    getItem(req,res)
})
router.get('/audio', (req, res, next)=>{
    getItem(req,res)
})
router.get('/photo', (req, res, next)=>{
    getItem(req,res)
})
router.get('/item', (req, res, next)=>{
    getItem(req,res)
})

router.get('/category', (req,res,next)=>{
    res.json({
        cmd:"category",
        categories:[]
    })
})

router.get('/chapter', (req,res,next)=>{
    res.json({
        cmd:"chapter",
        id:`${cv.safe_text(req.query.id)}`,
        chapters:[]
    })
})

router.route('/current')
    .get((req,res,next)=>{
        res.json({
            cmd:"current",
            id:'1'
        })
    })
    .put((req,res,next)=>{
        res.json({
            cmd:"current",
        })
    })

module.exports = router
export default router