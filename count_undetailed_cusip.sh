#!/bin/bash

count=0
for d1 in cusip2/*
do
	for d2 in $d1/*
	do
		for d3 in $d2/*
		do
			for d4 in $d3/*
			do
				cusip=`echo $d4 | cut -d'/' -f 5 | cut -d'.' -f 1	`
				p1=`echo $d4 | cut -d'/' -f 2,3,4,5 | cut -d'.' -f 1`
				dfile=details/$p1.json
				if [ ! -e $dfile ];  
				then
					redis-cli lpush cusip $cusip
					count=$((count+1))
				fi
			done
		done
	done
done
echo found $count undetaied cusips
