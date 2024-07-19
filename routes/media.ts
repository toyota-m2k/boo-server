import * as express from 'express'
import sources from '../data/MediaSources'
const router = express.Router()

router.get('/', (req,res,next)=>{
    sources.dump()
    res.status(200).send("dump")
})

module.exports = router
export default router