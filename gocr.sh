#!/bin/bash
#$1 is the file name
#$2 is the field name 
#$3 is the index
R=`gocr $1`
echo '["'$1'","'$2'","'$R'","'$3'"]'

