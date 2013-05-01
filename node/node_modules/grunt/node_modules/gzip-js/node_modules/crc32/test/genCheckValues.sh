#!/bin/bash

FILES=$1
: ${FILES:=./testFiles/*}

echo {

FIRST=1
for file in $FILES
do
	if [ $FIRST -eq 1 ]
	then
		FIRST=0
	else
		echo ,
	fi

	echo -n \"`basename $file`\" : \"0x`crc32 "$file"`\"
done

echo

echo }
