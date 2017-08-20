const fs = require('fs');
const d3 = require('d3');

const gistCountsString = fs
  .readFileSync('data/gist-counts-by-user.csv')
  .toString();
const gistCounts = d3.csv.parse(gistCountsString);

let usersWithGists = [];

gistCounts.forEach(d => {
  if (typeof d.gistCount !== 'undefined' && d.gistCount > 0) {
    usersWithGists.push(d.username);
  }
});

usersWithGists = usersWithGists.sort();
const csvString = `username\n${usersWithGists.join('\n')}`;
console.log(`${usersWithGists.length} have at least 1 gist`);
fs.writeFileSync('data/usables.csv', csvString);
