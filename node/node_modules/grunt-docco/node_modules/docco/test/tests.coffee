
{spawn, exec} = require 'child_process'
path          = require 'path'
fs            = require 'fs'

# Determine the test and resources paths
testPath      = path.dirname fs.realpathSync(__filename)
dataPath      = path.join testPath, "data"
resourcesPath = path.normalize path.join(testPath,"/../resources")

# Run a Docco pass and check that the number of output files
# is equal to what is expected.
testDoccoRun = (testName,sources,options=null,callback=null) ->
  destPath = path.join dataPath, testName
  cleanup = (callback) -> exec "rm -rf #{destPath}", callback
  cleanup ->
    options?.output = destPath
    Docco.document sources, options, ->
      files       = []
      files       = files.concat(Docco.resolveSource(src)) for src in sources
      expected    = files.length + 1
      found       = fs.readdirSync(destPath).length
      eq found, expected, "find expected output (#{expected} files) - (#{found})"
      callback() if callback?

# **Custom jst template files should be supported**
test "custom JST template file", ->
  testDoccoRun "custom_jst", 
    ["#{testPath}/*.coffee"],
    template: "#{resourcesPath}/pagelet.jst"

# **Custom CSS files should be supported**
test "custom CSS file", ->
  testDoccoRun "custom_css", 
    ["#{testPath}/*.coffee"],
    css: "#{resourcesPath}/pagelet.css"

# **Comments should be parsed properly**
#  
# There are special data files located in `test/comments` for each supported 
# language.  The first comment in  each file corresponds to the expected number 
# of comments to be parsed from its contents.
#  
# This test iterates over all the known Docco languages, and tests the ones 
# that have a corresponding data file in `test/comments`.
test "single line comment parsing", ->
  commentsPath = path.join testPath, "comments"
  options           = template: "#{commentsPath}/comments.jst"
  languageKeys = (ext for ext,l of Docco.languages)

  testNextLanguage = (keys,callback) ->
    return callback?() if not keys.length

    extension       = keys.shift()
    language        = Docco.languages[extension]
    languageExample = path.join commentsPath, "#{language.name}#{extension}"
    languageTest    = "comments_test/#{language.name}"
    languagePath    = path.join dataPath, languageTest
    languageOutput  = path.join languagePath, "#{language.name}.html"

    # *Skip over this language if there is no corresponding test*
    return testNextLanguage(keys, callback) if not path.existsSync languageExample   
   
    testDoccoRun languageTest, [languageExample], options, ->
      eq true, path.existsSync(languageOutput), "#{languageOutput} -> output file created properly"

      content = fs.readFileSync(languageOutput).toString()
      comments = (c.trim() for c in content.split(',') when c.trim() != '') 

      eq true, comments.length >= 1, 'expect at least the descriptor comment'

      expected = parseInt(comments[0])    
      
      eq comments.length, expected, [
        ""
        "#{path.basename(languageOutput)} comments"
        "------------------------"
        " expected : #{expected}"
        " found    : #{comments.length}"
      ].join '\n'
      
      testNextLanguage keys, callback
      
  # *Kick off the first language test*
  testNextLanguage languageKeys.slice()
     
