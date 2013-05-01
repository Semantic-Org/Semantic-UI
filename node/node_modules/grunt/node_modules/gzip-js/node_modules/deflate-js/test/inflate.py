import os
from colorama import Fore
from helpers import deflate, inflate, run_cmd

outDirDefault = 'test-outs'
testDirDefault = 'test-files'

"""
Run a single test

@param tFile- required; the file to check against (uncompressed data)
@param level- optional (default: all); the compression level [1-9]
@param delete- optional (default: True); whether to delete the gzipped files
@return True if all tests passed; False if at least one test failed
"""
def runTest(tFile, level=None, delete=True, outDir=outDirDefault):
	passed = True

	if level == None:
		for x in range(1, 10):
			if runTest(tFile, x, delete) == False:
				passed = False

		return passed

	# make the test-outs directory
	try:
		os.mkdir(outDir)
	except:
		pass

	out1 = os.path.join(outDir, '%(file)s.%(level)d.deflate' % {'file': os.path.basename(tFile), 'level' : level})
	out2 = os.path.join(outDir, '%(file)s.%(level)d' % {'file' : os.path.basename(tFile), 'level' : level})

	deflate(tFile, outfile=out1, level=level)
	run_cmd('../bin/inflate.js --file %(file)s --output %(output)s' % {'level' : level, 'file' : out1, 'output' : out2})

	result = run_cmd('diff %(file1)s %(file2)s' % {'file1' : tFile, 'file2' : out2})
	if result['returncode'] == 0:
		status = Fore.GREEN + 'PASSED' + Fore.RESET
	else:
		passed = False
		status = Fore.RED + 'FAILED' + Fore.RESET
	
	print 'Level %(level)d: %(status)s' % {'level' : level, 'status' : status}

	if delete == True:
		os.remove(out1)
		os.remove(out2)

	return passed

"""
Runs all tests on the given level. This iterates throuth the testDir directory defined above.

@param level- The level to run on [1-9] (default: None, runs on all levels all)
@param delete- Whether to delete output files after the test is run
@return True if all levels passed, False if at least one failed
"""
def runAll(level=None, delete=True, testDir=testDirDefault, outDir=outDirDefault):
	# make the test-outs directory
	try:
		os.mkdir(outDir)
	except:
		pass

	passed = True
	for tFile in os.listdir(testDir):
		fullPath = os.path.join(testDir, tFile)

		print Fore.YELLOW + tFile + Fore.RESET

		if runTest(fullPath, level, delete) == False:
			passed = False

		print ''
	
	# if we deletede all the files that were created, delete the directory
	if delete == True:
		os.rmdir(outDir)
		return passed
