import path, { dirname } from "path"
import { isAbsoluteURL, isDirectory } from './util.js'
import parseArgs from 'yargs-parser'
import defaults from './config/defaults.json' assert { type: 'json' }
import _ from 'lodash'
import tryRequire from 'try-require'
import fs from 'fs-extra'
import { fileURLToPath } from "url"

const localConfig = tryRequire(path.join(process.cwd(), 'reveal-meta.json'))
const revealConfig = tryRequire(path.join(process.cwd(), 'reveal.json'))

const alias = {
    h: 'help',
}

const cliConfig = parseArgs(process.argv.slice(2), {
    boolean: true,
    alias,
})

const mergedConfig = _.defaults({}, cliConfig, localConfig, defaults)

const getPath = () => cliConfig._[0] || '.'

const getInitialDir = async () => {
    const dir = path.resolve(getPath())
    return (await isDirectory(dir)) ? dir : path.dirname(dir)
}

const getInitialPath = async () => path.relative(await getInitialDir(), getPath())
const getHost = () => mergedConfig.host
const getPort = () => mergedConfig.port

const getSlideOptions = (options) => {
    return _.defaults({}, cliConfig, options, localConfig, defaults)
}

const getRevealOptions = (options) => {
    return _.defaults({}, options, revealConfig)
}

const getCssPaths = (css, assetsDir, base) => {
    return getAssetPaths(css, assetsDir, base)
}

const getAssetPaths = (assets, assetsDir, base) => {
    return (typeof assets === 'string' ? assets.split(',') : assets).map((assetPath) =>
        getAssetPath(assetPath, assetsDir, base)
    )
}

const getAssetPath = (asset, assetsDir = defaults.assetsDir, base) => {
    return isAbsoluteURL(asset) ? asset : `${base || ''}/${assetsDir}/${asset}`
}

const getTemplate = async (template) => {
    const base = defaults.template === template ? dirname(fileURLToPath(import.meta.url)) : process.cwd()
    const contents = await fs.readFile(path.join(base, template))
    return contents.toString()
}

export {
    getPath,
    getInitialDir,
    getInitialPath,
    getHost,
    getPort,
    getSlideOptions,
    getRevealOptions,
    getCssPaths,
    getTemplate,
}
