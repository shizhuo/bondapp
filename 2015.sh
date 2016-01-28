#!/bin/bash
START=$1
DAYS=$2
for ((d = 0; d < $DAYS; d++))
do
	NOW=$(nodejs get_date.js $START $d)
	for i in {0..56}
	do 
		casperjs history.js $NOW $i
	done
done
