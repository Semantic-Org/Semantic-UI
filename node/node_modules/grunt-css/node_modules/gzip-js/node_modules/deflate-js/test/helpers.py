#!/usr/bin/env python

import zlib
import subprocess as sp

def deflate(filename, outfile=None, level=6):
	f = open(filename)
	data = f.read()
	f.close()

	compress = zlib.compressobj(
		level,                # level: 0-9
		zlib.DEFLATED,        # method: must be DEFLATED
		-zlib.MAX_WBITS,      # window size in bits:
		                      #   -15..-8: negate, suppress header
		                      #   8..15: normal
		                      #   16..30: subtract 16, gzip header
		zlib.DEF_MEM_LEVEL,   # mem level: 1..8/9
		0                     # strategy:
		                      #   0 = Z_DEFAULT_STRATEGY
		                      #   1 = Z_FILTERED
		                      #   2 = Z_HUFFMAN_ONLY
		                      #   3 = Z_RLE
		                      #   4 = Z_FIXED
	)
	deflated = compress.compress(data)
	deflated += compress.flush()

	if outfile != None:
		f = open(outfile, 'w')
		f.write(deflated)
		f.close()

	return deflated

def inflate(filename, outfile=None):
	f = open(filename)
	data = f.read()
	f.close()

	decompress = zlib.decompressobj(-zlib.MAX_WBITS)  # see above
	inflated = decompress.decompress(data)
	inflated += decompress.flush()

	if outfile != None:
		f = open(outfile, 'w')
		f.write(inflated)
		f.close()

	return inflated

"""
Convenience function for running a command bash-like

@param command- string version of a command to run on
@param shell- Whether to run this through the shell; used in subprocess.Popen (default: true)
@return Object with properties 'returncode', 'stdout', and 'stderr'
"""
def run_cmd(command, shell=True):
	process = sp.Popen(command, shell=shell, stdout = sp.PIPE, stderr = sp.PIPE)
	stdout, stderr = process.communicate()
	returncode = process.returncode
	return {'returncode' : returncode, 'stdout' : stdout, 'stderr' : stderr}
