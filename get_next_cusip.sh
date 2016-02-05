#!/bin/bash

cusip=$(redis-cli -h proliant lpop cusip)
echo $cusip
