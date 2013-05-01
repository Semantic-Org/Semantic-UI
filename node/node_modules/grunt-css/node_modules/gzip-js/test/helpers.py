import subprocess as sp

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

