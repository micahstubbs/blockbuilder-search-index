const fs = require('fs')
const writeJson = require('./write-json.js')

const done = function(parentProps, error) {
  const {
    missing,
    apiHash,
    colorHash,
    allBlocks,
    minBlocks,
    apiBlocks,
    colorBlocks,
    colorBlocksMin,
    fileBlocks,
    libHash,
    moduleHash,
    scriptTagsSet
  } = parentProps
  console.log('done') //, apiHash
  // console.log('moduleHash from done', moduleHash)
  console.log(`skipped ${missing} missing files`)
  const scriptTags = Array.from(scriptTagsSet).sort()

  // specify the output directory
  const outputDir = `${__dirname}/../data/parsed-new-method`
  // if the output directory does not already exist
  // create it
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir)

  //
  // write out the metadata we just parsed
  //
  //
  // write json
  //
  const filesToWrite = [
    {
      data: apiHash,
      message: 'd3 API functions',
      filePath: `${outputDir}/apis.json`
    },
    {
      data: colorHash,
      message: 'colors',
      filePath: `${outputDir}/colors.json`
    },
    {
      data: allBlocks,
      message: 'block metadata entries',
      filePath: `${outputDir}/blocks.json`
    },
    {
      min: true,
      data: minBlocks,
      message: 'minified block metadata entries',
      filePath: `${outputDir}/blocks-min.json`
    },
    {
      data: apiBlocks,
      message: 'single-block d3 API function lists',
      filePath: `${outputDir}/blocks-api.json`
    },
    {
      data: colorBlocks,
      message: 'colors entries',
      filePath: `${outputDir}/blocks-colors.json`
    },
    {
      min: true,
      data: colorBlocksMin,
      message: 'minified colors entries',
      filePath: `${outputDir}/blocks-colors-min.json`
    },
    {
      data: fileBlocks,
      message: 'file metadata entries',
      filePath: `${outputDir}/files-blocks.json`
    },
    {
      data: scriptTags,
      message: 'script tags',
      filePath: `${outputDir}/script-tags.json`
    }
  ]
  const maxMessageLength = Math.max(
    ...filesToWrite.map(file => file.message.length)
  )
  const maxDataLength = Math.max(
    ...filesToWrite.map(file => {
      if (Array.isArray(file.data)) return String(file.data.length).length + 1
      return 0
    })
  )
  const fixedLength = 10
  const maxLength = fixedLength + maxDataLength + maxMessageLength
  // console.log('fixedLength', fixedLength)
  // console.log('maxDataLength', maxDataLength)
  // console.log('maxMessageLength', maxMessageLength)
  // console.log('maxLength', maxLength)

  filesToWrite.forEach(file => {
    let dataLength = 0
    if (Array.isArray(file.data))
      dataLength = String(file.data.length).length + 1
    const messageLength = file.message.length
    const sumLength = fixedLength + dataLength + messageLength
    if (sumLength < maxLength) {
      // pad the message length for nice terminal output
      file.message = `${file.message}${' '.repeat(maxLength - sumLength)}`
    }
    writeJson(file)
  })

  //
  // write csv
  //
  let libcsv = 'url,count\n'
  Object.keys(libHash).forEach(
    lib => (libcsv += lib + ',' + libHash[lib] + '\n')
  )
  fs.writeFileSync(`${outputDir}/libs.csv`, libcsv)

  let modulescsv = 'module,count\n'
  Object.keys(moduleHash)
    .sort((a, b) => moduleHash[b] - moduleHash[a])
    .forEach(module => (modulescsv += module + ',' + moduleHash[module] + '\n'))
  fs.writeFileSync(`${outputDir}/modules.csv`, modulescsv)

  if (error) {
    console.log('error', error)
  }
}

module.exports = done
