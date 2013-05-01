(function() {
  // Get any jquery=___ param from the query string.
  var jqversion = location.search.match(/[?&]jquery=(.*?)(?=&|$)/);
  var path;
  if (jqversion) {
    // A version was specified, load that version from code.jquery.com.
    path = 'http://code.jquery.com/jquery-' + jqversion[1] + '.js';
  } else {
    // No version was specified, load the local version.
    path = '../libs/jquery/jquery.js';
  }
  // This is the only time I'll ever use document.write, I promise!
  document.write('<script src="' + path + '"></script>');
}());
