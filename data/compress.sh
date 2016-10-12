# https://coolestguidesontheplanet.com/how-to-compress-and-uncompress-files-and-folders-in-os-x-lion-10-7-using-terminal/
# compress blocks metadata without Mac metadata files
zip -r -X blocks-metadata-20161010.zip parsed

tar -zcvf blocks-metadata-20161010.tar.gz parsed