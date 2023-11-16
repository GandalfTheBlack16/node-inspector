import express from 'express'
import { readdir } from 'fs/promises'

const app = express()

app.get('/inspect', async (req, res) => {
    const { path } = req.query
    if (path) {
        console.log(`Inspecting ${path}`)
        try {
            const files = await readdir(path)
            return res.send(files)
        } catch (error) {
            console.log(`Cannot inspect ${path}:`, error)
            return res.send(error)
        }
    }
    res.status(404).end()
})

app.listen(process.env.PORT ?? 3000, () => {
    console.log('Inspector running...')
})