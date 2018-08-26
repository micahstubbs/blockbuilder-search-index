const fs = require('fs')
const d3 = require('d3')
const async = require('async')
const request = require('request')
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
const done = require('./done.js')

const allBlocks = []

// minimal metadata
const minBlocks = []

// we want an object for each file, with associated gist metadata
let fileBlocks = []

// global cache of all api functions
const apiHash = {}
// global collection of blocks for API data
const apiBlocks = []

const colorHash = {}
const colorBlocks = []
const colorBlocksMin = []

// libararies and their versions
const libHash = {}
const libBlocks = []

const moduleHash = {}

// number of missing files
const missing = 0

// read in the list of gist metadata
let gistMeta = JSON.parse(
  fs.readFileSync(__dirname + '/../data/gist-meta.json').toString()
)

// make gistMeta smaller for faster testing
gistMeta = gistMeta.slice(0, 101)
console.log(gistMeta.length)

let i = 0
const gistParser = function(gist, gistCb) {
  //console.log "NOT RETURNING", gist.id, singleId
  i++
  console.log(i, gist.id)
  const fileNames = Object.keys(gist.files)
  // per-gist cache of api functions that we build up in place
  const gapiHash = {}
  const glibHash = {}
  const gmoduleHash = {}
  const gcolorHash = {}
  const folder = __dirname + '/' + '../data/gists-files/' + gist.id
  fs.mkdir(folder, function() {})

  // we make a simplified data object for each file
  const filepruned = pruneFiles(gist)
  fileBlocks = fileBlocks.concat(filepruned)

  return async.each(
    fileNames,
    function(fileName, fileCb) {
      const ext = path.extname(fileName)
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
        return fs.readFile(file, function(err, data) {
          let numColors
          if (!data) {
            return fileCb()
          }
          const contents = data.toString()
          if (fileName === 'index.html') {
            // TODO copy glibHash -> libHash etc for each of these
            const numLibs = parseLibs(contents, gist, glibHash)
            const version = parseD3Version(contents)
            const modules = parseD3Modules(contents, gmoduleHash)
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
      if (Object.keys(gmoduleHash).length > 0) {
        gist.d3modules = gmoduleHash
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

module.exports = {
  api: parseApi,
  colors: parseColors,
  colorScales,
  d3version: parseD3Version,
  d3modules: parseD3Modules
}

if (require.main === module) {
  async.eachLimit(
    gistMeta,
    100,
    gistParser,
    done.bind(null, {
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
      moduleHash
    })
  )
}
