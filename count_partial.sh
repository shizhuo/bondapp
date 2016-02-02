#!/bin/bash

count=0
for p in partial/*/*.json
do
	echo $p
	date=`echo $p | cut -d'/' -f 2`
	state=`echo $p | cut -d'/' -f 3 | cut -d'.' -f 1`
	yyyy=`echo $date | cut -d'-' -f 1`
	mm=`echo $date | cut -d'-' -f 2`
	dd=`echo $date | cut -d'-' -f 3`
	option=`nodejs get_state_index.js $state`
	str=$mm/$dd/$yyyy:$option
	echo $str
	redis-cli lpush partial $str
	count=$((count+1))
done
echo total $count partial files
