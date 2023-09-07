#!/usr/bin/env node

import { startServer } from '../src/server.js'
import open from 'open'
import argsParser from 'yargs-parser'

const argv = argsParser(process.argv.slice(2))

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
        console.log('No path specified')
    }
})()
