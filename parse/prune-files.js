const pruneFiles = function({ gist, fileNames }) {
  const prunes = []
  fileNames.forEach(function(fileName) {
    const file = gist.files[fileName]
    const user = gist.userId || gist.owner.login
    const pruned = {
      gistId: gist.id,
      userId: user,
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
