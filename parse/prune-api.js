const pruneApi = function(gist) {
  const pruned = {
    id: gist.id,
    userId: gist.owner.login,
    //userId: gist.userId
    description: gist.description,
    created_at: gist.created_at,
    updated_at: gist.updated_at,
    api: gist.api
    //files: gist.files
  }
  if (gist.files['thumbnail.png']) {
    pruned.thumbnail = gist.files['thumbnail.png'].raw_url
  }
  return pruned
}

module.exports = pruneApi
