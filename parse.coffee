
fs = require 'fs'
d3 = require 'd3'
async = require 'async'
request = require 'request'
path = require 'path'



allBlocks = []

# minimal metadata
minBlocks = []

# we want an object for each file, with associated gist metadata
fileBlocks = []

# global cache of all api functions
apiHash = {}
# global collection of blocks for API data
apiBlocks = []

colorHash = {}
colorBlocks = []
colorBlocksMin = []

# libararies and their versions
libHash = {}
libBlocks = []

moduleHash = {}

# number of missing files
missing = 0

colorNames = d3.csv.parse(fs.readFileSync(__dirname + '/data/colors.csv').toString())

categoryColors = {
  "d3.scale.category10": [
    "#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd",
    "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf"
  ],
  "d3.scale.category20": [
    "#1f77b4", "#aec7e8",
    "#ff7f0e", "#ffbb78",
    "#2ca02c", "#98df8a",
    "#d62728", "#ff9896",
    "#9467bd", "#c5b0d5",
    "#8c564b", "#c49c94",
    "#e377c2", "#f7b6d2",
    "#7f7f7f", "#c7c7c7",
    "#bcbd22", "#dbdb8d",
    "#17becf", "#9edae5"
  ],
  "d3.scale.category20b": [
    "#393b79", "#5254a3", "#6b6ecf", "#9c9ede",
    "#637939", "#8ca252", "#b5cf6b", "#cedb9c",
    "#8c6d31", "#bd9e39", "#e7ba52", "#e7cb94",
    "#843c39", "#ad494a", "#d6616b", "#e7969c",
    "#7b4173", "#a55194", "#ce6dbd", "#de9ed6"
  ],
  "d3.scale.category20c": [
    "#3182bd", "#6baed6", "#9ecae1", "#c6dbef",
    "#e6550d", "#fd8d3c", "#fdae6b", "#fdd0a2",
    "#31a354", "#74c476", "#a1d99b", "#c7e9c0",
    "#756bb1", "#9e9ac8", "#bcbddc", "#dadaeb",
    "#636363", "#969696", "#bdbdbd", "#d9d9d9"
  ]
}
categories = Object.keys(categoryColors)



done = (err) ->
  console.log "done"#, apiHash
  console.log "skipped #{missing} missing files"
  fs.writeFileSync "data/parsed/apis.json", JSON.stringify(apiHash)
  fs.writeFileSync "data/parsed/colors.json", JSON.stringify(colorHash)
  fs.writeFileSync "data/parsed/blocks.json", JSON.stringify(allBlocks)
  fs.writeFileSync "data/parsed/blocks-min.json", JSON.stringify(minBlocks)
  fs.writeFileSync "data/parsed/blocks-api.json", JSON.stringify(apiBlocks)
  fs.writeFileSync "data/parsed/blocks-colors.json", JSON.stringify(colorBlocks)
  fs.writeFileSync "data/parsed/blocks-colors-min.json", JSON.stringify(colorBlocksMin)
  fs.writeFileSync "data/parsed/files-blocks.json", JSON.stringify(fileBlocks)

  libcsv = "url,count\n"
  Object.keys(libHash).forEach (lib) ->
    libcsv += lib + "," + libHash[lib] + "\n"
  fs.writeFileSync("data/parsed/libs.csv", libcsv)

  modulescsv = "module,count\n"
  Object.keys(moduleHash).forEach (module) ->
    modulescsv += module + "," + moduleHash[module] + "\n"
  fs.writeFileSync("data/parsed/modules.csv", modulescsv)

  console.log "err", err if err
  console.log "wrote #{apiBlocks.length} API blocks"
  console.log "wrote #{colorBlocks.length} Color blocks"
  console.log "wrote #{fileBlocks.length} Files blocks"
  console.log "wrote #{allBlocks.length} total blocks"

# read in the list of gist metadata
gistMeta = JSON.parse fs.readFileSync(__dirname + '/data/gist-meta.json').toString()
console.log gistMeta.length


pruneMin = (gist) ->
  pruned = {
    id: gist.id
    userId: gist.owner.login
    description: gist.description
    created_at: gist.created_at
    updated_at: gist.updated_at

  }
  if gist.files["thumbnail.png"]
    pruned.thumbnail = gist.files["thumbnail.png"].raw_url
  return pruned

