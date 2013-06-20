#!/bin/bash

for node in node06 node08 node; do
  echo "Testing with $(${node} --version)..."
  ${node} node_modules/vows/bin/vows test/*test.js
done
