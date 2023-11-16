import express from 'express'
import { readdir } from 'fs/promises'
import archiver from 'archiver'
import { createWriteStream } from 'fs'
import { resolve } from 'path'
import { uploadFile } from './googleDriveProvider.js'
import { config } from 'dotenv'

config()

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

    const path = '/data'

    const output = createWriteStream('target.zip')
    const archive = archiver('zip')

    console.log(`Zipping ${path}`)

    output.on('close', function () {
        console.log(archive.pointer() + ' total bytes');
        console.log('archiver has been finalized and the output file descriptor has closed.');
        
        const filePath = resolve('target.zip')

        uploadFile(filePath).then(() => {
            console.log('Finished upload')
        })
          
    });

    archive.on('error', function(err){
        throw err;
    });
    
    archive.pipe(output);
    
    // append files from a sub-directory, putting its contents at the root of archive
    archive.directory(resolve(path), false);
    
    // append files from a sub-directory and naming it `new-subdir` within the archive
    archive.directory('subdir/', 'new-subdir');
    
    archive.finalize();
})