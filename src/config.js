import path, { dirname } from 'path'
import { isAbsoluteURL, isDirectory } from './util.js'
import parseArgs from 'yargs-parser'
import defaults from '../defaults.json' assert { type: 'json' }
import _ from 'lodash'
import tryRequire from 'try-require'
import fs from 'fs-extra'
import url, { fileURLToPath } from 'url'
import { glob } from 'glob'
import resolve from "resolve";

const cliConfig = parseArgs(process.argv.slice(2), {
    boolean: true,
})

const revealConfig = tryRequire(path.join(process.cwd(), 'reveal.json'))

const mergedConfig = _.defaults({}, defaults, cliConfig, revealConfig)

const getRevealBasePath = () => {
    return path.resolve(resolve.sync('reveal.js'), '..', '..')
}

const revealThemes = glob.sync('dist/theme/*.css', { cwd: getRevealBasePath() })
const getPath = () => cliConfig._[0] || '.'

const getInitialDir = async () => {
    const dir = path.resolve(getPath())
    return (await isDirectory(dir)) ? dir : path.dirname(dir)
}

const getInitialPath = async () => path.relative(await getInitialDir(), getPath())

const getAssetsDir = () => mergedConfig.assetsDir
const getHost = () => mergedConfig.host
const getPort = () => mergedConfig.port

const getSlideOptions = (options) => {
    return _.defaults({}, defaults, cliConfig, options)
}

const getRevealOptions = () => {
    return _.defaults({}, revealConfig)
}

const getCssPaths = (css, assetsDir) => {
    return getAssetPaths(css, assetsDir)
}

const getAssetPaths = (assets, assetsDir) => {
    return (typeof assets === 'string' ? assets.split(',') : assets).map((assetPath) =>
        getAssetPath(assetPath, assetsDir)
    )
}

const getAssetPath = (asset, assetsDir = defaults.assetsDir) => {
    return isAbsoluteURL(asset) ? asset : `/${assetsDir}/assets/${asset}`
}

const getTemplate = async (template) => {
    const contents = await fs.readFile(path.join(process.cwd(), template))
    return contents.toString()
}

const getThemeUrl = (theme) => {
    // url.parse is deprecated, need to find an alternative
    const parsedUrl = url.parse(theme)
    if (parsedUrl.host) {
        return theme
    } else {
        const revealTheme = revealThemes.find(
            (themePath) => path.basename(themePath).replace(path.extname(themePath), '') === theme
        )
        return revealTheme ? '/' + revealTheme : getAssetPath(theme)
    }
}

export {
    getPath,
    getInitialDir,
    getInitialPath,
    getAssetsDir,
    getHost,
    getPort,
    getSlideOptions,
    getRevealOptions,
    getCssPaths,
    getTemplate,
    getThemeUrl,
    getRevealBasePath,
}
