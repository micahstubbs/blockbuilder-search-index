const parseScriptTags = require('./parse-script-tags.js')

const parseLibs = function({ code, gist, glibHash, scriptTags }) {
  const scripts = parseScriptTags(code)
  scripts.forEach(function(script) {})
  //console.log script
  //libHash[script] = 0 unless libHash[script]
  //libHash[script]++
  return 0
}

module.exports = parseLibs
