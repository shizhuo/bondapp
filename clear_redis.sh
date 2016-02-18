#!/bin/bash

value=$(redis-cli lpop $1)

echo $value
while [[ $value != '' ]]
do
	value=$(redis-cli lpop $1)
	echo $value
done
