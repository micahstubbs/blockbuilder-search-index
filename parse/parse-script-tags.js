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

module.exports = parseScriptTags
