const { exec } = require('child_process')

const url = process.env.PRESENTATION_URL || 'http://localhost:8000'
let outputUri = process.env.OUTPUT_URI
function exportAsPDF(url, outputUri = 'exports/output.pdf') {
    const decktapeCommand = `decktape reveal ${url} ${outputUri}`
    exec(decktapeCommand, (err, stdout, stderr) => {
        if (err) {
            console.error(`${stderr}`)
            console.error(`${stdout.match(/Error: (.*)/g)}`)
            console.error('❌ PDF export failed.')
        } else {
            console.info(`${stdout}`)
            console.info('✅ PDF export completed.')
        }
    })
}

function exportAsHTML(url, outputUri = 'exports/output.html') {
    //     TODO: export static HTML
    console.info('🚧 Not implemented yet')
}

if (require.main === module) {
    const args = process.argv.slice(2)

    if (args[0] === 'pdf') {
        exportAsPDF(url, outputUri)
    } else if (args[0] === 'html') {
        exportAsHTML(url, outputUri)
    } else {
        console.error('❌ Invalid argument. Please use either "pdf" or "html".')
    }
}
