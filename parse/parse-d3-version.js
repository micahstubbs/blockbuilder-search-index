const parseScriptTags = require('./parse-script-tags.js')

const parseD3Version = function({ code, scriptTags, scriptTagHash }) {
  // only parse scriptTags if passed in scriptTags prop is falsy
  const scripts = scriptTags || parseScriptTags({ code, scriptTagHash })

  let version = 'NA'
  scripts.forEach(function(script) {
    if (script.indexOf('d3.v5') > -1) {
      version = 'v5'
    } else if (script.indexOf('d3.v4') > -1) {
      version = 'v4'
    } else if (script.indexOf('d3/3.') > -1 || script.indexOf('d3.v3') > -1) {
      version = 'v3'
    }
    if (script.indexOf('d3.v2') > -1) {
      return (version = 'v2')
    } else if (
      script.indexOf('d3.js') > -1 ||
      script.indexOf('d3.min.js') > -1
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

module.exports = parseD3Version
