const fs = require('fs')

const writeJson = function({ filePath, data, min, message, compact }) {
  // pretty print with 2 spaces by default
  let space = 2
  let fullPath = `${filePath}`
  if (min) space = null
  let writeMessage = ''
  let jsonString = ''
  if (Array.isArray(data)) {
    writeMessage = `wrote ${data.length} ${message} to ${filePath}`
    // craft our own JSON string for arrays
    // goal: 2 spaces, with objects on one line
    const dataString = data
      .reduce((accumulator, currentValue) => {
        const dataRow = JSON.stringify(currentValue, null, 0)
        return `  ${accumulator}\n  ${dataRow},`
      }, '')
      .slice(0, -1)
    jsonString = `[${dataString}\n]\n`
  } else if (typeof data === 'object') {
    writeMessage = `wrote ${Object.keys(data).length} ${message} to ${filePath}`
    jsonString = JSON.stringify(data, null, space)
  } else {
    writeMessage = `wrote ${message} to ${filePath}`
    jsonString = JSON.stringify(data, null, space)
  }

  try {
    fs.writeFileSync(fullPath, jsonString)
    console.log(writeMessage)
  } catch (error) {
    console.log(`error writing ${fullPath}`)
    console.log(error)
  }
}

// replacer function
// function replacer(name, value) {
//   // convert RegExp to string
//   if (typeof value === 'object') {
//     return JSON.stringify(value, null, 0)
//   } else {
//     return value // return as is
//   }
// }

module.exports = writeJson
