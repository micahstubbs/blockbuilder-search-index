const parseFileNameFromScriptTag = require('./parse-filename-from-script-tag.js')

const parseScriptTags = function({
  code,
  scriptTagsSet,
  scriptTagFilenamesHash
}) {
  // anything with a // in it (signifiying url...)
  //re = new RegExp /<script.*?src=[\"\'](.*?\/\/.+?)[\"\'].*?>/g
  // anything with a .js in it
  const re = new RegExp(/<script.*?src=[\"\'](.*?\.js.*?)[\"\'].*?>/g)
  const matches = []
  let match = re.exec(code)
  while (match !== null) {
    const scriptTagString = match[1]
    matches.push(scriptTagString)
    scriptTagsSet.add(scriptTagString)
    // as a side effect
    // parse the filename out from the script tag
    parseFileNameFromScriptTag({ scriptTagString, scriptTagFilenamesHash })
    //
    // not sure if this is having it's desired effect
    // TODO investigate this
    //
    match = re.exec(code)
  }
  return matches
}

module.exports = parseScriptTags
