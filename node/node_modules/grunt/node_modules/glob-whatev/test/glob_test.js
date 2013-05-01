var path = require('path');
var globsync = require('../lib/glob');

// Run tests from within "test" directory.
process.chdir('test');

// On Windows, convert all \ to /.
function normalize(filepath) {
  return process.platform === 'win32' ? filepath.replace(/\\/g, '/') : filepath;
}

function makeAbsolute(filepath) {
  var abspath = path.resolve(process.cwd(), filepath);
  if (/\/$/.test(filepath)) { abspath += '/'; }
  return abspath;
}

var allFiles = [
  'fixture/boot',
  'fixture/foo/',
  'fixture/foo/bar/',
  'fixture/foo/bar/baz/',
  'fixture/foo/bar/baz/boot',
  'fixture/foo/bar/boot',
  'fixture/foo/boot'
];

function fileList(arr, prefix) {
  return arr.map(function(i) {
    var filepath = allFiles[i];
    return prefix ? normalize(path.join(prefix, filepath)) : filepath;
  });
}

function relFileList(arr) {
  return fileList(arr).map(function(filepath) {
    // Strip leading fixture/ from each path
    return filepath.replace(/^fixture\//, '');
  });
}

exports['globsync'] = {
  'relative': function(test) {
    test.expect(13);
    test.deepEqual(globsync.glob('fixture/*'), fileList([0,1]), 'test/fixture/* should match');
    test.deepEqual(globsync.glob('fixture/foo'), fileList([1]), 'test/fixture/foo should match');
    test.deepEqual(globsync.glob('fixture/foo/'), fileList([1]), 'test/fixture/foo/ should match');
    test.deepEqual(globsync.glob('fixture/*/*'), fileList([2,6]), 'test/fixture/* should match');
    test.deepEqual(globsync.glob('fixture/**'), fileList([0,1,2,3,4,5,6]), 'test/fixture/** should match');
    test.deepEqual(globsync.glob('fixture/**/'), fileList([1,2,3]), 'test/fixture/**/ should match');
    test.deepEqual(globsync.glob('fixture/**/b*'), fileList([0,2,3,4,5,6]), 'test/fixture/**/b* should match');
    test.deepEqual(globsync.glob('fixture/**/b*/'), fileList([2,3]), 'test/fixture/**/b*/ should match');
    test.deepEqual(globsync.glob('fixture/**/b??'), fileList([2,3]), 'test/fixture/**/b?? should match');
    test.deepEqual(globsync.glob('fixture/**/b???'), fileList([0,4,5,6]), 'test/fixture/**/b??? should match');
    test.deepEqual(globsync.glob('fixture/**/?oo'), fileList([1]), 'test/fixture/**/?oo should match');
    test.deepEqual(globsync.glob('fixture/fail'), [], 'test/fixture/fail should match nothing (and not fail)');
    test.deepEqual(globsync.glob('fixture/fail/*'), [], 'test/fixture/fail/* should match nothing (and not fail)');
    test.done();
  },
  'absolute': function(test) {
    test.expect(11);
    var prefix = path.resolve(process.cwd());
    test.deepEqual(globsync.glob(makeAbsolute('fixture/*')), fileList([0,1], prefix), makeAbsolute('test/fixture/*') + ' should match');
    test.deepEqual(globsync.glob(makeAbsolute('fixture/foo')), fileList([1], prefix), makeAbsolute('test/fixture/foo') + ' should match');
    test.deepEqual(globsync.glob(makeAbsolute('fixture/foo/')), fileList([1], prefix), makeAbsolute('test/fixture/foo/') + ' should match');
    test.deepEqual(globsync.glob(makeAbsolute('fixture/*/*')), fileList([2,6], prefix), makeAbsolute('test/fixture/*/*') + ' should match');
    test.deepEqual(globsync.glob(makeAbsolute('fixture/**')), fileList([0,1,2,3,4,5,6], prefix), makeAbsolute('test/fixture/**') + ' should match');
    test.deepEqual(globsync.glob(makeAbsolute('fixture/**/')), fileList([1,2,3], prefix), makeAbsolute('test/fixture/**/') + ' should match');
    test.deepEqual(globsync.glob(makeAbsolute('fixture/**/b*')), fileList([0,2,3,4,5,6], prefix), makeAbsolute('test/fixture/**/b*') + ' should match');
    test.deepEqual(globsync.glob(makeAbsolute('fixture/**/b*/')), fileList([2,3], prefix), makeAbsolute('test/fixture/**/b*/') + ' should match');
    test.deepEqual(globsync.glob(makeAbsolute('fixture/**/b??')), fileList([2,3], prefix), makeAbsolute('test/fixture/**/b??') + ' should match');
    test.deepEqual(globsync.glob(makeAbsolute('fixture/**/b???')), fileList([0,4,5,6], prefix), makeAbsolute('test/fixture/**/b???') + ' should match');
    test.deepEqual(globsync.glob(makeAbsolute('fixture/**/?oo')), fileList([1], prefix), makeAbsolute('test/fixture/**/?oo') + ' should match');
    test.done();
  },
  'wacky': function(test) {
    test.expect(11);
    process.chdir('../lib');
    var prefix = '../test/';
    test.deepEqual(globsync.glob('../test/fixture/*'), fileList([0,1], prefix), '../test/fixture/* should match');
    test.deepEqual(globsync.glob('../test/fixture/foo'), fileList([1], prefix), '../test/fixture/foo should match');
    test.deepEqual(globsync.glob('../test/fixture/foo/'), fileList([1], prefix), '../test/fixture/foo/ should match');
    test.deepEqual(globsync.glob('../test/fixture/*/*'), fileList([2,6], prefix), '../test/fixture/*/* should match');
    test.deepEqual(globsync.glob('../test/fixture/**'), fileList([0,1,2,3,4,5,6], prefix), '../test/fixture/** should match');
    test.deepEqual(globsync.glob('../test/fixture/**/'), fileList([1,2,3], prefix), '../test/fixture/**/ should match');
    test.deepEqual(globsync.glob('../test/fixture/**/b*'), fileList([0,2,3,4,5,6], prefix), '../test/fixture/**/b* should match');
    test.deepEqual(globsync.glob('../test/fixture/**/b*/'), fileList([2,3], prefix), '../test/fixture/**/b*/ should match');
    test.deepEqual(globsync.glob('../test/fixture/**/b??'), fileList([2,3], prefix), '../test/fixture/**/b?? should match');
    test.deepEqual(globsync.glob('../test/fixture/**/b???'), fileList([0,4,5,6], prefix), '../test/fixture/**/b??? should match');
    test.deepEqual(globsync.glob('../test/fixture/**/?oo'), fileList([1], prefix), '../test/fixture/**/?oo should match');
    process.chdir('../test');
    test.done();
  },
  'options.matchBase': function(test) {
    test.expect(3);
    test.deepEqual(globsync.glob('boot', {matchBase: true}), fileList([0, 4, 5, 6], ''), 'should match.');
    test.deepEqual(globsync.glob('**/boot', {matchBase: true}), fileList([0, 4, 5, 6], ''), 'should match.');
    test.deepEqual(globsync.glob('**/b*/boot', {matchBase: true}), fileList([4, 5], ''), 'should match.');
    test.done();
  },
  'options.cwd': function(test) {
    test.expect(4);
    test.deepEqual(globsync.glob('**', {cwd: 'fixture'}), relFileList([0,1,2,3,4,5,6]), '** should match');
    test.deepEqual(globsync.glob('**', {cwd: 'fixture/'}), relFileList([0,1,2,3,4,5,6]), '** should match');
    test.deepEqual(globsync.glob('*', {cwd: 'fixture'}), relFileList([0,1]), '* should match');
    test.deepEqual(globsync.glob('*/', {cwd: 'fixture'}), relFileList([1]), '* should match');
    test.done();
  },
  'options.maxDepth': function(test) {
    test.expect(4);
    test.deepEqual(globsync.glob('fixture/**', {maxDepth: 1}), fileList([0,1]), 'maxDepth should limit search');
    test.deepEqual(globsync.glob('fixture/**', {maxDepth: 2}), fileList([0,1,2,6]), 'maxDepth should limit search');
    test.deepEqual(globsync.glob('**', {cwd: 'fixture', maxDepth: 1}), relFileList([0,1]), 'maxDepth should limit search');
    test.deepEqual(globsync.glob('**', {cwd: 'fixture', maxDepth: 2}), relFileList([0,1,2,6]), 'maxDepth should limit search');
    test.done();
  }
};
