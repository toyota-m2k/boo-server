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

router.get('/list', (req,res,next)=>{
    const date = new Date()
    const o = {
        cmd: "list",
        date: date.getUTCSeconds(),
        list: sources.list.map((v,i)=>{
            const name = path.basename(v.path)
            return {
                id: `${i+1}`,
                name: path.basename(name, path.extname(name)),
                start: 0,
                end: 0,
                volume:0.5
            }
        })
    }
    res.json(o)
})

router.get('/video', (req, res, next)=>{
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
        res.writeHead(206, {
            "Content-Length": end-start-1,
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
})

router.get('/category', (req,res,next)=>{
    res.json({
        cmd:"category",
        categories:{}
    })
})

router.get('/chapter', (req,res,next)=>{
    res.json({
        cmd:"chapter",
        id:`${cv.safe_text(req.query.id)}`,
        chapters:{}
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