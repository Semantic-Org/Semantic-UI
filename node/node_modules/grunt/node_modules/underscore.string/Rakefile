# encoding: utf-8
task default: :test

desc 'Use UglifyJS to compress Underscore.string'
task :build do
  require 'uglifier'
  source = File.read('lib/underscore.string.js')
  compressed = Uglifier.compile(source, copyright: false)
  File.open('dist/underscore.string.min.js', 'w'){ |f| f.write compressed }
  compression_rate = compressed.length.to_f/source.length
  puts "compressed dist/underscore.string.min.js: #{compressed.length}/#{source.length} #{(compression_rate * 100).round}%"
end

desc 'Run tests'
task :test do
  pid = spawn('bundle exec serve', err: '/dev/null')
  sleep 2

  puts "Running underscore.string test suite."
  result1 = system %{phantomjs ./test/run-qunit.js "http://localhost:4000/test/test.html"}

  puts "Running Underscore test suite."
  result2 = system %{phantomjs ./test/run-qunit.js "http://localhost:4000/test/test_underscore/test.html"}
  
  Process.kill 'INT', pid
  
  exit(result1 && result2 ? 0 : 1)
end