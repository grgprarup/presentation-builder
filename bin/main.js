#!/usr/bin/env node

import { startServer } from '../lib/server.js'
import open from 'open'
import argsParser from 'yargs-parser'
import fs from 'fs-extra'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import * as path from 'path'

const alias = {
    h: 'help',
    s: 'separator',
    S: 'vertical-separator',
}
const argv = argsParser(process.argv.slice(2), { alias })

const { disableAutoOpen } = argv

const hasPath = Boolean(argv._[0])

;(async () => {
    if (hasPath) {
        let server, initialUrl

        try {
            ;[server, initialUrl] = await startServer()
            console.log(`The slides are at ${initialUrl}`)
            !disableAutoOpen && (await open(initialUrl, { url: true }))
            process.on('SIGINT', () => {
                console.log('Shutting down the server.')
                server.close()
                process.exit(128)
            })
        } catch (err) {
            console.error(err)
            process.exit(1)
        }
    } else {
        const currentDir = dirname(fileURLToPath(import.meta.url))
        console.log(currentDir)
        const help = await fs.readFile(path.join(currentDir, './help.txt'))
        console.log(help.toString())
    }
})()
