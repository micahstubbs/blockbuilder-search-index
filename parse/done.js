const fs = require('fs')

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
    scriptTagSet
  } = parentProps
  console.log('done') //, apiHash
  // console.log('moduleHash from done', moduleHash)
  console.log(`skipped ${missing} missing files`)
  const scriptTags = Array.from(scriptTagSet)
  fs.writeFileSync(
    __dirname + '/../data/parsed/apis.json',
    JSON.stringify(apiHash)
  )
  fs.writeFileSync(
    __dirname + '/../data/parsed/colors.json',
    JSON.stringify(colorHash)
  )
  fs.writeFileSync(
    __dirname + '/../data/parsed/blocks.json',
    JSON.stringify(allBlocks)
  )
  fs.writeFileSync(
    __dirname + '/../data/parsed/blocks-min.json',
    JSON.stringify(minBlocks)
  )
  fs.writeFileSync(
    __dirname + '/../data/parsed/blocks-api.json',
    JSON.stringify(apiBlocks)
  )
  fs.writeFileSync(
    __dirname + '/../data/parsed/blocks-colors.json',
    JSON.stringify(colorBlocks)
  )
  fs.writeFileSync(
    __dirname + '/../data/parsed/blocks-colors-min.json',
    JSON.stringify(colorBlocksMin)
  )
  fs.writeFileSync(
    __dirname + '/../data/parsed/files-blocks.json',
    JSON.stringify(fileBlocks)
  )
  try {
    fs.writeFileSync(
      __dirname + '/../data/parsed/script-tags.json',
      JSON.stringify(scriptTags)
    )
    console.log(
      `wrote ${scriptTags.length} script tags to data/parsed/script-tags.json`
    )
  } catch (error) {
    console.log('error writing data/parsed/script-tags.json')
    console.log(error)
  }

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

  if (err) {
    console.log('err', err)
  }
  console.log(`wrote ${apiBlocks.length} API blocks`)
  console.log(`wrote ${colorBlocks.length} Color blocks`)
  console.log(`wrote ${fileBlocks.length} Files blocks`)
  return console.log(`wrote ${allBlocks.length} total blocks`)
}

module.exports = done
