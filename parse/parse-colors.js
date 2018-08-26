const fs = require('fs')
const d3 = require('d3')

const addColors = require('./add-colors.js')

const parseColors = function(code, gist, gcolorHash) {
  const colorNames = d3.csv.parse(
    fs.readFileSync(__dirname + '/../data/colors.csv').toString()
  )
  const hsl = /hsla?\(\s*(\d{1,3})\s*,\s*(\d{1,3}\%)\s*,\s*(\d{1,3}\%)\s*(?:\s*,\s*(\d+(?:\.\d+)?)\s*)?\)/g
  const hex = /#[a-fA-F0-9]{3,6}/g
  //someone clever could combine these two
  const rgb = /rgb\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})\)/g
  const rgba = /rgba\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})\)/g
  addColors(code, hsl, gcolorHash)
  addColors(code, hex, gcolorHash)
  addColors(code, rgb, gcolorHash)
  addColors(code, rgba, gcolorHash)
  colorNames.forEach(function(c) {
    const re = new RegExp(c.color, 'gi')
    return addColors(code, re, gcolorHash)
  })

  return Object.keys(gcolorHash).length
}

module.exports = parseColors
