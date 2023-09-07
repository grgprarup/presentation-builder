import path, { dirname } from 'path'
import { fileURLToPath } from 'url'

const revealBasePath = path.resolve(dirname(dirname(fileURLToPath(import.meta.url))), 'node_modules', 'reveal.js')

export { revealBasePath }

