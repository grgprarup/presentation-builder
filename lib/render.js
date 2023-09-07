import path from 'path'
import { parseYamlFrontMatter, revealMarkdownPlugin } from './util.js'
import fs from 'fs-extra'
import { getCssPaths, getInitialDir, getRevealOptions, getSlideOptions, getTemplate } from './config.js'
import _ from 'lodash'
import Mustache from 'mustache'

const slidifyProps = ['attributes', 'notesSeparator', 'separator', 'verticalSeparator']

const getSlidifyOptions = (context) => {
    return _.pick(context, slidifyProps)
}

const slidify = (markdown, slidifyOptions = {}) => {
    return revealMarkdownPlugin.slidify(markdown, slidifyOptions)
}

const render = async (content) => {
    const { metadataOptions, markdown } = parseYamlFrontMatter(content)
    const options = Object.assign(getSlideOptions(metadataOptions))
    const { title } = options
    const revealOptions = Object.assign({}, getRevealOptions(options.revealOptions))
    const cssPaths = getCssPaths(options.css, options.assetsDir, options.base)
    const slides = slidify(markdown, getSlidifyOptions(options))
    const context = Object.assign(options, {
        title,
        slides,
        cssPaths,
        revealOptionsStr: JSON.stringify(revealOptions),
    })
    const template = await getTemplate(options.template)
    return Mustache.render(template, context)
}
const renderFile = async (filePath) => {
    try {
        const content = await fs.readFile(filePath)
        return render(content.toString())
    } catch (err) {
        return render('File not found.')
    }
}

const sanitize = (entry) => {
    if (entry.includes('..')) {
        entry = sanitize(entry.replace('..', ''))
    }
    return entry
}

const renderMarkdown = async (req, res) => {
    const dir = await getInitialDir()
    const filePath = path.join(dir, sanitize(decodeURIComponent(req.url)).replace(/\?.*/, ''))
    const markup = await renderFile(filePath)
    console.log("MARKUP", markup)
    res.send(markup)
}

export { renderMarkdown, render }
