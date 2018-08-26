const parseD3Functions = function(code) {
  // we match d3.foo.bar( which will find plugins and unofficial api functions
  const re = new RegExp(/d3\.[a-zA-Z0-9\.]*?\(/g)
  const matches = code.match(re) || []
  return matches
}

module.exports = parseD3Functions
