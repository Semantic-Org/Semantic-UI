$(document).ready(function() {

  // Include Underscore.string methods to Underscore namespace
  _.mixin(_.str.exports());

  module('String extensions');

  test('Strings: trim', function() {
    equal(_.trim(123), '123', 'Non string');
    equal(_(' foo').trim(), 'foo');
    equal(_('foo ').trim(), 'foo');
    equal(_(' foo ').trim(), 'foo');
    equal(_('    foo     ').trim(), 'foo');
    equal(_('    foo     ').trim(' '), 'foo', 'Manually set whitespace');
    equal(_('\t    foo \t  ').trim(/\s/), 'foo', 'Manually set RegExp /\\s+/');

    equal(_('ffoo').trim('f'), 'oo');
    equal(_('ooff').trim('f'), 'oo');
    equal(_('ffooff').trim('f'), 'oo');


    equal(_('_-foobar-_').trim('_-'), 'foobar');

    equal(_('http://foo/').trim('/'), 'http://foo');
    equal(_('c:\\').trim('\\'), 'c:');

    equal(_(123).trim(), '123');
    equal(_(123).trim(3), '12');
    equal(_('').trim(), '', 'Trim empty string should return empty string');
    equal(_(null).trim(), '', 'Trim null should return empty string');
    equal(_(undefined).trim(), '', 'Trim undefined should return empty string');
  });

  test('String: levenshtein', function() {
    equal(_.levenshtein('Godfather', 'Godfather'), 0);
    equal(_.levenshtein('Godfather', 'Godfathe'), 1);
    equal(_.levenshtein('Godfather', 'odfather'), 1);
    equal(_.levenshtein('Godfather', 'Gdfthr'), 3);
    equal(_.levenshtein('seven', 'eight'), 5);
    equal(_.levenshtein('123', 123), 0);
    equal(_.levenshtein(321, '321'), 0);
    equal(_.levenshtein('lol', null), 3);
    equal(_.levenshtein('lol'), 3);
    equal(_.levenshtein(null, 'lol'), 3);
    equal(_.levenshtein(undefined, 'lol'), 3);
    equal(_.levenshtein(), 0);
  });

  test('Strings: ltrim', function() {
    equal(_(' foo').ltrim(), 'foo');
    equal(_('    foo').ltrim(), 'foo');
    equal(_('foo ').ltrim(), 'foo ');
    equal(_(' foo ').ltrim(), 'foo ');
    equal(_('').ltrim(), '', 'ltrim empty string should return empty string');
    equal(_(null).ltrim(), '', 'ltrim null should return empty string');
    equal(_(undefined).ltrim(), '', 'ltrim undefined should return empty string');

    equal(_('ffoo').ltrim('f'), 'oo');
    equal(_('ooff').ltrim('f'), 'ooff');
    equal(_('ffooff').ltrim('f'), 'ooff');

    equal(_('_-foobar-_').ltrim('_-'), 'foobar-_');

    equal(_(123).ltrim(1), '23');
  });

  test('Strings: rtrim', function() {
    equal(_('http://foo/').rtrim('/'), 'http://foo', 'clean trailing slash');
    equal(_(' foo').rtrim(), ' foo');
    equal(_('foo ').rtrim(), 'foo');
    equal(_('foo     ').rtrim(), 'foo');
    equal(_('foo  bar     ').rtrim(), 'foo  bar');
    equal(_(' foo ').rtrim(), ' foo');

    equal(_('ffoo').rtrim('f'), 'ffoo');
    equal(_('ooff').rtrim('f'), 'oo');
    equal(_('ffooff').rtrim('f'), 'ffoo');

    equal(_('_-foobar-_').rtrim('_-'), '_-foobar');

    equal(_(123).rtrim(3), '12');
    equal(_('').rtrim(), '', 'rtrim empty string should return empty string');
    equal(_(null).rtrim(), '', 'rtrim null should return empty string');
  });

  test('Strings: capitalize', function() {
    equal(_('fabio').capitalize(), 'Fabio', 'First letter is upper case');
    equal(_.capitalize('fabio'), 'Fabio', 'First letter is upper case');
    equal(_.capitalize('FOO'), 'FOO', 'Other letters unchanged');
    equal(_(123).capitalize(), '123', 'Non string');
    equal(_.capitalize(''), '', 'Capitalizing empty string returns empty string');
    equal(_.capitalize(null), '', 'Capitalizing null returns empty string');
    equal(_.capitalize(undefined), '', 'Capitalizing undefined returns empty string');
  });

  test('Strings: join', function() {
    equal(_.join('', 'foo', 'bar'), 'foobar', 'basic join');
    equal(_.join('', 1, 'foo', 2), '1foo2', 'join numbers and strings');
    equal(_.join(' ','foo', 'bar'), 'foo bar', 'join with spaces');
    equal(_.join('1', '2', '2'), '212', 'join number strings');
    equal(_.join(1, 2, 2), '212', 'join numbers');
    equal(_.join('','foo', null), 'foo', 'join null with string returns string');
    equal(_.join(null,'foo', 'bar'), 'foobar', 'join strings with null returns string');
    equal(_(' ').join('foo', 'bar'), 'foo bar', 'join object oriented');
  });

  test('Strings: reverse', function() {
    equal(_.str.reverse('foo'), 'oof' );
    equal(_.str.reverse('foobar'), 'raboof' );
    equal(_.str.reverse('foo bar'), 'rab oof' );
    equal(_.str.reverse('saippuakauppias'), 'saippuakauppias' );
    equal(_.str.reverse(123), '321', 'Non string');
    equal(_.str.reverse(123.45), '54.321', 'Non string');
    equal(_.str.reverse(''), '', 'reversing empty string returns empty string' );
    equal(_.str.reverse(null), '', 'reversing null returns empty string' );
    equal(_.str.reverse(undefined), '', 'reversing undefined returns empty string' );
  });

  test('Strings: clean', function() {
    equal(_(' foo    bar   ').clean(), 'foo bar');
    equal(_(123).clean(), '123');
    equal(_('').clean(), '', 'claning empty string returns empty string');
    equal(_(null).clean(), '', 'claning null returns empty string');
    equal(_(undefined).clean(), '', 'claning undefined returns empty string');
  });

  test('Strings: sprintf', function() {
    // Should be very tested function already.  Thanks to
    // http://www.diveintojavascript.com/projects/sprintf-for-javascript
    equal(_.sprintf('Hello %s', 'me'), 'Hello me', 'basic');
    equal(_('Hello %s').sprintf('me'), 'Hello me', 'object');
    equal(_('hello %s').chain().sprintf('me').capitalize().value(), 'Hello me', 'Chaining works');
    equal(_.sprintf('%.1f', 1.22222), '1.2', 'round');
    equal(_.sprintf('%.1f', 1.17), '1.2', 'round 2');
    equal(_.sprintf('%(id)d - %(name)s', {id: 824, name: 'Hello World'}), '824 - Hello World', 'Named replacements work');
    equal(_.sprintf('%(args[0].id)d - %(args[1].name)s', {args: [{id: 824}, {name: 'Hello World'}]}), '824 - Hello World', 'Named replacements with arrays work');
  });


  test('Strings: vsprintf', function() {
    equal(_.vsprintf('Hello %s', ['me']), 'Hello me', 'basic');
    equal(_('Hello %s').vsprintf(['me']), 'Hello me', 'object');
    equal(_('hello %s').chain().vsprintf(['me']).capitalize().value(), 'Hello me', 'Chaining works');
    equal(_.vsprintf('%.1f', [1.22222]), '1.2', 'round');
    equal(_.vsprintf('%.1f', [1.17]), '1.2', 'round 2');
    equal(_.vsprintf('%(id)d - %(name)s', [{id: 824, name: 'Hello World'}]), '824 - Hello World', 'Named replacement works');
    equal(_.vsprintf('%(args[0].id)d - %(args[1].name)s', [{args: [{id: 824}, {name: 'Hello World'}]}]), '824 - Hello World', 'Named replacement with arrays works');
  });

  test('Strings: startsWith', function() {
    ok(_('foobar').startsWith('foo'), 'foobar starts with foo');
    ok(!_('oobar').startsWith('foo'), 'oobar does not start with foo');
    ok(_(12345).startsWith(123), '12345 starts with 123');
    ok(!_(2345).startsWith(123), '2345 does not start with 123');
    ok(_('').startsWith(''), 'empty string starts with empty string');
    ok(_(null).startsWith(''), 'null starts with empty string');
    ok(!_(null).startsWith('foo'), 'null starts with foo');
  });

  test('Strings: endsWith', function() {
    ok(_('foobar').endsWith('bar'), 'foobar ends with bar');
    ok(_.endsWith('foobar', 'bar'), 'foobar ends with bar');
    ok(_.endsWith('00018-0000062.Plone.sdh264.1a7264e6912a91aa4a81b64dc5517df7b8875994.mp4', 'mp4'), 'endsWith .mp4');
    ok(!_('fooba').endsWith('bar'), 'fooba does not end with bar');
    ok(_.endsWith(12345, 45), '12345 ends with 45');
    ok(!_.endsWith(12345, 6), '12345 does not end with 6');
    ok(_('').endsWith(''), 'empty string ends with empty string');
    ok(_(null).endsWith(''), 'null ends with empty string');
    ok(!_(null).endsWith('foo'), 'null ends with foo');
  });

  test('Strings: include', function() {
    ok(_.str.include('foobar', 'bar'), 'foobar includes bar');
    ok(!_.str.include('foobar', 'buzz'), 'foobar does not includes buzz');
    ok(_.str.include(12345, 34), '12345 includes 34');
    ok(!_.str.contains(12345, 6), '12345 does not includes 6');
    ok(!_.str.include('', 34), 'empty string includes 34');
    ok(!_.str.include(null, 34), 'null includes 34');
    ok(_.str.include(null, ''), 'null includes empty string');
  });

  test('String: chop', function(){
    ok(_('whitespace').chop(2).length === 5, 'output [wh, it, es, pa, ce]');
    ok(_('whitespace').chop(3).length === 4, 'output [whi, tes, pac, e]');
    ok(_('whitespace').chop()[0].length === 10, 'output [whitespace]');
    ok(_(12345).chop(1).length === 5, 'output [1, 2, 3,  4, 5]');
  });

  test('String: clean', function(){
    equal(_.clean(' foo     bar   '), 'foo bar');
    equal(_.clean(''), '');
    equal(_.clean(null), '');
    equal(_.clean(1), '1');
  });

  test('String: count', function(){
    equal(_('Hello world').count('l'), 3);
    equal(_('Hello world').count('Hello'), 1);
    equal(_('Hello world').count('foo'), 0);
    equal(_('x.xx....x.x').count('x'), 5);
    equal(_('').count('x'), 0);
    equal(_(null).count('x'), 0);
    equal(_(undefined).count('x'), 0);
    equal(_(12345).count(1), 1);
    equal(_(11345).count(1), 2);
  });

  test('String: insert', function(){
    equal(_('Hello ').insert(6, 'Jessy'), 'Hello Jessy');
    equal(_('Hello ').insert(100, 'Jessy'), 'Hello Jessy');
    equal(_('').insert(100, 'Jessy'), 'Jessy');
    equal(_(null).insert(100, 'Jessy'), 'Jessy');
    equal(_(undefined).insert(100, 'Jessy'), 'Jessy');
    equal(_(12345).insert(6, 'Jessy'), '12345Jessy');
  });

  test('String: splice', function(){
    equal(_('https://edtsech@bitbucket.org/edtsech/underscore.strings').splice(30, 7, 'epeli'),
           'https://edtsech@bitbucket.org/epeli/underscore.strings');
    equal(_.splice(12345, 1, 2, 321), '132145', 'Non strings');
  });

  test('String: succ', function(){
    equal(_('a').succ(), 'b');
    equal(_('A').succ(), 'B');
    equal(_('+').succ(), ',');
    equal(_(1).succ(), '2');
  });

  test('String: titleize', function(){
    equal(_('the titleize string method').titleize(), 'The Titleize String Method');
    equal(_('the titleize string  method').titleize(), 'The Titleize String  Method');
    equal(_('').titleize(), '', 'Titleize empty string returns empty string');
    equal(_(null).titleize(), '', 'Titleize null returns empty string');
    equal(_(undefined).titleize(), '', 'Titleize undefined returns empty string');
    equal(_('let\'s have some fun').titleize(), 'Let\'s Have Some Fun');
    equal(_(123).titleize(), '123');
  });

  test('String: camelize', function(){
    equal(_('the_camelize_string_method').camelize(), 'theCamelizeStringMethod');
    equal(_('-the-camelize-string-method').camelize(), 'TheCamelizeStringMethod');
    equal(_('the camelize string method').camelize(), 'theCamelizeStringMethod');
    equal(_(' the camelize  string method').camelize(), 'theCamelizeStringMethod');
    equal(_('the camelize   string method').camelize(), 'theCamelizeStringMethod');
    equal(_('').camelize(), '', 'Camelize empty string returns empty string');
    equal(_(null).camelize(), '', 'Camelize null returns empty string');
    equal(_(undefined).camelize(), '', 'Camelize undefined returns empty string');
    equal(_(123).camelize(), '123');
  });

  test('String: underscored', function(){
    equal(_('the-underscored-string-method').underscored(), 'the_underscored_string_method');
    equal(_('theUnderscoredStringMethod').underscored(), 'the_underscored_string_method');
    equal(_('TheUnderscoredStringMethod').underscored(), 'the_underscored_string_method');
    equal(_(' the underscored  string method').underscored(), 'the_underscored_string_method');
    equal(_('').underscored(), '');
    equal(_(null).underscored(), '');
    equal(_(undefined).underscored(), '');
    equal(_(123).underscored(), '123');
  });

  test('String: dasherize', function(){
    equal(_('the_dasherize_string_method').dasherize(), 'the-dasherize-string-method');
    equal(_('TheDasherizeStringMethod').dasherize(), '-the-dasherize-string-method');
    equal(_('thisIsATest').dasherize(), 'this-is-a-test');
    equal(_('this Is A Test').dasherize(), 'this-is-a-test');
    equal(_('thisIsATest123').dasherize(), 'this-is-a-test123');
    equal(_('123thisIsATest').dasherize(), '123this-is-a-test');
    equal(_('the dasherize string method').dasherize(), 'the-dasherize-string-method');
    equal(_('the  dasherize string method  ').dasherize(), 'the-dasherize-string-method');
    equal(_('téléphone').dasherize(), 'téléphone');
    equal(_('foo$bar').dasherize(), 'foo$bar');
    equal(_('').dasherize(), '');
    equal(_(null).dasherize(), '');
    equal(_(undefined).dasherize(), '');
    equal(_(123).dasherize(), '123');
  });

  test('String: camelize', function(){
    equal(_.camelize('-moz-transform'), 'MozTransform');
    equal(_.camelize('webkit-transform'), 'webkitTransform');
    equal(_.camelize('under_scored'), 'underScored');
    equal(_.camelize(' with   spaces'), 'withSpaces');
    equal(_('').camelize(), '');
    equal(_(null).camelize(), '');
    equal(_(undefined).camelize(), '');
  });

  test('String: join', function(){
    equal(_.join(1, 2, 3, 4), '21314');
    equal(_.join('|', 'foo', 'bar', 'baz'), 'foo|bar|baz');
    equal(_.join('',2,3,null), '23');
    equal(_.join(null,2,3), '23');
  });

  test('String: classify', function(){
    equal(_.classify(1), '1');
    equal(_('some_class_name').classify(), 'SomeClassName');
    equal(_('my wonderfull class_name').classify(), 'MyWonderfullClassName');
    equal(_('my wonderfull.class.name').classify(), 'MyWonderfullClassName');
  });

  test('String: humanize', function(){
    equal(_('the_humanize_string_method').humanize(), 'The humanize string method');
    equal(_('ThehumanizeStringMethod').humanize(), 'Thehumanize string method');
    equal(_('the humanize string method').humanize(), 'The humanize string method');
    equal(_('the humanize_id string method_id').humanize(), 'The humanize id string method');
    equal(_('the  humanize string method  ').humanize(), 'The humanize string method');
    equal(_('   capitalize dash-CamelCase_underscore trim  ').humanize(), 'Capitalize dash camel case underscore trim');
    equal(_(123).humanize(), '123');
    equal(_('').humanize(), '');
    equal(_(null).humanize(), '');
    equal(_(undefined).humanize(), '');
  });

  test('String: truncate', function(){
    equal(_('Hello world').truncate(6, 'read more'), 'Hello read more');
    equal(_('Hello world').truncate(5), 'Hello...');
    equal(_('Hello').truncate(10), 'Hello');
    equal(_('').truncate(10), '');
    equal(_(null).truncate(10), '');
    equal(_(undefined).truncate(10), '');
    equal(_(1234567890).truncate(5), '12345...');
  });

  test('String: prune', function(){
    equal(_('Hello, cruel world').prune(6, ' read more'), 'Hello read more');
    equal(_('Hello, world').prune(5, 'read a lot more'), 'Hello, world');
    equal(_('Hello, world').prune(5), 'Hello...');
    equal(_('Hello, world').prune(8), 'Hello...');
    equal(_('Hello, cruel world').prune(15), 'Hello, cruel...');
    equal(_('Hello world').prune(22), 'Hello world');
    equal(_('Привет, жестокий мир').prune(6, ' read more'), 'Привет read more');
    equal(_('Привет, мир').prune(6, 'read a lot more'), 'Привет, мир');
    equal(_('Привет, мир').prune(6), 'Привет...');
    equal(_('Привет, мир').prune(8), 'Привет...');
    equal(_('Привет, жестокий мир').prune(16), 'Привет, жестокий...');
    equal(_('Привет, мир').prune(22), 'Привет, мир');
    equal(_('alksjd!!!!!!....').prune(100, ''), 'alksjd!!!!!!....');
    equal(_(123).prune(10), '123');
    equal(_(123).prune(1, 321), '321');
    equal(_('').prune(5), '');
    equal(_(null).prune(5), '');
    equal(_(undefined).prune(5), '');
  });

  test('String: isBlank', function(){
    ok(_('').isBlank());
    ok(_(' ').isBlank());
    ok(_('\n').isBlank());
    ok(!_('a').isBlank());
    ok(!_('0').isBlank());
    ok(!_(0).isBlank());
    ok(_('').isBlank());
    ok(_(null).isBlank());
    ok(_(undefined).isBlank());
  });

  test('String: escapeRegExp', function(){
    equal(_.escapeRegExp(/hello(?=\sworld)/.source), 'hello\\(\\?\\=\\\\sworld\\)', 'with lookahead');
    equal(_.escapeRegExp(/hello(?!\shell)/.source), 'hello\\(\\?\\!\\\\shell\\)', 'with negative lookahead');
  });

  test('String: escapeHTML', function(){
    equal(_('<div>Blah & "blah" & \'blah\'</div>').escapeHTML(),
             '&lt;div&gt;Blah &amp; &quot;blah&quot; &amp; &#39;blah&#39;&lt;/div&gt;');
    equal(_('&lt;').escapeHTML(), '&amp;lt;');
    equal(_(5).escapeHTML(), '5');
    equal(_('').escapeHTML(), '');
    equal(_(null).escapeHTML(), '');
    equal(_(undefined).escapeHTML(), '');
  });

  test('String: unescapeHTML', function(){
    equal(_('&lt;div&gt;Blah &amp; &quot;blah&quot; &amp; &apos;blah&#39;&lt;/div&gt;').unescapeHTML(),
             '<div>Blah & "blah" & \'blah\'</div>');
    equal(_('&amp;lt;').unescapeHTML(), '&lt;');
    equal(_('&apos;').unescapeHTML(), '\'');
    equal(_('&#39;').unescapeHTML(), '\'');
    equal(_('&#0039;').unescapeHTML(), '\'');
    equal(_('&#x4a;').unescapeHTML(), 'J');
    equal(_('&#x04A;').unescapeHTML(), 'J');
    equal(_('&#X4A;').unescapeHTML(), '&#X4A;');
    equal(_('&_#39;').unescapeHTML(), '&_#39;');
    equal(_('&#39_;').unescapeHTML(), '&#39_;');
    equal(_('&amp;#38;').unescapeHTML(), '&#38;');
    equal(_('&#38;amp;').unescapeHTML(), '&amp;');
    equal(_('').unescapeHTML(), '');
    equal(_(null).unescapeHTML(), '');
    equal(_(undefined).unescapeHTML(), '');
    equal(_(5).unescapeHTML(), '5');
    // equal(_(undefined).unescapeHTML(), '');
  });

  test('String: words', function() {
    deepEqual(_('I love you!').words(), ['I', 'love', 'you!']);
    deepEqual(_(' I    love   you!  ').words(), ['I', 'love', 'you!']);
    deepEqual(_('I_love_you!').words('_'), ['I', 'love', 'you!']);
    deepEqual(_('I-love-you!').words(/-/), ['I', 'love', 'you!']);
    deepEqual(_(123).words(), ['123'], '123 number has one word "123".');
    deepEqual(_(0).words(), ['0'], 'Zero number has one word "0".');
    deepEqual(_('').words(), [], 'Empty strings has no words.');
    deepEqual(_('   ').words(), [], 'Blank strings has no words.');
    deepEqual(_(null).words(), [], 'null has no words.');
    deepEqual(_(undefined).words(), [], 'undefined has no words.');
  });

  test('String: chars', function() {
    equal(_('Hello').chars().length, 5);
    equal(_(123).chars().length, 3);
    equal(_('').chars().length, 0);
    equal(_(null).chars().length, 0);
    equal(_(undefined).chars().length, 0);
  });

  test('String: swapCase', function(){
	  equal(_('AaBbCcDdEe').swapCase(), 'aAbBcCdDeE');
    equal(_('Hello World').swapCase(), 'hELLO wORLD');
    equal(_('').swapCase(), '');
    equal(_(null).swapCase(), '');
    equal(_(undefined).swapCase(), '');
  });

  test('String: lines', function() {
    equal(_('Hello\nWorld').lines().length, 2);
    equal(_('Hello World').lines().length, 1);
    equal(_(123).lines().length, 1);
    equal(_('').lines().length, 1);
    equal(_(null).lines().length, 0);
    equal(_(undefined).lines().length, 0);
  });

  test('String: pad', function() {
    equal(_('1').pad(8), '       1');
    equal(_(1).pad(8), '       1');
    equal(_('1').pad(8, '0'), '00000001');
    equal(_('1').pad(8, '0', 'left'), '00000001');
    equal(_('1').pad(8, '0', 'right'), '10000000');
    equal(_('1').pad(8, '0', 'both'), '00001000');
    equal(_('foo').pad(8, '0', 'both'), '000foo00');
    equal(_('foo').pad(7, '0', 'both'), '00foo00');
    equal(_('foo').pad(7, '!@$%dofjrofj', 'both'), '!!foo!!');
    equal(_('').pad(2), '  ');
    equal(_(null).pad(2), '  ');
    equal(_(undefined).pad(2), '  ');
  });

  test('String: lpad', function() {
    equal(_('1').lpad(8), '       1');
    equal(_(1).lpad(8), '       1');
    equal(_('1').lpad(8, '0'), '00000001');
    equal(_('1').lpad(8, '0', 'left'), '00000001');
    equal(_('').lpad(2), '  ');
    equal(_(null).lpad(2), '  ');
    equal(_(undefined).lpad(2), '  ');
  });

  test('String: rpad', function() {
    equal(_('1').rpad(8), '1       ');
    equal(_(1).lpad(8), '       1');
    equal(_('1').rpad(8, '0'), '10000000');
    equal(_('foo').rpad(8, '0'), 'foo00000');
    equal(_('foo').rpad(7, '0'), 'foo0000');
    equal(_('').rpad(2), '  ');
    equal(_(null).rpad(2), '  ');
    equal(_(undefined).rpad(2), '  ');
  });

  test('String: lrpad', function() {
    equal(_('1').lrpad(8), '    1   ');
    equal(_(1).lrpad(8), '    1   ');
    equal(_('1').lrpad(8, '0'), '00001000');
    equal(_('foo').lrpad(8, '0'), '000foo00');
    equal(_('foo').lrpad(7, '0'), '00foo00');
    equal(_('foo').lrpad(7, '!@$%dofjrofj'), '!!foo!!');
    equal(_('').lrpad(2), '  ');
    equal(_(null).lrpad(2), '  ');
    equal(_(undefined).lrpad(2), '  ');
  });

  test('String: toNumber', function() {
    deepEqual(_('not a number').toNumber(), NaN);
    equal(_(0).toNumber(), 0);
    equal(_('0').toNumber(), 0);
    equal(_('0.0').toNumber(), 0);
    equal(_('0.1').toNumber(), 0);
    equal(_('0.1').toNumber(1), 0.1);
    equal(_('  0.1 ').toNumber(1), 0.1);
    equal(_('0000').toNumber(), 0);
    equal(_('2.345').toNumber(), 2);
    equal(_('2.345').toNumber(NaN), 2);
    equal(_('2.345').toNumber(2), 2.35);
    equal(_('2.344').toNumber(2), 2.34);
    equal(_('2').toNumber(2), 2.00);
    equal(_(2).toNumber(2), 2.00);
    equal(_(-2).toNumber(), -2);
    equal(_('-2').toNumber(), -2);
    equal(_('').toNumber(), 0);
    equal(_(null).toNumber(), 0);
    equal(_(undefined).toNumber(), 0);
  });

  test('String: numberFormat', function() {
    equal(_.numberFormat(9000), '9,000');
    equal(_.numberFormat(9000, 0), '9,000');
    equal(_.numberFormat(9000, 0, '', ''), '9000');
    equal(_.numberFormat(90000, 2), '90,000.00');
    equal(_.numberFormat(1000.754), '1,001');
    equal(_.numberFormat(1000.754, 2), '1,000.75');
    equal(_.numberFormat(1000.754, 0, ',', '.'), '1.001');
    equal(_.numberFormat(1000.754, 2, ',', '.'), '1.000,75');
    equal(_.numberFormat(1000000.754, 2, ',', '.'), '1.000.000,75');
    equal(_.numberFormat(1000000000), '1,000,000,000');
    equal(_.numberFormat(100000000), '100,000,000');
    equal(_.numberFormat('not number'), '');
    equal(_.numberFormat(), '');
    equal(_.numberFormat(null, '.', ','), '');
    equal(_.numberFormat(undefined, '.', ','), '');
    equal(_.numberFormat(new Number(5000)), '5,000');
  });

  test('String: strRight', function() {
    equal(_('This_is_a_test_string').strRight('_'), 'is_a_test_string');
    equal(_('This_is_a_test_string').strRight('string'), '');
    equal(_('This_is_a_test_string').strRight(), 'This_is_a_test_string');
    equal(_('This_is_a_test_string').strRight(''), 'This_is_a_test_string');
    equal(_('This_is_a_test_string').strRight('-'), 'This_is_a_test_string');
    equal(_('This_is_a_test_string').strRight(''), 'This_is_a_test_string');
    equal(_('').strRight('foo'), '');
    equal(_(null).strRight('foo'), '');
    equal(_(undefined).strRight('foo'), '');
    equal(_(12345).strRight(2), '345');
  });

  test('String: strRightBack', function() {
    equal(_('This_is_a_test_string').strRightBack('_'), 'string');
    equal(_('This_is_a_test_string').strRightBack('string'), '');
    equal(_('This_is_a_test_string').strRightBack(), 'This_is_a_test_string');
    equal(_('This_is_a_test_string').strRightBack(''), 'This_is_a_test_string');
    equal(_('This_is_a_test_string').strRightBack('-'), 'This_is_a_test_string');
    equal(_('').strRightBack('foo'), '');
    equal(_(null).strRightBack('foo'), '');
    equal(_(undefined).strRightBack('foo'), '');
    equal(_(12345).strRightBack(2), '345');
  });

  test('String: strLeft', function() {
    equal(_('This_is_a_test_string').strLeft('_'), 'This');
    equal(_('This_is_a_test_string').strLeft('This'), '');
    equal(_('This_is_a_test_string').strLeft(), 'This_is_a_test_string');
    equal(_('This_is_a_test_string').strLeft(''), 'This_is_a_test_string');
    equal(_('This_is_a_test_string').strLeft('-'), 'This_is_a_test_string');
    equal(_('').strLeft('foo'), '');
    equal(_(null).strLeft('foo'), '');
    equal(_(undefined).strLeft('foo'), '');
    equal(_(123454321).strLeft(3), '12');
  });

  test('String: strLeftBack', function() {
    equal(_('This_is_a_test_string').strLeftBack('_'), 'This_is_a_test');
    equal(_('This_is_a_test_string').strLeftBack('This'), '');
    equal(_('This_is_a_test_string').strLeftBack(), 'This_is_a_test_string');
    equal(_('This_is_a_test_string').strLeftBack(''), 'This_is_a_test_string');
    equal(_('This_is_a_test_string').strLeftBack('-'), 'This_is_a_test_string');
    equal(_('').strLeftBack('foo'), '');
    equal(_(null).strLeftBack('foo'), '');
    equal(_(undefined).strLeftBack('foo'), '');
    equal(_(123454321).strLeftBack(3), '123454');
  });

  test('Strings: stripTags', function() {
    equal(_('a <a href="#">link</a>').stripTags(), 'a link');
    equal(_('a <a href="#">link</a><script>alert("hello world!")</scr'+'ipt>').stripTags(), 'a linkalert("hello world!")');
    equal(_('<html><body>hello world</body></html>').stripTags(), 'hello world');
    equal(_(123).stripTags(), '123');
    equal(_('').stripTags(), '');
    equal(_(null).stripTags(), '');
    equal(_(undefined).stripTags(), '');
  });

  test('Strings: toSentence', function() {
    equal(_.toSentence(['jQuery']), 'jQuery', 'array with a single element');
    equal(_.toSentence(['jQuery', 'MooTools']), 'jQuery and MooTools', 'array with two elements');
    equal(_.toSentence(['jQuery', 'MooTools', 'Prototype']), 'jQuery, MooTools and Prototype', 'array with three elements');
    equal(_.toSentence(['jQuery', 'MooTools', 'Prototype', 'YUI']), 'jQuery, MooTools, Prototype and YUI', 'array with multiple elements');
    equal(_.toSentence(['jQuery', 'MooTools', 'Prototype'], ',', ' or '), 'jQuery,MooTools or Prototype', 'handles custom separators');
  });

  test('Strings: toSentenceSerial', function (){
    equal(_.toSentenceSerial(['jQuery']), 'jQuery');
    equal(_.toSentenceSerial(['jQuery', 'MooTools']), 'jQuery and MooTools');
    equal(_.toSentenceSerial(['jQuery', 'MooTools', 'Prototype']), 'jQuery, MooTools, and Prototype');
  });

  test('Strings: slugify', function() {
    equal(_('Jack & Jill like numbers 1,2,3 and 4 and silly characters ?%.$!/').slugify(), 'jack-jill-like-numbers-123-and-4-and-silly-characters');
    equal(_('Un éléphant à l\'orée du bois').slugify(), 'un-elephant-a-loree-du-bois');
    equal(_('I know latin characters: á í ó ú ç ã õ ñ ü').slugify(), 'i-know-latin-characters-a-i-o-u-c-a-o-n-u');
    equal(_('I am a word too, even though I am but a single letter: i!').slugify(), 'i-am-a-word-too-even-though-i-am-but-a-single-letter-i');
    equal(_('').slugify(), '');
    equal(_(null).slugify(), '');
    equal(_(undefined).slugify(), '');
  });

  test('Strings: quote', function(){
    equal(_.quote('foo'), '"foo"');
    equal(_.quote('"foo"'), '""foo""');
    equal(_.quote(1), '"1"');
    // alias
    equal(_.q('foo'), '"foo"');
    equal(_.q(''), '""');
    equal(_.q(null), '""');
    equal(_.q(undefined), '""');
  });

  test('Strings: surround', function(){
    equal(_.surround('foo', 'ab'), 'abfooab');
    equal(_.surround(1, 'ab'), 'ab1ab');
    equal(_.surround(1, 2), '212');
    equal(_.surround('foo', 1), '1foo1');
    equal(_.surround('', 1), '11');
    equal(_.surround(null, 1), '11');
    equal(_.surround('foo', ''), 'foo');
    equal(_.surround('foo', null), 'foo');
  });


  test('Strings: repeat', function() {
    equal(_.repeat('foo'), '');
    equal(_.repeat('foo', 3), 'foofoofoo');
    equal(_.repeat('foo', '3'), 'foofoofoo');
    equal(_.repeat(123, 2), '123123');
    equal(_.repeat(1234, 2, '*'), '1234*1234');
    equal(_.repeat(1234, 2, 5), '123451234');
    equal(_.repeat('', 2), '');
    equal(_.repeat(null, 2), '');
    equal(_.repeat(undefined, 2), '');
  });

});
