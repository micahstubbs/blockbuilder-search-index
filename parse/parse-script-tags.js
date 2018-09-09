const parseFileNameFromScriptTag = require('./parse-filename-from-script-tag.js')

const parseScriptTags = function({
  code,
  scriptTagHash,
  scriptTagFilenamesHash
}) {
  // anything with a // in it (signifiying url...)
  //re = new RegExp /<script.*?src=[\"\'](.*?\/\/.+?)[\"\'].*?>/g
  // anything with a .js in it
  const re = new RegExp(/<script.*?src=[\"\'](.*?\.js.*?)[\"\'].*?>/g)
  const matches = code.match(re)

  console.log('matches', matches)

  matches.forEach(match => {
    const scriptTagString = match
    if (typeof scriptTagHash[scriptTagString] === 'undefined') {
      scriptTagHash[scriptTagString] = 0
    }
    scriptTagHash[scriptTagString] += 1
    // as a side effect
    // parse the filename out from the script tag
    parseFileNameFromScriptTag({ scriptTagString, scriptTagFilenamesHash })
    //
  })

  return matches
}

module.exports = parseScriptTags
