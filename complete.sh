#!/bin/bash

date=$(redis-cli -h proliant lpop queue)

echo $date
while [[ $date != '' ]]
do
	#echo $date
	d=$(echo $date | cut -d':' -f 1)
	option=$(echo $date | cut -d':' -f 2)
	echo $d $option
	casperjs history.js $d $option true
	casperjs history.js $d $option false	
	date=$(redis-cli -h proliant lpop queue)
done
