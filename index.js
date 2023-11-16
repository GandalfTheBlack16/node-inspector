import express from 'express'
import { readdir } from 'fs/promises'

const app = express()

app.get('/inspect', async (req, res) => {
    const { path } = req.query
    if (path) {
        console.log(`Inspecting ${path}`)
        const files = await readdir(path)
        return res.send(files)
    }
    res.status(404).end()
})

app.listen(process.env.PORT ?? 3000, () => {
    console.log('Inspector running...')
})