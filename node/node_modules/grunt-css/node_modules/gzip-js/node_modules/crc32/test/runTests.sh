#!/bin/bash

./genCheckValues.sh $1 > checkValues.txt
node test.js checkValues.txt $1
rm checkValues.txt
