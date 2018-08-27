const parseScriptTags = require('./parse-script-tags.js')

const parseD3Modules = function({
  code,
  moduleHash,
  gistModuleHash,
  scriptTags,
  scriptTagsSet
}) {
  // console.log('code from parse-d3-modules', code)

  // finds anything with the pattern d3-*. e.g. d3-legend.js or d3-transition.v1.min.js
  // TODO:
  // d3.geo.projection/raster/tile/polyhedron
  // d3.tip

  // only parse scriptTags if passed in scriptTags prop is falsy
  const scripts = scriptTags || parseScriptTags({ code, scriptTagsSet })
  // console.log('scripts from parse-d3-modules', scripts)

  scripts.forEach(function(script) {
    const re = /(d3-[\w-]*)(?=\.)/
    //module = script.match(re)
    const matches = re.exec(script)
    // console.log('matches', matches)
    if (!matches || !matches.length) {
      return
    }
    const module = matches[1]
    // console.log('module found', module)

    if (!moduleHash[module]) {
      moduleHash[module] = 0
    }
    moduleHash[module]++

    if (!gistModuleHash[module]) {
      gistModuleHash[module] = 0
    }
    // console.log('gistModuleHash from parse-d3-modules', gistModuleHash)
    return gistModuleHash[module]++
  })
  const modules = Object.keys(gistModuleHash)
  return modules
}

module.exports = parseD3Modules
