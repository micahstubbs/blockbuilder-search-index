const parseScriptTags = require('./parse-script-tags.js')

const parseLibs = function({
  code,
  gist,
  glibHash,
  scriptTags,
  scriptTagsSet
}) {
  // only parse scriptTags if passed in scriptTags prop is falsy
  const scripts = scriptTags || parseScriptTags({ code, scriptTagsSet })

  scripts.forEach(function(script) {})
  //console.log script
  //libHash[script] = 0 unless libHash[script]
  //libHash[script]++
  return 0
}

module.exports = parseLibs
