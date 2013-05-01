#!/usr/bin/env python

import argparse
import deflate
import inflate
from colorama import Fore

testDir = 'test-files'
outDir = 'test-outs'

allPassed = True

parser = argparse.ArgumentParser(description='Process command-line arguments')
parser.add_argument('--test', metavar='path/to/file', type=str, default='both', nargs='?', help='Which test to run: deflate, inflate, or both')
parser.add_argument('--file', '-f', metavar='path/to/file', type=str, nargs='?', help='Path to file to use for test')
parser.add_argument('--level', '-l', metavar='#', type=int, nargs='?', help='Compression level')
parser.add_argument('--no-delete', const=True, default=False, nargs='?', help='Don\'t delete files produced for test')

args = parser.parse_args()

delete = not getattr(args, 'no_delete')
level = getattr(args, 'level')
inFile = getattr(args, 'file')
test = getattr(args, 'test')

if test == 'deflate' or test == 'both':
	print Fore.CYAN + 'Running deflate tests' + Fore.RESET

	passed = True

	if inFile != None:
		passed = deflate.runTest(inFile, level, delete, outDir)
	else:
		passed = deflate.runAll(level, delete, testDir, outDir)

	# if we fail one test, we fail the entire test	
	allPassed = allPassed and passed

if test == 'inflate' or test == 'both':
	print Fore.CYAN + 'Running inflate tests' + Fore.RESET

	passed = True

	if inFile != None:
		passed = inflate.runTest(inFile, level, delete, outDir)
	else:
		passed = inflate.runAll(level, delete, testDir, outDir)
	
	# if we fail one test, we fail the entire test	
	allPassed = allPassed and passed

if allPassed:
	print Fore.GREEN + 'All tests passed!' + Fore.RESET
else:
	print Fore.RED + 'Automated test failed' + Fore.RESET
