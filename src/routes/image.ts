import { Router } from 'express'
import { handleReadImage } from '@/controllers/image'
import multer from 'multer'

const upload = multer({ dest: 'uploads/' })

const imageRouter = Router()

imageRouter.post('/', upload.single('image'), handleReadImage)

export default imageRouter
