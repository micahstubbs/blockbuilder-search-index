const pruneColorsMin = function(gist) {
  const pruned = {
    i: gist.id,
    u: gist.owner.login,
    c: Object.keys(gist.colors) || []
  }
  const th =
    gist.files['thumbnail.png'] != null
      ? gist.files['thumbnail.png'].raw_url
      : undefined
  if (th) {
    const split = th.split('/raw/')
    const commit = split[1].split('/thumbnail.png')[0]
    pruned.t = commit
  }

  //if gist.files["thumbnail.png"]
  //  pruned.thumbnail = gist.files["thumbnail.png"].raw_url
  return pruned
}

module.exports = pruneColorsMin
