const fs = require('fs')

const writeJson = function({ filePath, data, min, message }) {
  // pretty print with 2 spaces by default
  let space = 2
  let fullPath = `${__dirname}${filepath}`
  if (min) space = null
  let writeMessage = ''
  if (Array.isArray(data)) {
    wroteMessage = `wrote ${data.length} ${message} to ${fullPath}`
  } else {
    wroteMessage = `wrote ${message} to ${fullPath}`
  }

  try {
    fs.writeFileSync(fullPath, JSON.stringify(data, null, space))
    console.log(writeMessage)
  } catch (error) {
    console.log(`error writing ${fullPath}`)
    console.log(error)
  }
}
