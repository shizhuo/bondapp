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
				count=$((count+1))
				echo $count
			done
		done
	done
done
