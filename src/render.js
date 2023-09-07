import path from 'path'
import { parseYamlFrontMatter, revealMarkdownPlugin } from './util.js'
import fs from 'fs-extra'
import { getCssPaths, getInitialDir, getRevealOptions, getSlideOptions, getTemplate, getThemeUrl } from './config.js'
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
    console.log("METADATA OPTIONS", metadataOptions)
    console.log("MARKDOWN", markdown)
    const options = Object.assign(getSlideOptions(metadataOptions))
    const revealOptions = Object.assign({}, getRevealOptions())
    const themeUrl = getThemeUrl(revealOptions.theme)
    const cssPaths = getCssPaths(options.css, options.assetsDir)
    console.log("SLIDIFY OPTIONS", getSlidifyOptions(options))
    console.log("OPTIONS", options)

    // if (options.metadata.length > 0){
    //     console.log("METADATA", options.metadata.length)
    // }

    const slides = slidify(markdown, getSlidifyOptions(options))
    const context = Object.assign(options, {
        slides,
        themeUrl,
        cssPaths,
        revealOptionsStr: JSON.stringify(revealOptions),
    })
    console.log('CONTEXT', context)
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
    res.send(markup)
}

export { renderMarkdown, render }
