import _ from 'lodash'
import path from 'path'
import fs from 'fs'
import { promisify } from 'util'
import yamlFrontMatter from 'yaml-front-matter'
import markdownPlugin from 'reveal.js/plugin/markdown/markdown.js'

const stat = promisify(fs.stat)

const isDirectory = _.memoize(async (dir) => {
    const stats = await stat(path.resolve(dir))
    return stats.isDirectory()
})

const parseYamlFrontMatter = (content) => {
    const document = yamlFrontMatter.loadFront(content.replace(/^\uFEFF/, ''))
    return {
        yamlOptions: _.omit(document, '__content'),
        markdown: document.__content || content,
    }
}

const isAbsoluteURL = (path) => path.indexOf('://') > 0 || path.indexOf('//') === 0

const revealMarkdownPlugin = (() => {
    global.Reveal = {
        registerPlugin: () => {},
    }
    return markdownPlugin()
})()

export { isDirectory, parseYamlFrontMatter, isAbsoluteURL, revealMarkdownPlugin }
