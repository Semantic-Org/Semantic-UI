#!/usr/bin/env python

import os
import sys
import shutil
from colorama import Fore
import argparse
import zipTest
import unzipTest

parser = argparse.ArgumentParser(description='Process command-line arguments')
parser.add_argument('--file', '-f', metavar='path/to/file', type=str, nargs='?', help='Path to file to use for test')
parser.add_argument('--level', '-l', metavar='#', type=int, nargs='?', help='Compression level')
parser.add_argument('--no-delete', const=True, default=False, nargs='?', help='Don\'t delete files produced for test')
parser.add_argument('--test', default='both', nargs='?', help='Which test to run (zip, unzip, both)')

args = parser.parse_args()

allPassed = True

outDir = 'test-outs'

# make the test-outs directory
try:
	os.mkdir(outDir)
except:
	pass

delete = not getattr(args, 'no_delete')
level = getattr(args, 'level')
inFile = getattr(args, 'file')
test = getattr(args, 'test')

if test == 'zip' or test == 'both':
	print Fore.CYAN + 'Running zip tests' + Fore.RESET
	# if the user specifies a file, only run that test
	if inFile != None:
		allPassed = zipTest.runTest(inFile, level)
	else:
		allPassed = zipTest.runAll(level)

if test == 'unzip' or test == 'both':
	print Fore.CYAN + 'Running unzip tests' + Fore.RESET
	# if the user specifies a file, only run that test
	if inFile != None:
		allPassed = unzipTest.runTest(inFile, level)
	else:
		allPassed = unzipTest.runAll(level)

if delete:
	shutil.rmtree(outDir)

if allPassed:
	print Fore.GREEN + 'All tests passed!' + Fore.RESET
else:
	print Fore.RED + 'Automated test failed' + Fore.RESET
	sys.exit(1)
