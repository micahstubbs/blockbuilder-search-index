const pruneMin = function(gist) {
  const pruned = {
    id: gist.id,
    userId: gist.owner.login,
    description: gist.description,
    created_at: gist.created_at,
    updated_at: gist.updated_at
  }
  if (gist.files['thumbnail.png']) {
    pruned.thumbnail = gist.files['thumbnail.png'].raw_url
  }
  return pruned
}

module.exports = pruneMin
