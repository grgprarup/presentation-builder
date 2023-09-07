import { getInitialDir, getInitialPath, getHost, getPort, getAssetsDir, getRevealBasePath } from './config.js'
import express from 'express'
import path from 'path'
import { renderMarkdown } from './render.js'

const staticDir = express.static
const assetsDir = getAssetsDir()
const host = getHost()
const port = getPort()
export async function startServer() {
    const app = express()
    const initialDir = await getInitialDir()
    const initialPath = await getInitialPath()

    ;['plugin', 'dist'].forEach((dir) => {
        console.log("DIR", dir)
        console.log("STA", path.join(getRevealBasePath(), dir))
        app.use('/' + dir, staticDir(path.join(getRevealBasePath(), dir)))
    })

    app.get(/(\w+\.md)/, renderMarkdown)

    app.use(`/${assetsDir}`, staticDir(process.cwd(), { fallthrough: false }))

    app.use('/', staticDir(initialDir))

    const server = app.listen(port)

    console.log(`Reveal server started at http://${host}:${port}`)

    return [server, `http://${host}:${port}/${initialPath}`]
}