pruneApi = (gist) ->
  pruned = {
    id: gist.id
    userId: gist.owner.login
    #userId: gist.userId
    description: gist.description
    created_at: gist.created_at
    updated_at: gist.updated_at
    api: gist.api
    #files: gist.files
  }
  if gist.files["thumbnail.png"]
    pruned.thumbnail = gist.files["thumbnail.png"].raw_url
  return pruned

pruneColors = (gist) ->
  pruned = {
    id: gist.id
    userId: gist.owner.login
    #userId: gist.userId
    description: gist.description
    created_at: gist.created_at
    updated_at: gist.updated_at
    colors: gist.colors
  }
  if gist.files["thumbnail.png"]
    pruned.thumbnail = gist.files["thumbnail.png"].raw_url
  return pruned

pruneColorsMin = (gist) ->
  pruned = {
    i: gist.id
    u: gist.owner.login
    c: Object.keys(gist.colors) || []
  }
  th = gist.files["thumbnail.png"]?.raw_url
  if th
    split = th.split '/raw/'
    commit = split[1].split('/thumbnail.png')[0]
    pruned.t = commit

  #if gist.files["thumbnail.png"]
  #  pruned.thumbnail = gist.files["thumbnail.png"].raw_url
  return pruned

pruneFiles = (gist) ->
  fileNames = Object.keys gist.files
  prunes = []
  fileNames.forEach (fileName) ->
    file = gist.files[fileName]
    pruned = {
      gistId: gist.id
      userId: gist.userId
      description: gist.description
      created_at: gist.created_at
      updated_at: gist.updated_at
      fileName: fileName,
      file: file
    }
    prunes.push pruned
  return prunes


parseD3Functions = (code) ->
  # we match d3.foo.bar( which will find plugins and unofficial api functions
  re = new RegExp(/d3\.[a-zA-Z0-9\.]*?\(/g)
  matches = code.match(re) or []
  return matches

parseApi = (code, gist, gapiHash) ->
  apis = parseD3Functions(code)
  apis.forEach (api) ->
    api = api.slice(0, api.length-1)
    #apiHash[api] = 0 unless apiHash[api]
    #apiHash[api]++
    gapiHash[api] = 0 unless gapiHash[api]
    gapiHash[api]++
  return apis.length


colorScales = (gapiHash, gcolorHash) ->
  categories.forEach (cat) ->
    if gapiHash[cat]
      colors = categoryColors[cat]
      colors.forEach (color) ->
        #colorHash[color] = 0 unless colorHash[color]
        #colorHash[color]++
        gcolorHash[color] = 0 unless gcolorHash[color]
        gcolorHash[color]++
  return 0

addColors = (code, re, gcolorHash) ->
  matches = code.match(re) or []
  matches.forEach (str) ->
    color = d3.rgb(str).toString().toLowerCase()
    #colorHash[color] = 0 unless colorHash[color]
    #colorHash[color]++
    gcolorHash[color] = 0 unless gcolorHash[color]
    gcolorHash[color]++
  return 0


parseColors = (code, gist, gcolorHash) ->
  hsl = /hsla?\(\s*(\d{1,3})\s*,\s*(\d{1,3}\%)\s*,\s*(\d{1,3}\%)\s*(?:\s*,\s*(\d+(?:\.\d+)?)\s*)?\)/g;
  hex = /#[a-fA-F0-9]{3,6}/g;
  #someone clever could combine these two
  rgb = /rgb\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})\)/g;
  rgba = /rgba\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})\)/g;
  addColors code, hsl, gcolorHash
  addColors code, hex, gcolorHash
  addColors code, rgb, gcolorHash
  addColors code, rgba, gcolorHash
  colorNames.forEach (c) ->
    re = new RegExp c.color, "gi"
    addColors code, re, gcolorHash

  return Object.keys(gcolorHash).length


