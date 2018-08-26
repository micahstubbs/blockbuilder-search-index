const pruneFiles = function(gist) {
  const fileNames = Object.keys(gist.files)
  const prunes = []
  fileNames.forEach(function(fileName) {
    const file = gist.files[fileName]
    const pruned = {
      gistId: gist.id,
      userId: gist.userId,
      description: gist.description,
      created_at: gist.created_at,
      updated_at: gist.updated_at,
      fileName,
      file
    }
    return prunes.push(pruned)
  })
  return prunes
}

module.exports = pruneFiles
