const fs = require('fs')
const async = require('async')
const path = require('path')

const pruneMin = require('./prune-min.js')
const pruneApi = require('./prune-api.js')
const pruneColors = require('./prune-colors.js')
const pruneColorsMin = require('./prune-colors-min.js')
const pruneFiles = require('./prune-files.js')
const parseApi = require('./parse-api.js')
const colorScales = require('./color-scales.js')
const parseColors = require('./parse-colors.js')
const parseLibs = require('./parse-libs.js')
const parseD3Version = require('./parse-d3-version.js')
const parseD3Modules = require('./parse-d3-modules.js')
const parseScriptTags = require('./parse-script-tags.js')

const gistParser = function(parentProps, gist, gistCb) {
  let {
    fileBlocks,
    allBlocks,
    minBlocks,
    colorBlocks,
    colorBlocksMin,
    apiBlocks,
    moduleHash,
    scriptTagsSet,
    scriptTagFilenamesSet
  } = parentProps
  //console.log "NOT RETURNING", gist.id, singleId
  const gistUser = gist.user || gist.owner ? gist.owner.login : ''
  console.log(`gist ${gist.id} ${gistUser}`)
  const fileNames = Object.keys(gist.files || {})
  // per-gist cache of api functions that we build up in place
  const gapiHash = {}
  const glibHash = {}
  const gistModuleHash = {}
  const gcolorHash = {}
  const folder = __dirname + '/' + '../data/gists-files/' + gist.id
  fs.mkdir(folder, function() {})

  // we make a simplified data object for each file
  // console.log('gist', gist)
  const filepruned = pruneFiles({ gist, fileNames })
  // console.log('filepruned', filepruned)

  fileBlocks = fileBlocks.concat(filepruned)
  // console.log('fileBlocks', fileBlocks)
  // console.log('fileNames from gistParser', fileNames)

  return async.each(
    fileNames,
    function(fileName, fileCb) {
      const ext = path.extname(fileName)
      // console.log('ext', ext)
      if (
        [
          '.html',
          '.js',
          '.coffee',
          '.md',
          '.json',
          '.csv',
          '.tsv',
          '.css'
        ].includes(ext)
      ) {
        const file = folder + '/' + fileName
        // console.log('file', file)
        return fs.readFile(file, function(err, data) {
          let numColors
          if (!data) {
            // console.log('no data, early return')
            return fileCb()
          }
          const contents = data.toString()
          // console.log('contents from gistParser readFile', contents)
          if (fileName === 'index.html') {
            const code = contents
            const scriptTags = parseScriptTags({
              code,
              scriptTagsSet,
              scriptTagFilenamesSet
            })

            // TODO copy glibHash -> libHash etc for each of these
            const numLibs = parseLibs({
              code,
              gist,
              glibHash,
              scriptTags,
              scriptTagsSet
            })
            const version = parseD3Version({ code, scriptTags, scriptTagsSet })
            const modules = parseD3Modules({
              code,
              moduleHash,
              gistModuleHash,
              scriptTags,
              scriptTagsSet
            })
            // console.log('fileName is index.html')
            // console.log('numLibs', numLibs)
            // console.log('version', version)
            // console.log('modules', modules)
            gist.d3version = version
          }
          if (['.html', '.js', '.coffee'].includes(ext)) {
            // TODO copy gapiHash -> apiHash etc for each of these
            const numApis = parseApi(contents, gist, gapiHash)
            numColors = parseColors(contents, gist, gcolorHash)
            colorScales(gapiHash, gcolorHash)
            //console.log gist.id, fileName, numApis, numColors
            return fileCb()
          } else if (['.tsv', '.csv'].includes(ext)) {
            // pull out # of rows and # of columns
            return fileCb()
          } else if (['.css'].includes(ext)) {
            numColors = parseColors(contents, gist, gcolorHash)
            //console.log gist.id, fileName, 0, numColors
            return fileCb()
          } else {
            //console.log gist.id, fileName
            return fileCb()
          }
        })
      } else {
        return fileCb()
      }
    },
    function() {
      if (Object.keys(gapiHash).length > 0) {
        gist.api = gapiHash
        apiBlocks.push(pruneApi(gist))
      }
      if (Object.keys(gistModuleHash).length > 0) {
        gist.d3modules = gistModuleHash
      }
      if (Object.keys(gcolorHash).length > 0) {
        gist.colors = gcolorHash
        colorBlocks.push(pruneColors(gist))
        colorBlocksMin.push(pruneColorsMin(gist))
      }
      // if Object.keys(glibHash).length > 0
      //   gist.libs = glibHash

      //delete gist.files
      if (gist.files['thumbnail.png']) {
        gist.thumbnail = gist.files['thumbnail.png'].raw_url
      }
      allBlocks.push(gist)
      minBlocks.push(pruneMin(gist))
      return gistCb()
    }
  )
}

module.exports = gistParser
