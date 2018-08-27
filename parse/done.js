const fs = require('fs')
const writeJson = require('./write-json.js')

const done = function(parentProps, err) {
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

  //
  // write out the metadata we just parsed
  //
  writeJson({
    data: apiHash,
    message: 'd3 API functions',
    filePath: '/../data/parsed/apis.json'
  })
  writeJson({
    data: colorHash,
    message: 'colors',
    filePath: '/../data/parsed/colors.json'
  })
  writeJson({
    data: allBlocks,
    message: 'block metadata entries',
    filePath: '/../data/parsed/blocks.json'
  })
  writeJson({
    min: true,
    data: minBlocks,
    message: 'minified block metadata entries',
    filePath: '/../data/parsed/blocks-min.json'
  })
  writeJson({
    data: apiBlocks,
    message: 'd3 API functions entries',
    filePath: '/../data/parsed/blocks-api.json'
  })
  writeJson({
    data: colorBlocks,
    message: 'colors entries',
    filePath: '/../data/parsed/blocks-colors.json'
  })
  writeJson({
    min: true,
    data: colorBlocksMin,
    message: 'minified colors entries',
    filePath: '/../data/parsed/blocks-colors-min.json'
  })
  writeJson({
    data: fileBlocks,
    message: 'file metadata entries',
    filePath: '/../data/parsed/files-blocks.json'
  })
  writeJson({
    data: scriptTags,
    message: 'script tags',
    filePath: '/../data/parsed/script-tags.json'
  })

  let libcsv = 'url,count\n'
  Object.keys(libHash).forEach(
    lib => (libcsv += lib + ',' + libHash[lib] + '\n')
  )
  fs.writeFileSync(__dirname + '/../data/parsed/libs.csv', libcsv)

  let modulescsv = 'module,count\n'
  Object.keys(moduleHash)
    .sort((a, b) => moduleHash[b] - moduleHash[a])
    .forEach(module => (modulescsv += module + ',' + moduleHash[module] + '\n'))
  fs.writeFileSync(__dirname + '/../data/parsed/modules.csv', modulescsv)

  if (error) {
    console.log('error', error)
  }
}

module.exports = done
