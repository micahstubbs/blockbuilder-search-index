const d3 = require('d3')

const addColors = function(code, re, gcolorHash) {
  const matches = code.match(re) || []
  matches.forEach(function(str) {
    const color = d3
      .rgb(str)
      .toString()
      .toLowerCase()
    //colorHash[color] = 0 unless colorHash[color]
    //colorHash[color]++
    if (!gcolorHash[color]) {
      gcolorHash[color] = 0
    }
    return gcolorHash[color]++
  })
  return 0
}

module.exports = addColors
