import * as express from 'express'
import MediaSources from '../data/MediaSources'
const router = express.Router()

router.get('/', (req,res,next)=>{
    const files = new MediaSources("E:/music/Alcatrazz")
    files.dump()
    res.status(200).send("dump")
})

module.exports = router