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
    scriptTagHash,
    scriptTagFilenamesHash
  } = parentProps
  console.log('done') //, apiHash
  // console.log('moduleHash from done', moduleHash)
  console.log(`skipped ${missing} missing files`)

  //
  // prepare different types of scriptTag data for writing
  //
  const scriptTags = Object.keys(scriptTagHash).sort()

  const scriptTagCounts = Object.keys(scriptTagHash)
    .map(key => ({
      src: key,
      count: scriptTagHash[key]
    }))
    .sort((a, b) => b.count - a.count)

  const scriptTagFilenames = Object.keys(scriptTagFilenamesHash).sort()

  const scriptTagFilenameCounts = Object.keys(scriptTagFilenamesHash)
    .map(key => ({
      filename: key,
      count: scriptTagFilenamesHash[key]
    }))
    .sort((a, b) => b.count - a.count)

  const scriptTagFilenamesD3 = scriptTagFilenames.filter(f => f.includes('d3'))

  const scriptTagFilenameCountsD3 = scriptTagFilenameCounts.filter(f =>
    f.filename.includes('d3')
  )

  //
  // calculate some stats
  //
  const sum = (accumulator, currentValue) => accumulator + currentValue
  const stats = {}
  stats.parseTime = new Date().toISOString()
  stats.apis = Object.keys(apiHash).length
  stats.colors = Object.keys(colorHash).length
  stats.blockMetadataEntries = allBlocks.length
  stats.blockMetadataEntriesMin = minBlocks.length
  stats.blockColorsEntries = colorBlocks.length
  stats.blockColorsEntriesMin = colorBlocksMin.length
  stats.blockFilesEntries = fileBlocks.length
  stats.scriptTagsUnique = scriptTags.length
  stats.scriptTagsTotal = scriptTagCounts.map(d => d.count).reduce(sum, 0)
  stats.scriptTagFilenamesUnique = scriptTagFilenames.length
  stats.scriptTagFilenamesTotal = scriptTagFilenameCounts
    .map(d => d.count)
    .reduce(sum, 0)
  stats.scriptTagFilenamesD3Unique = scriptTagFilenamesD3.length
  stats.scriptTagFilenamesD3Total = scriptTagFilenameCountsD3
    .map(d => d.count)
    .reduce(sum, 0)

  // specify the output directory
  const parsedDir = `${__dirname}/../data/parsed-new-method`
  const metadataDir = `${__dirname}/../data/metadata`
  // if the parsed output directory does not already exist
  // create it
  if (!fs.existsSync(parsedDir)) fs.mkdirSync(parsedDir)

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
      filePath: `${parsedDir}/apis.json`
    },
    {
      data: colorHash,
      message: 'colors',
      filePath: `${parsedDir}/colors.json`
    },
    {
      data: allBlocks,
      message: 'block metadata entries',
      filePath: `${parsedDir}/blocks.json`
    },
    {
      min: true,
      data: minBlocks,
      message: 'minified block metadata entries',
      filePath: `${parsedDir}/blocks-min.json`
    },
    {
      data: apiBlocks,
      message: 'single-block d3 API function lists',
      filePath: `${parsedDir}/blocks-api.json`
    },
    {
      data: colorBlocks,
      message: 'colors entries',
      filePath: `${parsedDir}/blocks-colors.json`
    },
    {
      min: true,
      data: colorBlocksMin,
      message: 'minified colors entries',
      filePath: `${parsedDir}/blocks-colors-min.json`
    },
    {
      data: fileBlocks,
      message: 'file metadata entries',
      filePath: `${parsedDir}/files-blocks.json`
    },
    {
      data: scriptTags,
      message: 'script tags',
      filePath: `${metadataDir}/script-tags.json`
    },
    {
      data: scriptTagCounts,
      message: 'script tags and counts',
      filePath: `${metadataDir}/script-tag-counts.json`
    },
    {
      data: scriptTagFilenames,
      message: 'filenames from script tags',
      filePath: `${metadataDir}/script-tags-filenames.json`
    },
    {
      data: scriptTagFilenameCounts,
      message: 'filenames and counts from script tags',
      filePath: `${metadataDir}/script-tags-filename-counts.json`
    },
    {
      data: scriptTagFilenamesD3,
      message: 'filenames from script tags that contain the string d3',
      filePath: `${metadataDir}/script-tags-filenames-d3.json`
    },
    {
      data: scriptTagFilenameCountsD3,
      message:
        'filenames and counts from script tags that contain the string d3',
      filePath: `${metadataDir}/script-tags-filename-counts-d3.json`
    },
    {
      data: stats,
      message: 'gist metadata stats from this parsing run',
      filePath: `${metadataDir}/stats.json`
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
  fs.writeFileSync(`${parsedDir}/libs.csv`, libcsv)

  let modulescsv = 'module,count\n'
  Object.keys(moduleHash)
    .sort((a, b) => moduleHash[b] - moduleHash[a])
    .forEach(module => (modulescsv += module + ',' + moduleHash[module] + '\n'))
  fs.writeFileSync(`${parsedDir}/modules.csv`, modulescsv)

  if (error) {
    console.log('error', error)
  }
}

module.exports = done
