#!/bin/bash

for d in data/*
do
	for f in $d/*
	do
		echo $f
		scp $f 
	done

done
