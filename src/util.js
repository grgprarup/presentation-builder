import _ from 'lodash'
import * as path from 'path'
import fs from 'fs'
import { promisify } from 'util'
import yamlFrontMatter from 'yaml-front-matter'
import markdownPlugin from 'reveal.js/plugin/markdown/markdown.js'

const isDirectory = _.memoize(async (dir) => {
    return (await promisify(fs.stat)(path.resolve(dir))).isDirectory()
})

const parseYamlFrontMatter = (content) => {
    const document = yamlFrontMatter.loadFront(content.replace(/^\uFEFF/, ''))
    return {
        metadataOptions: _.omit(document, '__content'),
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
