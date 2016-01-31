#!/bin/bash

for cusip in cusip/*
do
	echo $cusip
	file=$(echo $cusip | cut -d'/' -f 2)
	d1=$(echo $file | cut -b 1-2)
	d2=$(echo $file | cut -b 3-3)
	d3=$(echo $file | cut -b 4-4)
	path=$d1/$d2/$d3/$file
	mkdir -p `dirname cusip2/$path`
	cp $cusip cusip2/$path
done
