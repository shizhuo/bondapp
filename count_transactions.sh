#!/bin/bash

count=0
for d in data/*
do
	for f in $d/*
	do 
		#echo ./$f
		c=$(nodejs count.js ./$f)
		count=$((count+$c))
		#echo $c
		#echo $count	
	done
done
echo $count
