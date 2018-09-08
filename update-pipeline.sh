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
UPDATE_AFTER_TIMESTAMP="2018-08-23T00:00:00Z"

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
coffee gist-meta.coffee data/new.json '' 'new-users'
#
# not run this update, no new users found
#

#
# fetch the metadata for all new gists
# for all known users from the github API
#
coffee gist-meta.coffee data/latest-20180819-to-20180907.json $UPDATE_AFTER_TIMESTAMP
# rate limit remaining 178
# done with zzhang115, found 0 gists
# rate limit remaining 177
# done with zzolo, found 0 gists
# done. number of new gists: 349
# combining 349 with 37346 existing blocks
# writing 37508 blocks to data/gist-meta.json
# writing 349 to data/latest-20180819-to-20180907.json

#
# let's clone the gists we just found
#
coffee gist-cloner.coffee data/latest-20180819-to-20180907.json
# done writing files
# Elasticsearch DEBUG: 2018-09-08T19:06:13Z
#   starting request { method: 'POST',
#     path: '/bbindexer/scripts',
#     body:
#      { script: 'content',
#        timeouts: [],
#        filename: 'data/latest-20180819-to-20180907.json',
#        ranAt: 2018-09-08T19:06:13.084Z },
#     query: {} }


# Elasticsearch TRACE: 2018-09-08T19:06:13Z
#   -> POST https://localhost:9200/bbindexer/scripts
#   {
#     "script": "content",
#     "timeouts": [],
#     "filename": "data/latest-20180819-to-20180907.json",
#     "ranAt": "2018-09-08T19:06:13.084Z"
#   }
#   <- 0


coffee gist-cloner.coffee data/new.json 
#
# no new users found, not run this time
#

coffee --nodejs --max-old-space-size=12000 elasticsearch.coffee
# indexed 37504 604b907cdb944368a3d635d4f6663c6d
# indexed 37503 db1ac0efe50844239f20aa3762dd1729
# indexed 37507 35cc78e983f14aee9dc2ac571e6121ea
# indexed 37506 c92fa45bace8fc78be67c76d90e20979
# indexed 37501 44d27aa57120d799cc3f214976f716a2
# indexed 37502 f850022a5309d979ac8e99fa08b6d4aa
# done
# skipped 0 missing files

coffee parse.coffee
# 37507 '35cc78e983f14aee9dc2ac571e6121ea'
# 37508 '4d3450c295f1342f63b6bef88230e855'
# done
# skipped 0 missing files
# wrote 10446 API blocks
# wrote 11523 Color blocks
# wrote 150022 Files blocks
# wrote 37508 total blocks


cd data/parsed
pwd
# /Users/m/workspace/blockbuilder-search-index/data/parsed

#
# tada, we have some fresh blocks metadata files
#
ls -lAFh
# total 286816
# -rw-r--r--@ 1 m  staff   6.0K Mar 16 18:10 .DS_Store
# -rw-r--r--  1 m  staff     2B Aug 21 06:29 apis.json
# -rw-r--r--  1 m  staff   3.2M Aug 21 06:29 blocks-api.json
# -rw-r--r--  1 m  staff   2.2M Aug 21 06:29 blocks-colors-min.json
# -rw-r--r--  1 m  staff   4.2M Aug 21 06:29 blocks-colors.json
# -rw-r--r--  1 m  staff   5.9M Aug 21 06:29 blocks-min.json
# -rw-r--r--  1 m  staff    76M Aug 21 06:29 blocks.json
# -rw-r--r--  1 m  staff     2B Aug 21 06:29 colors.json
# -rw-r--r--  1 m  staff    45M Aug 21 06:29 files-blocks.json
# -rw-r--r--  1 m  staff    10B Aug 21 06:29 libs.csv
# -rw-r--r--  1 m  staff    13B Aug 21 06:29 modules.csv
# -rw-r--r--  1 m  staff   3.6M Aug 14  2017 readme-blocks-graph.json

#
# now let's call another shell script to generate the 
# blocks graph metadata
#
cd $BLOCKBUILDER_SEARCH_INDEX_HOME
sh update-pipeline-blocks-graph.sh
