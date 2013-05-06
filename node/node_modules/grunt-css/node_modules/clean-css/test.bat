@echo off

pushd %~dp0

node .\node_modules\vows\bin\vows test\batch-test.js test\binary-test.js test\custom-test.js test\unit-test.js

popd

pause
