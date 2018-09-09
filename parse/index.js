const fs = require('fs')
const d3 = require('d3')
const async = require('async')
const request = require('request')

const parseApi = require('./parse-api.js')
const parseColors = require('./parse-colors.js')
const colorScales = require('./color-scales.js')
const parseD3Version = require('./parse-d3-version.js')
const parseD3Modules = require('./parse-d3-modules.js')

const gistParser = require('./gist-parser.js')
const done = require('./done.js')

const allBlocks = []

// minimal metadata
const minBlocks = []

// we want an object for each file, with associated gist metadata
let fileBlocks = []

// build up a global unique list all of
// script tags from index.html files
const scriptTagHash = {}
const scriptTagFilenamesHash = {}

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
// gistMeta = gistMeta.slice(704, 705)
// gistMeta = gistMeta.slice(20000, 20001)
// gistMeta = gistMeta.slice(20000, 22000)
console.log(gistMeta.length)

let i = 0

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
    gistParser.bind(null, {
      fileBlocks,
      allBlocks,
      minBlocks,
      colorBlocks,
      colorBlocksMin,
      apiBlocks,
      moduleHash,
      scriptTagHash,
      scriptTagFilenamesHash
    }),
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
      moduleHash,
      scriptTagHash,
      scriptTagFilenamesHash
    })
  )
}
