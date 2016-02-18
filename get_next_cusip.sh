#!/bin/bash

cusip=$(redis-cli lpop cusip)
echo $cusip
