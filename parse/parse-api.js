const parseD3Functions = require('./parse-d3-functions.js')

const parseApi = function(code, gist, gapiHash) {
  const apis = parseD3Functions(code)
  apis.forEach(function(api) {
    api = api.slice(0, api.length - 1)
    //apiHash[api] = 0 unless apiHash[api]
    //apiHash[api]++
    if (!gapiHash[api]) {
      gapiHash[api] = 0
    }
    return gapiHash[api]++
  })
  return apis.length
}

module.exports = parseApi
