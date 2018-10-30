# here is the log of a d3 blocks metadata update run
# this log assumes that:
#
#  1) we have already updated before, and only need to check since the last update date
#     (which in our case was ~20180120.  we'll get everything since 2018-01-19T00:00:00Z 
#      to be safe) 
#  2) we are not worried about validating that users have at least one
#
# note: 
#   each command shows a sample of what the terminal output 
#   should look like if command runs successfully


BLOCKBUILDER_SEARCH_INDEX_HOME="/Users/m/workspace/blockbuilder-search-index"
UPDATE_AFTER_TIMESTAMP="2018-09-07T00:00:00Z"

cd $BLOCKBUILDER_SEARCH_INDEX_HOME

coffee combine-users.coffee
# 205 users from blocks links in SO
# 468 users from blocks links in knight course
# 4524 users added from bb
# 199 added from manual list of users
# 37 users added from blocksplorer
# 5433 users total

#
# optionally get all blocks for new users 
# for all time
#
# TODO implement bash if else to check if 
# the file data/new.json exists
# if yes, run this command. if no, do nothing
#  
#
# if no new users found, do not run this update
#
coffee gist-meta.coffee data/new.json '' 'new-users'


#
# fetch the metadata for all new gists
# for all known users from the github API
#
# TODO: automate dates in filename here
# something like $UPDATE_AFTER_TIMESTAMP to $TODAY-1
coffee gist-meta.coffee data/latest-20180907-to-20181029.json $UPDATE_AFTER_TIMESTAMP
# done with zzhang115, found 0 gists
# rate limit remaining 947
# done with zzolo, found 0 gists
# rate limit remaining 946
# done with zukethenuke, found 0 gists
# done. number of new gists: 1081
# combining 1081 with 37508 existing blocks
# writing 38175 blocks to data/gist-meta.json
# writing 1081 to data/latest-20180907-to-20181029.json

#
# let's clone the gists we just found
#
coffee gist-cloner.coffee data/latest-20180907-to-20181029.json
# Already up-to-date.
# 6a31f4ef9e778d94c204 zross 0 From https://gist.github.com/6a31f4ef9e778d94c204
#  * branch            master     -> FETCH_HEAD

# already got 9893056
# From https://gist.github.com/9893056
#  * branch            master     -> FETCH_HEAD
# Already up-to-date.
# 9893056 zross 0 From https://gist.github.com/9893056
#  * branch            master     -> FETCH_HEAD

# done writing files
# Elasticsearch DEBUG: 2018-10-30T22:11:54Z
#   starting request { method: 'POST',
#     path: '/bbindexer/scripts',
#     body:
#      { script: 'content',
#        timeouts: [],
#        filename: 'data/latest-20180907-to-20181029.json',
#        ranAt: 2018-10-30T22:11:54.045Z },
#     query: {} }


# Elasticsearch TRACE: 2018-10-30T22:11:54Z
#   -> POST http://localhost:9200/bbindexer/scripts
#   {
#     "script": "content",
#     "timeouts": [],
#     "filename": "data/latest-20180907-to-20181029.json",
#     "ranAt": "2018-10-30T22:11:54.045Z"
#   }
#   <- 201
#   {
#     "_index": "bbindexer",
#     "_type": "scripts",
#     "_id": "PB4Ix2YBt3e9zqvafJ_n",
#     "_version": 1,
#     "result": "created",
#     "_shards": {
#       "total": 2,
#       "successful": 1,
#       "failed": 0
#     },
#     "_seq_no": 0,
#     "_primary_term": 1
#   }

# Elasticsearch DEBUG: 2018-10-30T22:11:54Z
#   Request complete

# indexed

#
# if no new users found, do not run this time
#
coffee gist-cloner.coffee data/new.json 

#
# index all the blocks in elasticsearch
#
# TODO: figure out if there is some argument
# to only index the new blocks that we just found
#
coffee --nodejs --max-old-space-size=12000 elasticsearch.coffee
# indexed 38170 d041815cfc669fc647f0271bbd3ff307
# indexed 38171 9e9cfd4ccea3a93038920f2d470e95f1
# indexed 38172 27167d4ebd58d33bc4d8c4dc196fbd84
# indexed 38173 05932b418560fd6530a008d230d1df28
# indexed 38174 c13aeeb98127ef1c04fac1ee619757e6
# indexed 38175 b71d7ff63199f268525f87a3d602cab6
# done
# skipped 0 missing files