parseScriptTags = (code) ->
  # anything with a // in it (signifiying url...)
  #re = new RegExp /<script.*?src=[\"\'](.*?\/\/.+?)[\"\'].*?>/g
  # anything with a .js in it
  re = new RegExp /<script.*?src=[\"\'](.*?\.js.*?)[\"\'].*?>/g
  matches = []
  match = re.exec(code)
  while match != null
    matches.push match[1]
    match = re.exec(code)
  return matches

parseLibs = (code, gist, glibHash) ->
  scripts = parseScriptTags(code)
  scripts.forEach (script) ->
    #console.log script
    #libHash[script] = 0 unless libHash[script]
    #libHash[script]++
  return 0

parseD3Version = (code) ->
  scripts = parseScriptTags(code)
  version = "NA"
  scripts.forEach (script) ->
    if script.indexOf("d3.v5") >= 0
      version = "v5"
    else if script.indexOf("d3.v4") >= 0
      version = "v4"
    else if script.indexOf("d3/3.") >= 0 or script.indexOf("d3.v3") >= 0
      version = "v3"
    if script.indexOf("d3.v2") >= 0
      version = "v2"
    else if script.indexOf("d3.js") >= 0 or script.indexOf("d3.min.js") >=0
      # we know this is some sort of d3 but not which version
      if version == "NA"
        version = "IDK"
  #console.log version
  return version


parseD3Modules = (code, gistModuleHash) ->
  # finds anything with the pattern d3-*. e.g. d3-legend.js or d3-transition.v1.min.js
  # TODO:
  # d3.geo.projection/raster/tile/polyhedron
  # d3.tip
  scripts = parseScriptTags(code)
  scripts.forEach (script) ->
    re = /(d3-[a-z]*?)\./
    #module = script.match(re)
    matches = re.exec(script)
    return unless matches and matches.length
    module = matches[1]
    #console.log module
    #console.log script
    #moduleHash[module] = 0 unless moduleHash[module]
    #moduleHash[module]++
    gistModuleHash[module] = 0 unless gistModuleHash[module]
    gistModuleHash[module]++
  return 0


i = 0
gistParser = (gist, gistCb) ->
  #console.log "NOT RETURNING", gist.id, singleId
  i++
  console.log i, gist.id
  fileNames = Object.keys gist.files
  # per-gist cache of api functions that we build up in place
  gapiHash = {}
  glibHash = {}
  gistModuleHash = {}
  gcolorHash = {}
  folder = __dirname + "/" + "data/gists-files/" + gist.id
  fs.mkdir folder, ->

  # we make a simplified data object for each file
  filepruned = pruneFiles gist
  fileBlocks = fileBlocks.concat filepruned

  async.each fileNames, (fileName, fileCb) ->
    ext = path.extname(fileName)
    if ext in [".html", ".js", ".coffee", ".md", ".json", ".csv", ".tsv", ".css"]
      file = folder + "/" + fileName
      fs.readFile file, (err, data) ->
        return fileCb() unless data
        contents = data.toString()
        if fileName == "index.html"
          # TODO copy glibHash -> libHash etc for each of these
          numLibs = parseLibs contents, gist, glibHash
          version = parseD3Version contents
          modules = parseD3Modules contents, gistModuleHash
          gist.d3version = version
        if ext in [".html", ".js", ".coffee"]
          # TODO copy gapiHash -> apiHash etc for each of these
          numApis = parseApi contents, gist, gapiHash
          numColors = parseColors contents, gist, gcolorHash
          colorScales gapiHash, gcolorHash
          #console.log gist.id, fileName, numApis, numColors
          return fileCb()
        else if ext in ['.tsv', '.csv']
          # pull out # of rows and # of columns
          return fileCb()
        else if ext in ['.css']
          numColors = parseColors contents, gist, gcolorHash
          #console.log gist.id, fileName, 0, numColors
          return fileCb()
        else
          #console.log gist.id, fileName
          return fileCb()
    else
      return fileCb()
  , () ->
    if Object.keys(gapiHash).length > 0
      gist.api = gapiHash
      apiBlocks.push pruneApi(gist)
    if Object.keys(gistModuleHash).length > 0
      gist.d3modules = gistModuleHash
    if Object.keys(gcolorHash).length > 0
      gist.colors = gcolorHash
      colorBlocks.push pruneColors(gist)
      colorBlocksMin.push pruneColorsMin(gist)
    # if Object.keys(glibHash).length > 0
    #   gist.libs = glibHash

    #delete gist.files
    if gist.files["thumbnail.png"]
      gist.thumbnail = gist.files["thumbnail.png"].raw_url
    allBlocks.push gist
    minBlocks.push pruneMin(gist)
    return gistCb()


module.exports = { api: parseApi, colors: parseColors, colorScales, d3version: parseD3Version, d3modules: parseD3Modules }

if require.main == module
  async.eachLimit gistMeta, 100, gistParser, done
