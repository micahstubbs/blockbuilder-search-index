const fs = require('fs')

const writeJson = function({ filePath, data, min, message }) {
  // pretty print with 2 spaces by default
  let space = 2
  let fullPath = `${filePath}`
  const trimmedPath = filePath.replace('/../', '')
  if (min) space = null
  let writeMessage = ''
  if (Array.isArray(data)) {
    writeMessage = `wrote ${data.length} ${message} to ${trimmedPath}`
  } else {
    writeMessage = `wrote ${message} to ${trimmedPath}`
  }

  try {
    fs.writeFileSync(fullPath, JSON.stringify(data, null, space))
    console.log(writeMessage)
  } catch (error) {
    console.log(`error writing ${fullPath}`)
    console.log(error)
  }
}

module.exports = writeJson
