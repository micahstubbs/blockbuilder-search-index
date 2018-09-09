const fs = require('fs')
const writeJson = require('./write-json.js')

const metadataDir = `${__dirname}/../data/metadata`
const data = JSON.parse(
  fs.readFileSync(`${metadataDir}/d3-library-filename-counts.json`)
)

const filenames = data.map(d => d.filename)

writeJson({
  data: filenames,
  message: 'filenames of d3 library bundles',
  filePath: `${metadataDir}/d3-library-filenames.json`
})
