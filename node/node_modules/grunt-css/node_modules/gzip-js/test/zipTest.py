import os
from helpers import run_cmd
from colorama import Fore

defaultTestDir = 'test-files'
defaultOutDir = 'test-outs'

"""
Run a single test

@param tFile- required; the full path to the file to run
@param level- optional (default: all); the compression level [1-9]
@return True if all tests passed; False if at least one test failed
"""
def runTest(tFile, level=None, outDir=defaultOutDir):
	passed = True
	if level == None:
		for x in range(1, 10):
			if runTest(tFile, x, outDir) == False:
				passed = False

		return passed

	out1 = os.path.join(outDir, '%(file)s.%(level)d.gz' % {'file': os.path.basename(tFile), 'level' : level})
	out2 = os.path.join(outDir, '%(file)s.%(level)d.out.gz' % {'file': os.path.basename(tFile), 'level' : level})

	run_cmd('gzip -c -%(level)d %(file)s > %(outfile)s' % {'level' : level, 'file' : tFile, 'outfile' : out1})
	run_cmd('../bin/gzip.js --level %(level)d --file %(file)s --output %(output)s' % {'level' : level, 'file' : tFile, 'output' : out2})

	result = run_cmd('diff %(file1)s %(file2)s' % {'file1' : out1, 'file2' : out2})
	if result['returncode'] == 0:
		status = Fore.GREEN + 'PASSED' + Fore.RESET
	else:
		passed = False
		status = Fore.RED + 'FAILED' + Fore.RESET
	
	print 'Level %(level)d: %(status)s' % {'level' : level, 'status' : status}

	return passed

"""
Runs all tests on the given level. This iterates throuth the testDir directory defined above.

@param level- The level to run on [1-9] (default: None, runs on all levels all)
@return True if all levels passed, False if at least one failed
"""
def runAll(level=None, testDir=defaultTestDir):
	passed = True
	for tFile in os.listdir(testDir):
		fullPath = os.path.join(testDir, tFile)

		print Fore.YELLOW + tFile + Fore.RESET

		if runTest(fullPath, level) == False:
			passed = False

		print ''
	
	return passed

