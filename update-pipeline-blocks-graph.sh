#
# now let's generate an updated readme-blocks-graph.json
#

#
# first we copy over the blocks metadata from blockbuilder-search-index
#
BLOCKBUILDER_SEARCH_INDEX_HOME="/Users/m/workspace/blockbuilder-search-index"
README_VIS_HOME="/Users/m/workspace/readme-vis"
cd $README_VIS_HOME
cp -r $BLOCKBUILDER_SEARCH_INDEX_HOME/data/parsed/ $README_VIS_HOME/data/gist-metadata/input/

cd $README_VIS_HOME/data/scripts

node 01-gists-with-readme.js
# 29383 README.md files in the d3 gists corpus
#

node 01b-gists-users.js
# wrote 38175 gist ID, github username key, value pairs
# see the results at ../gist-metadata/output/gist-id-to-username.json
#

node 02-gists-with-readme-with-blocks-link.js
# 0 gists with unknown users
# 151 gists with missing files or folders
# 29383 README.md files in the d3 gists corpus
# of those README.md files
# 15356 contain links to bl.ocks.org
#

node 03a-generate-graph.js
# 10283 nodes
# 35693 links
# in the D3 README graph
#

# copy the generated blocks graph back to the blockbuilder-search-index project
cd $README_VIS_HOME
cp data/gist-metadata/output/readme-blocks-graph.json $BLOCKBUILDER_SEARCH_INDEX_HOME/data/parsed/