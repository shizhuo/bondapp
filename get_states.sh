#!/bin/bash
str='['
for i in data/2015-01-01/*
do
	str=$(echo $str '"'$(echo $i | cut -d'/' -f 3 | cut -d'.' -f 1)'"',)
	#echo $str
done

str=$str'""]'
echo $str > states.json
