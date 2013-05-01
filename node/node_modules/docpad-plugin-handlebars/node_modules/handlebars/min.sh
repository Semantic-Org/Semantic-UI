rm dist/*

rake

for x in dist/*.js; do
  x=${x%.*}
  uglifyjs -c -m -- $x.js > $x.min.js
  gzip -c $x.min.js > $x.min.js.gz
done

ls -l dist | awk '{ print $9 "    " $5 }'
