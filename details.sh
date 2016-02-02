#!/bin/bash
#get the details of each cusip number under dir $1

count=0
d1=cusip2/$1
#for d1 in cusip2/$1/*
#do
	for d2 in $d1/*
	do 
		for d3 in $d2/*
		do
			for d4 in $d3/*
			do
				count=$((count+1))
				cusip=$(echo $d4 | cut -d'/' -f 5 | cut -d'.' -f 1)
				f=$(echo $d4 | cut -d'.' -f 1 | cut -b 8-100 ).json 
				path=$(echo details/$f);
				echo $cusip 
				echo $path
				[ -f $path ] && echo 'file exist' || casperjs bond_details.js $cusip
			done
		done
	done
#done
echo processed $count cusips
