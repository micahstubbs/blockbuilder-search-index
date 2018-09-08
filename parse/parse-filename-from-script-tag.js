const parseFileNameFromScriptTag = function({
  scriptTagString,
  scriptTagFilenamesSet
}) {
  // a pattern for filenames
  // positive lookbehind, requires nodejs >= v8.0.0
  const re = new RegExp(/(?<=\/?)[\w-\.]*/g)
  const matches = scriptTagString.match(re)
  // console.log('matches', matches)
  if (matches !== null) {
    // filename is the last match
    const filename = matches[matches.length - 2]
    scriptTagFilenamesSet.add(filename)
  }
}

module.exports = parseFileNameFromScriptTag
