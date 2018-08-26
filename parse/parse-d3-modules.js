const parseScriptTags = require('./parse-script-tags.js')

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

module.exports = parseD3Modules
