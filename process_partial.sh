#!/bin/bash

str=`redis-cli lpop partial`
while [[ $str != '' ]]
do 
	date=`echo $str | cut -d':' -f 1`
	option=`echo $str | cut -d':' -f 2`
	echo $date $option
	casperjs history.js $date $option false
	str=`redis-cli lpop partial`
done
