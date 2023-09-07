import { getInitialDir, getInitialPath, getHost, getPort } from './config.js'
import express from 'express'
import path from 'path'
import { revealBasePath } from './constants.js'
import { renderMarkdown } from './render.js'
import { renderMarkdownFileListing } from './listing.js'

const staticDir = express.static
const host = getHost()
const port = getPort()
export async function startServer() {
    const app = express()
    const initialDir = await getInitialDir()
    const initialPath = await getInitialPath()

    ;[('plugin', 'dist')].forEach((dir) => {
        app.use('/' + dir, staticDir(path.join(revealBasePath, dir)))
    })

    app.get(/(\w+\.md)/, renderMarkdown)

    // app.get('/*', renderMarkdownFileListing)

    const server = app.listen(port)

    console.log(`Reveal server started at http://${host}:${port}`)

    return [server, `http://${host}:${port}/${initialPath}`]
}