coffee parse.coffee
# 38174 'c13aeeb98127ef1c04fac1ee619757e6'
# 38175 'b71d7ff63199f268525f87a3d602cab6'
# done
# skipped 0 missing files
# wrote 32624 API blocks
# wrote 33516 Color blocks
# wrote 153136 Files blocks
# wrote 38175 total blocks


node parse
#
# test out the new parsing script
#
# gist c13aeeb98127ef1c04fac1ee619757e6 y3l2n
# gist b71d7ff63199f268525f87a3d602cab6 y3l2n
# done
# skipped 0 missing files
# wrote 0 d3 API functions                                                     to blockbuilder-search-index/data/parsed-new-method/apis.json
# wrote 0 colors                                                               to blockbuilder-search-index/data/parsed-new-method/colors.json
# wrote 38175 block metadata entries                                           to blockbuilder-search-index/data/parsed-new-method/blocks.json
# wrote 38175 minified block metadata entries                                  to blockbuilder-search-index/data/parsed-new-method/blocks-min.json
# wrote 32624 single-block d3 API function lists                               to blockbuilder-search-index/data/parsed-new-method/blocks-api.json
# wrote 33516 colors entries                                                   to blockbuilder-search-index/data/parsed-new-method/blocks-colors.json
# wrote 33516 minified colors entries                                          to blockbuilder-search-index/data/parsed-new-method/blocks-colors-min.json
# wrote 0 file metadata entries                                                to blockbuilder-search-index/data/parsed-new-method/files-blocks.json
# wrote 7373 script tags                                                       to blockbuilder-search-index/data/metadata/script-tags.json
# wrote 7373 script tags and counts                                            to blockbuilder-search-index/data/metadata/script-tag-counts.json
# wrote 4254 filenames from script tags                                        to blockbuilder-search-index/data/metadata/script-tags-filenames.json
# wrote 4254 filenames and counts from script tags                             to blockbuilder-search-index/data/metadata/script-tags-filename-counts.json
# wrote 505 filenames from script tags that contain the string d3              to blockbuilder-search-index/data/metadata/script-tags-filenames-d3.json
# wrote 505 filenames and counts from script tags that contain the string d3   to blockbuilder-search-index/data/metadata/script-tags-filename-counts-d3.json
# wrote 14 gist metadata stats from this parsing run                           to blockbuilder-search-index/data/metadata/stats.json


cd data/parsed
pwd
# /Users/m/workspace/blockbuilder-search-index/data/parsed

#
# tada, we have some fresh blocks metadata files
#
ls -lAFh
# total 416696
# -rw-r--r--@ 1 m  staff   6.0K Mar 16  2018 .DS_Store
# -rw-r--r--  1 m  staff    26K Oct 30 15:26 apis.json
# -rw-r--r--  1 m  staff    10M Oct 30 15:26 blocks-api.json
# -rw-r--r--  1 m  staff   6.1M Oct 30 15:26 blocks-colors-min.json
# -rw-r--r--  1 m  staff    12M Oct 30 15:26 blocks-colors.json
# -rw-r--r--  1 m  staff   7.5M Oct 30 15:26 blocks-min.json
# -rw-r--r--  1 m  staff   105M Oct 30 15:26 blocks.json
# -rw-r--r--  1 m  staff   274K Oct 30 15:26 colors.json
# -rw-r--r--  1 m  staff    14K Aug 25 23:33 d3-api-functions.json
# -rw-r--r--  1 m  staff    59M Oct 30 15:26 files-blocks.json
# -rw-r--r--  1 m  staff   313K Oct 30 15:26 libs.csv
# -rw-r--r--  1 m  staff   1.2K Oct 30 15:26 modules.csv
# -rw-r--r--  1 m  staff   3.6M Aug 14  2017 readme-blocks-graph.json
# -rw-r--r--  1 m  staff   173K Aug 26 22:57 script-tags.json

#
# now let's call another shell script to generate the 
# blocks graph metadata
#
cd $BLOCKBUILDER_SEARCH_INDEX_HOME
sh update-pipeline-blocks-graph.sh
