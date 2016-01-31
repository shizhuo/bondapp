#!/bin/bash

date=$(redis-cli -h proliant lpop queue)

while [[ $date != '' ]]
do
	#echo $date
	d=$(echo $date | cut -d':' -f 1)
	option=$(echo $date | cut -d':' -f 2)
	echo $d $option
	casperjs history.js $d $option	
	date=$(redis-cli -h proliant lpop queue)
done
