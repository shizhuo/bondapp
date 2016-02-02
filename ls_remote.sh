#!/bin/bash

path=$1
files=`ssh proliant ls ~/node/bondapp/$path`
for f in $files
do
	echo $f
	fs=`ssh proliant ls ~/node/bondapp/$path/$f/`
	echo $fs
done
