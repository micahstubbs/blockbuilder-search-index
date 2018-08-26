const categoryColors = require('./category-colors.json')

const colorScales = function(gapiHash, gcolorHash) {
  const categories = Object.keys(categoryColors)
  categories.forEach(function(cat) {
    if (gapiHash[cat]) {
      const colors = categoryColors[cat]
      return colors.forEach(function(color) {
        //colorHash[color] = 0 unless colorHash[color]
        //colorHash[color]++
        if (!gcolorHash[color]) {
          gcolorHash[color] = 0
        }
        return gcolorHash[color]++
      })
    }
  })
  return 0
}

module.exports = colorScales
