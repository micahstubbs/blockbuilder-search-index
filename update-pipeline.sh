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
# done with zischwartz, found 13 gists
# x-ratelimit-remaining: 1793
# x-ratelimit-remaining: 1792
# done with zzhang115, found 21 gists
#
# done. number of new gists: 7911
# combining 7911 with 29424 existing blocks
# writing 37303 blocks to data/gist-meta.json
# writing 7911 to data/new.json
#
# Elasticsearch DEBUG: 2018-08-26T00:18:45Z
#   starting request { method: 'POST',
#     path: '/bbindexer/scripts',
#     body:
#      { script: 'meta',
#        numBlocks: 7911,
#        filename: 'data/new.json',
#        since: 1970-01-01T00:00:00.000Z,
#        ranAt: 2018-08-26T00:18:45.212Z },
#     query: {} }


# Elasticsearch TRACE: 2018-08-26T00:18:45Z
#   -> POST http://localhost:9200/bbindexer/scripts
#   {
#     "script": "meta",
#     "numBlocks": 7911,
#     "filename": "data/new.json",
#     "since": "1970-01-01T00:00:00.000Z",
#     "ranAt": "2018-08-26T00:18:45.212Z"
#   }
#   <- 201
#   {
#     "_index": "bbindexer",
#     "_type": "scripts",
#     "_id": "E6aYc2UBizCTN0xZ553R",
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

# Elasticsearch DEBUG: 2018-08-26T00:18:45Z
#   Request complete

# indexed

#
# fetch the metadata for all new gists
# for all known users from the github API
#
coffee gist-meta.coffee data/latest-20180819-to-20180824.json $UPDATE_AFTER_TIMESTAMP
# done with zwakhall, found 0 gists
# x-ratelimit-remaining: 0
# done with zzolo, found 0 gists
#
# done. number of new gists: 57
# combining 57 with 37303 existing blocks
# writing 37321 blocks to data/gist-meta.json
# writing 57 to data/latest-20180819-to-20180824.json
#
# Elasticsearch DEBUG: 2018-08-26T00:25:16Z
#   starting request { method: 'POST',
#     path: '/bbindexer/scripts',
#     body:
#      { script: 'meta',
#        numBlocks: 57,
#        filename: 'data/latest-20180819-to-20180824.json',
#        since: '2018-08-19T00:00:00Z',
#        ranAt: 2018-08-26T00:25:16.854Z },
#     query: {} }


# Elasticsearch TRACE: 2018-08-26T00:25:16Z
#   -> POST http://localhost:9200/bbindexer/scripts
#   {
#     "script": "meta",
#     "numBlocks": 57,
#     "filename": "data/latest-20180819-to-20180824.json",
#     "since": "2018-08-19T00:00:00Z",
#     "ranAt": "2018-08-26T00:25:16.854Z"
#   }
#   <- 201
#   {
#     "_index": "bbindexer",
#     "_type": "scripts",
#     "_id": "FKaec2UBizCTN0xZ4Z1y",
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

# Elasticsearch DEBUG: 2018-08-26T00:25:16Z
#   Request complete

# indexed

#
# let's clone the gists we just found
#
coffee gist-cloner.coffee data/latest-20180819-to-20180824.json
# done writing files
# Elasticsearch DEBUG: 2018-08-26T00:40:39Z
#   starting request { method: 'POST',
#     path: '/bbindexer/scripts',
#     body:
#      { script: 'content',
#        timeouts: [],
#        filename: 'data/latest-20180819-to-20180824.json',
#        ranAt: 2018-08-26T00:40:39.108Z },
#     query: {} }
#
#
# Elasticsearch TRACE: 2018-08-26T00:40:39Z
#   -> POST http://localhost:9200/bbindexer/scripts
#   {
#     "script": "content",
#     "timeouts": [],
#     "filename": "data/latest-20180819-to-20180824.json",
#     "ranAt": "2018-08-26T00:40:39.108Z"
#   }
#   <- 201
#   {
#     "_index": "bbindexer",
#     "_type": "scripts",
#     "_id": "Faasc2UBizCTN0xZ853P",
#     "_version": 1,
#     "result": "created",
#     "_shards": {
#       "total": 2,
#       "successful": 1,
#       "failed": 0
#     },
#     "_seq_no": 1,
#     "_primary_term": 1
#   }
#
# Elasticsearch DEBUG: 2018-08-26T00:40:39Z
#   Request complete
#
# indexed

coffee gist-cloner.coffee data/new.json 
# 5cd3c864f7249642998fd03fb8271890 zzhang115 0 Cloning into '5cd3c864f7249642998fd03fb8271890'...
#
# 6c8ccda822c620731d0225599b7e3e12 zzhang115 0 Cloning into '6c8ccda822c620731d0225599b7e3e12'...
#
# done writing files
# Elasticsearch DEBUG: 2018-08-26T08:26:33Z
#   starting request { method: 'POST',
#     path: '/bbindexer/scripts',
#     body:
#      { script: 'content',
#        timeouts: [],
#        filename: 'data/new.json',
#        ranAt: 2018-08-26T08:26:33.281Z },
#     query: {} }
#
#
# Elasticsearch TRACE: 2018-08-26T08:26:33Z
#   -> POST http://localhost:9200/bbindexer/scripts
#   {
#     "script": "content",
#     "timeouts": [],
#     "filename": "data/new.json",
#     "ranAt": "2018-08-26T08:26:33.281Z"
#   }
#   <- 201
#   {
#     "_index": "bbindexer",
#     "_type": "scripts",
#     "_id": "FqZXdWUBizCTN0xZf53X",
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
#
# Elasticsearch DEBUG: 2018-08-26T08:26:33Z
#   Request complete
#
# indexed

coffee parse.coffee
# 37320 '0df732160f5eff68c6c683ef3a18f76e'
# 37321 'a6f6f4a4588b390ba866710e55c77c20'
# done
# skipped 0 missing files
# wrote 10445 API blocks
# wrote 11522 Color blocks
# wrote 149198 Files blocks
# wrote 37321 total blocks

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
