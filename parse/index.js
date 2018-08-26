const fs = require('fs')
const d3 = require('d3')
const async = require('async')
const request = require('request')
const path = require('path')

const pruneMin = require('./prune-min.js')
const pruneApi = require('./prune-api.js')
const pruneColors = require('./prune-colors.js')
const pruneColorsMin = require('./prune-colors-min.js')

const categoryColors = require('./category-colors.json')

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

const colorNames = d3.csv.parse(
  fs.readFileSync(__dirname + '/../data/colors.csv').toString()
)

const categories = Object.keys(categoryColors)

const done = function(err) {
  console.log('done') //, apiHash
  console.log(`skipped ${missing} missing files`)
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

  let libcsv = 'url,count\n'
  Object.keys(libHash).forEach(
    lib => (libcsv += lib + ',' + libHash[lib] + '\n')
  )
  fs.writeFileSync(__dirname + '/../data/parsed/libs.csv', libcsv)

  let modulescsv = 'module,count\n'
  Object.keys(moduleHash).forEach(
    module => (modulescsv += module + ',' + moduleHash[module] + '\n')
  )
  fs.writeFileSync(__dirname + '/../data/parsed/modules.csv', modulescsv)

  if (err) {
    console.log('err', err)
  }
  console.log(`wrote ${apiBlocks.length} API blocks`)
  console.log(`wrote ${colorBlocks.length} Color blocks`)
  console.log(`wrote ${fileBlocks.length} Files blocks`)
  return console.log(`wrote ${allBlocks.length} total blocks`)
}

// read in the list of gist metadata
let gistMeta = JSON.parse(
  fs.readFileSync(__dirname + '/../data/gist-meta.json').toString()
)

// make gistMeta smaller for faster testing
gistMeta = gistMeta.slice(0, 101)
console.log(gistMeta.length)

const pruneFiles = function(gist) {
  const fileNames = Object.keys(gist.files)
  const prunes = []
  fileNames.forEach(function(fileName) {
    const file = gist.files[fileName]
    const pruned = {
      gistId: gist.id,
      userId: gist.userId,
      description: gist.description,
      created_at: gist.created_at,
      updated_at: gist.updated_at,
      fileName,
      file
    }
    return prunes.push(pruned)
  })
  return prunes
}

const parseD3Functions = function(code) {
  // we match d3.foo.bar( which will find plugins and unofficial api functions
  const re = new RegExp(/d3\.[a-zA-Z0-9\.]*?\(/g)
  const matches = code.match(re) || []
  return matches
}

const parseApi = function(code, gist, gapiHash) {
  const apis = parseD3Functions(code)
  apis.forEach(function(api) {
    api = api.slice(0, api.length - 1)
    //apiHash[api] = 0 unless apiHash[api]
    //apiHash[api]++
    if (!gapiHash[api]) {
      gapiHash[api] = 0
    }
    return gapiHash[api]++
  })
  return apis.length
}

const colorScales = function(gapiHash, gcolorHash) {
  categories.forEach(function(cat) {
    if (gapiHash[cat]) {
      const colors = categoryColors[cat]
      return colors.forEach(function(color) {
        //colorHash[color] = 0 unless colorHash[color]
        //colorHash[color]++
        if (!gcolorHash[color]) {
          gcolorHash[color] = 0
        }
        return gcolorHash[color]++
      })
    }
  })
  return 0
}

const addColors = function(code, re, gcolorHash) {
  const matches = code.match(re) || []
  matches.forEach(function(str) {
    const color = d3
      .rgb(str)
      .toString()
      .toLowerCase()
    //colorHash[color] = 0 unless colorHash[color]
    //colorHash[color]++
    if (!gcolorHash[color]) {
      gcolorHash[color] = 0
    }
    return gcolorHash[color]++
  })
  return 0
}

const parseColors = function(code, gist, gcolorHash) {
  const hsl = /hsla?\(\s*(\d{1,3})\s*,\s*(\d{1,3}\%)\s*,\s*(\d{1,3}\%)\s*(?:\s*,\s*(\d+(?:\.\d+)?)\s*)?\)/g
  const hex = /#[a-fA-F0-9]{3,6}/g
  //someone clever could combine these two
  const rgb = /rgb\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})\)/g
  const rgba = /rgba\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})\)/g
  addColors(code, hsl, gcolorHash)
  addColors(code, hex, gcolorHash)
  addColors(code, rgb, gcolorHash)
  addColors(code, rgba, gcolorHash)
  colorNames.forEach(function(c) {
    const re = new RegExp(c.color, 'gi')
    return addColors(code, re, gcolorHash)
  })

  return Object.keys(gcolorHash).length
}

const parseScriptTags = function(code) {
  // anything with a // in it (signifiying url...)
  //re = new RegExp /<script.*?src=[\"\'](.*?\/\/.+?)[\"\'].*?>/g
  // anything with a .js in it
  const re = new RegExp(/<script.*?src=[\"\'](.*?\.js.*?)[\"\'].*?>/g)
  const matches = []
  let match = re.exec(code)
  while (match !== null) {
    matches.push(match[1])
    match = re.exec(code)
  }
  return matches
}

const parseLibs = function(code, gist, glibHash) {
  const scripts = parseScriptTags(code)
  scripts.forEach(function(script) {})
  //console.log script
  //libHash[script] = 0 unless libHash[script]
  //libHash[script]++
  return 0
}

const parseD3Version = function(code) {
  const scripts = parseScriptTags(code)
  let version = 'NA'
  scripts.forEach(function(script) {
    if (script.indexOf('d3.v4') >= 0) {
      version = 'v4'
    } else if (script.indexOf('d3/3.') >= 0 || script.indexOf('d3.v3') >= 0) {
      version = 'v3'
    }
    if (script.indexOf('d3.v2') >= 0) {
      return (version = 'v2')
    } else if (
      script.indexOf('d3.js') >= 0 ||
      script.indexOf('d3.min.js') >= 0
    ) {
      // we know this is some sort of d3 but not which version
      if (version === 'NA') {
        return (version = 'IDK')
      }
    }
  })
  //console.log version
  return version
}

const parseD3Modules = function(code, gmoduleHash) {
  // finds anything with the pattern d3-*. e.g. d3-legend.js or d3-transition.v1.min.js
  // TODO:
  // d3.geo.projection/raster/tile/polyhedron
  // d3.tip
  const scripts = parseScriptTags(code)
  scripts.forEach(function(script) {
    const re = /(d3-[a-z]*?)\./
    //module = script.match(re)
    const matches = re.exec(script)
    if (!matches || !matches.length) {
      return
    }
    const module = matches[1]
    //console.log module
    //console.log script
    //moduleHash[module] = 0 unless moduleHash[module]
    //moduleHash[module]++
    if (!gmoduleHash[module]) {
      gmoduleHash[module] = 0
    }
    return gmoduleHash[module]++
  })
  return 0
}

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
  async.eachLimit(gistMeta, 100, gistParser, done)
}
