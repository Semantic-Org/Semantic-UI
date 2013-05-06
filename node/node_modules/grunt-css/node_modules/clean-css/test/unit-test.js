var vows = require('vows'),
  assert = require('assert'),
  cleanCSS = require('../index');

var lineBreak = process.platform == 'win32' ? '\r\n' : '\n';
var cssContext = function(groups, options) {
  var context = {};
  var clean = function(cleanedCSS) {
    return function(css) {
      assert.equal(cleanCSS.process(css, options), cleanedCSS);
    };
  };

  for (var g in groups) {
    var transformation = groups[g];
    if (typeof transformation == 'string') transformation = [transformation, transformation];
    if (!transformation[0].push) {
      transformation = [[transformation[0], transformation[1]]];
    }

    for (var i = 0, c = transformation.length; i < c; i++) {
      context[g + ' #' + (i + 1)] = {
        topic: transformation[i][0],
        clean: clean(transformation[i][1])
      };
    }
  }

  return context;
};

vows.describe('clean-units').addBatch({
  'identity': cssContext({
    'preserve minified content': 'a{color:#f10}'
  }),
  'semicolons': cssContext({
    'multiple semicolons': [
      'a{color:#fff;;;width:0; ;}',
      'a{color:#fff;width:0}'
    ],
    'trailing semicolon': [
      'a{color:#fff;}',
      'a{color:#fff}'
    ],
    'trailing semicolon and space': [
      'a{color:#fff ; }',
      'a{color:#fff}'
    ],
    'comma and space': [
      'a{color:rgba(0, 0,  5, .5)}',
      'a{color:rgba(0,0,5,.5)}'
    ]
  }),
  'whitespace': cssContext({
    'one argument': [
      'div  a  { color:#fff  }',
      'div a{color:#fff}'
    ],
    'tabs': [
      'div\t\ta{}\tp{color:red}',
      'div a{}p{color:red}'
    ],
    'line breaks #1': [
      'div \na\r\n { width:500px }',
      'div a{width:500px}'
    ],
    'line breaks #2': [
      'div \na\r\n, p { width:500px }',
      'div a,p{width:500px}'
    ],
    'line breaks #3': [
      'div a{width:500px\r\n}',
      'div a{width:500px}'
    ],
    'line breaks with whitespace lines': [
      'div \n \t\n \na\r\n, p { width:500px }',
      'div a,p{width:500px}'
    ],
    'multiple arguments': [
      'a{color:#fff ;  font-weight:  bolder }',
      'a{color:#fff;font-weight:bolder}'
    ],
    'space delimited arguments': [
      'a {border: 1px solid #f10; margin: 0 auto }',
      'a{border:1px solid #f10;margin:0 auto}'
    ],
    'at beginning': [
      ' a {color:#fff}',
      'a{color:#fff}'
    ],
    'at end': [
      'a{color:#fff } ',
      'a{color:#fff}'
    ],
    'not inside calc method #1': [
      'a{width:-moz-calc(100% - 1em);width:calc(100% - 1em)}',
      'a{width:-moz-calc(100% - 1em);width:calc(100% - 1em)}'
    ],
    'not inside calc method #2': [
      'div{margin:-moz-calc(50% + 15px) -moz-calc(50% + 15px);margin:calc(50% + .5rem) calc(50% + .5rem)}',
      'div{margin:-moz-calc(50% + 15px) -moz-calc(50% + 15px);margin:calc(50% + .5rem) calc(50% + .5rem)}'
    ],
    'not inside calc method with more parentheses': [
      'div{height:-moz-calc((10% + 12px)/2 + 10em)}',
      'div{height:-moz-calc((10% + 12px)/2 + 10em)}'
    ],
    'not inside calc method with multiplication': [
      'div{height:-moz-calc(3 * 2em + 10px)}',
      'div{height:-moz-calc(3 * 2em + 10px)}'
    ],
    'windows breaks': [
      'div>a{color:red\r\n }',
      'div>a{color:red}'
    ],
    'whitespace in media queries': [
      '@media (   min-width: 980px ) {\n#page .span4 {\nwidth: 250px;\n}\n\n.row {\nmargin-left: -10px;\n}\n}',
      '@media (min-width:980px){#page .span4{width:250px}.row{margin-left:-10px}}',
    ]
  }),
  'line breaks': cssContext({
    'line breaks': [
      'div\na\r\n{width:500px}',
      'div' + lineBreak + 'a' + lineBreak + '{width:500px}'
    ],
    'line breaks #2': [
      'div\na\r\n,p{width:500px}',
      'div' + lineBreak + 'a' + lineBreak + ',p{width:500px}'
    ],
    'multiple line breaks #2': [
      'div \r\n\r\na\r\n,p{width:500px}',
      'div' + lineBreak + 'a' + lineBreak + ',p{width:500px}'
    ],
    'line breaks with whitespace lines': [
      'div \n \t\n \na\r\n, p { width:500px }',
      'div' + lineBreak + 'a' + lineBreak + ',p{width:500px}'
    ]
  }, { keepBreaks: true }),
  'selectors': cssContext({
    'remove spaces around selectors': [
      'div + span >   em',
      'div+span>em'
    ],
    'not remove spaces for pseudo-classes': [
      'div :first-child',
      'div :first-child'
    ],
    'strip universal selector when coming with id/class/attribute selectors': [
      [
        '* > *#id > *.class',
        '*>#id>.class'
      ],[
        '*:first-child > *[data-id]',
        ':first-child>[data-id]'
      ]
    ],
    'not strip standalone universal selector': [
      'label ~ * + span',
      'label~*+span'
    ],
    'not expand + in selectors mixed with calc methods': [
      'div{width:calc(50% + 3em)}div + div{width:100%}div:hover{width:calc(50% + 4em)}* > div {border:1px solid #f0f}',
      'div{width:calc(50% + 3em)}div+div{width:100%}div:hover{width:calc(50% + 4em)}*>div{border:1px solid #f0f}'
    ]
  }),
  'comments': cssContext({
    'single line': [
      'a{color:#fff}/* some comment*/p{height:10px/* other comment */}',
      'a{color:#fff}p{height:10px}'
    ],
    'multiline': [
      '/* \r\n multiline \n comment */a{color:rgba(0,0,0,0.8)}',
      'a{color:rgba(0,0,0,.8)}'
    ],
    'comment chars in comments': [
      '/* \r\n comment chars * inside / comments */a{color:#fff}',
      'a{color:#fff}'
    ],
    'comment inside block': [
      'a{/* \r\n some comments */color:#fff}',
      'a{color:#fff}'
    ],
    'special comments': [
      '/*! special comment */a{color:#f10} /* normal comment */',
      '/*! special comment */a{color:#f10}'
    ],
    'should keep exact structure': [
      '/*!  \n  a > span { } with some content */',
      '/*!  \n  a > span { } with some content */'
    ],
    'should remove comments with forward slashes inside': [
      '/*////*/a{color:red}',
      'a{color:red}'
    ]
  }),
  'important comments - one': cssContext({
    'strip all but first': [
      '/*! important comment */a{color:red}/* some comment *//*! important comment */',
      '/*! important comment */a{color:red}'
    ]
  }, { keepSpecialComments: 1 }),
  'important comments - none': cssContext({
    'strip all': [
      '/*! important comment */a{color:red}/* some comment *//*! important comment */',
      'a{color:red}'
    ]
  }, { keepSpecialComments: 0 }),
  'text content': cssContext({
    'normal #1': 'a{content:"."}',
    'normal #2': [
      'a:before{content : "test\'s test"; }',
      'a:before{content:"test\'s test"}'
    ],
    'open quote': [
      'a{content : open-quote;opacity:1}',
      'a{content:open-quote;opacity:1}'
    ],
    'close quote': [
      'a{content:  close-quote;clear:left}',
      'a{content:close-quote;clear:left}'
    ],
    'special characters': [
      'a{content : "  a > div { }  "}',
      'a{content:"  a > div { }  "}'
    ]
  }),
  'zero values': cssContext({
    'with units': [
      'a{margin:0px 0pt 0em 0%;padding: 0in 0cm 0mm 0pc;border-top-width:0ex}',
      'a{margin:0;padding:0;border-top-width:0}'
    ],
    'multiple into one': [
      'a{margin:0 0 0 0;padding:0 0 0 0;border-width:0 0 0 0}',
      'a{margin:0;padding:0;border-width:0}'
    ],
    'none to zeros': [
      'a{border:none;background:none}',
      'a{border:0;background:0}'
    ],
    'outline:none to outline:0': [
      'a{outline:none}',
      'a{outline:0}'
    ],
    'display:none not changed': 'a{display:none}',
    'longer background declaration not changed': 'html{background:none repeat scroll 0 0 #fff}',
    'mixed zeros not changed': 'div{margin:0 0 1px 2px}',
    'mixed zeros not changed #2': 'div{padding:0 1px 0 3px}',
    'mixed zeros not changed #3': 'div{padding:10px 0 0 1px}',
    'multiple zeros with fractions #1': [
      'div{padding:0 0 0 0.5em}',
      'div{padding:0 0 0 .5em}'
    ],
    'multiple zeros with fractions #2': [
      'div{padding:0 0 0 .5em}',
      'div{padding:0 0 0 .5em}'
    ],
    'rect zeros #1': 'div{clip:rect(0 0 0 0)}',
    'rect zeros #2': [
      'div{clip:rect(0px 0px 0px 0px)}',
      'div{clip:rect(0 0 0 0)}'
    ],
    'rect zeros #3': [
      'div{clip:rect( 0px 0px 0px 0px )}',
      'div{clip:rect(0 0 0 0)}'
    ],
    'rect zeros #4': [
      'div{clip:rect(0px, 0px, 0px, 0px)}',
      'div{clip:rect(0,0,0,0)}'
    ],
    'rect zeros #5': [
      'div{clip:rect(0.5% 0px 0px 0px)}',
      'div{clip:rect(0.5% 0 0 0)}'
    ],
    'rect zeros #6': [
      'div{clip:rect(0px 0px 0px 10px)}',
      'div{clip:rect(0 0 0 10px)}'
    ]
  }),
  'shorthands': cssContext({
    'padding - same 4 values': [
      'div{padding:1px 1px 1px 1px}',
      'div{padding:1px}'
    ],
    'margin - same 4 values': [
      'div{margin:1% 1% 1% 1%}',
      'div{margin:1%}'
    ],
    'border-width - same 4 values': [
      'div{border-width:1em 1em 1em 1em}',
      'div{border-width:1em}'
    ],
    'border-style - same 4 values': [
      'div{border-style:solid solid solid solid}',
      'div{border-style:solid}'
    ],
    'border-color - same 4 values': [
      'div{border-color:red red red red}',
      'div{border-color:red}'
    ],
    'border-color - same 4 values as hex': [
      'div{border-color:#f0f #f0f #f0f #f0f}',
      'div{border-color:#f0f}'
    ],
    'border-color - same 4 values as rgb': [
      'div{border-color:rgb(0,0,0) rgb(0,0,0) rgb(0,0,0) rgb(0,0,0)}',
      'div{border-color:#000}'
    ],
    'border-color - same 4 values as rgba': [
      'div{border-color:rgba(0,0,0,.5) rgba(0,0,0,.5) rgba(0,0,0,.5) rgba(0,0,0,.5)}',
      'div{border-color:rgba(0,0,0,.5)}'
    ],
    'border-radius - same 4 values': [
      'div{border-radius:3px 3px 3px 3px}',
      'div{border-radius:3px}'
    ],
    'border-radius - same 4 values with vendor prefixes': [
      'div{-moz-border-radius:3px 3px 3px 3px;-o-border-radius:3px 3px 3px 3px;-webkit-border-radius:3px 3px 3px 3px;border-radius:3px 3px 3px 3px}',
      'div{-moz-border-radius:3px;-o-border-radius:3px;-webkit-border-radius:3px;border-radius:3px}'
    ],
    'padding - same pairs': [
      'div{padding:15.5em 10.5em 15.5em 10.5em}',
      'div{padding:15.5em 10.5em}'
    ],
    'margin - same 2nd and 4th value': [
      'div{margin:1px 2px 3px 2px}',
      'div{margin:1px 2px 3px}'
    ],
    'padding - same 3 values': [
      'div{padding:1px 1px 1px}',
      'div{padding:1px}'
    ],
    'padding - different 3 values': 'div{padding:1px 1em 1%}',
    'margin - 3 callapsible values': [
      'div{margin:1ex 2ex 1ex}',
      'div{margin:1ex 2ex}'
    ],
    'border-radius - same 3 values with one vendor prefixe': [
      'div{-webkit-border-radius:3px 3px 3px;border-radius:3px 3px 3px}',
      'div{-webkit-border-radius:3px;border-radius:3px}'
    ],
    'border-color - same 2nd and 4th value as rgb': [
      'div{border-color:rgb(0,0,0) rgb(34,0,0) rgb(255,0,0) rgb(34,0,0)}',
      'div{border-color:#000 #200 red}'
    ],
    'margin - 3 different values': 'div{margin:1px 1px 3px}',
    'border width - 3 different values': 'div{border-width:1px 2px 3px}',
    'padding - same 2 values': [
      'div{padding:1px 1px}',
      'div{padding:1px}'
    ],
    'margin - same 2 values': [
      'div{margin:5% 5%}',
      'div{margin:5%}'
    ],
    'border-width - same 2 values': [
      'div{border-width:.5em .5em}',
      'div{border-width:.5em}'
    ],
    'different units': 'div{padding:1px 1em 1% 1rem}',
    'fractions': [
      'div{margin:.1em .1em .1em .1em}',
      'div{margin:.1em}'
    ]
  }),
  'floats': cssContext({
    'strips zero in fractions': [
      'a{ margin-bottom: 0.5em}',
      'a{margin-bottom:.5em}'
    ],
    'not strips zero in fractions of numbers greater than zero': [
      'a{ margin-bottom: 20.5em}',
      'a{margin-bottom:20.5em}'
    ]
  }),
  'colors': cssContext({
    'shorten rgb to standard hexadecimal format': [
      'a{ color:rgb (5, 10, 15) }',
      'a{color:#050a0f}'
    ],
    'skip rgba shortening': [
      'a{ color:rgba(5, 10, 15, 0.5)}',
      'a{color:rgba(5,10,15,.5)}'
    ],
    'shorten colors to 3 digit hex instead of 6 digit': [
      'a{ background-color: #aa0000; color:rgb(0, 17, 255)}',
      'a{background-color:#a00;color:#01f}'
    ],
    'skip shortening IE filter colors': [
      'a{ filter: chroma(color = "#ff0000")}',
      'a{filter:chroma(color="#ff0000")}'
    ],
    'color names to hex values': [
      'a{color:white;border-color:black;background-color:fuchsia}p{background:yellow}',
      'a{color:#fff;border-color:#000;background-color:#f0f}p{background:#ff0}'
    ],
    'keep selectors with color name #1': ".black-and-white .foo{color:#fff;background-color:#000}",
    'keep selectors with color name #2': ".go-blues{background:#000}",
    'keep selectors with color name #3': "#top_white{background:#000}",
    'keep selectors with color name #4': "a[data-sth=white]{background:#000}",
    'color names to hex values with important': [
      'a{color:white !important}',
      'a{color:#fff!important}'
    ],
    'color names to hex values in gradients': [
      'p{background:linear-gradient(-90deg,black,white)}',
      'p{background:linear-gradient(-90deg,#000,#fff)}'
    ],
    'hex value to color name if shorter': [
      'p{color:#f00}',
      'p{color:red}'
    ],
    'hex value to color name in borders': [
      'p{border:1px solid #f00}',
      'p{border:1px solid red}'
    ],
    'hex value to color name in gradients': [
      'p{background:-moz-linear-gradient(-90deg,#000,#f00)}',
      'p{background:-moz-linear-gradient(-90deg,#000,red)}'
    ],
    'hex value to color name in gradients #2': [
      'p{background:-webkit-gradient(linear, left top, left bottom, from(#000), to(#f00))}',
      'p{background:-webkit-gradient(linear,left top,left bottom,from(#000),to(red))}'
    ],
    'border color - keep unchanged': 'p{border:1px solid #f94311}',
    'border color - hex to name': [
      'p{border:1em dotted #f00}',
      'p{border:1em dotted red}'
    ],
    'border color - name to hex': [
      'p{border:1em dotted white}',
      'p{border:1em dotted #fff}'
    ],
    'border color - rgb': [
      'p{border:1em dotted rgb(255,0,0)}',
      'p{border:1em dotted red}'
    ],
    'colors and colons': 'a{background-image:linear-gradient(top,red,#e6e6e6)}',
    'colors and parentheses': 'a{background-image:-webkit-gradient(linear,0 0,0 100%,from(#fff),to(#e6e6e6))}',
    'hsl percents': 'a{color:hsl(1,0%,0%)}',
    'hsla percents': 'a{color:hsl(1,0%,0%)}',
    'hsl one percent': 'a{color:hsl(80,100%,0%)}',
    'hsla custom ': 'a{color:hsl(80,30%,50%,.5)}',
  }),
  'font weights': cssContext({
    'font-weight:normal to 400': [
      'p{font-weight:normal}',
      'p{font-weight:400}'
    ],
    'font-weight:bold to 700': [
      'p{font-weight:bold}',
      'p{font-weight:700}'
    ],
    'font weight in font declarations': [
      'font:normal 13px/20px "Helvetica Neue",Helvetica,Arial,sans-serif',
      'font:400 13px/20px "Helvetica Neue",Helvetica,Arial,sans-serif'
    ],
    'multiple changes': [
      'p{font-weight:bold;width:100%;font:normal}',
      'p{font-weight:700;width:100%;font:400}'
    ]
  }),
  'urls': cssContext({
    'keep urls without parentheses unchanged': 'a{background:url(/images/blank.png) 0 0 no-repeat}',
    'strip single parentheses': [
      "a{background:url('/images/blank.png') 0 0 no-repeat}",
      "a{background:url(/images/blank.png) 0 0 no-repeat}"
    ],
    'strip double parentheses': [
      'a{background:url("/images/blank.png") 0 0 no-repeat}',
      'a{background:url(/images/blank.png) 0 0 no-repeat}'
    ],
    'strip more': [
      'a{background:url("/images/blank.png") 0 0 no-repeat}a{}a{background:url("/images/blank.png") 0 0 no-repeat}',
      'a{background:url(/images/blank.png) 0 0 no-repeat}a{}a{background:url(/images/blank.png) 0 0 no-repeat}'
    ],
    'not strip comments if spaces inside': [
      'a{background:url("/images/long image name.png") 0 0 no-repeat}a{}a{background:url("/images/no-spaces.png") 0 0 no-repeat}',
      'a{background:url("/images/long image name.png") 0 0 no-repeat}a{}a{background:url(/images/no-spaces.png) 0 0 no-repeat}'
    ],
    'not add a space before url\'s hash': [
      "url(\"../fonts/d90b3358-e1e2-4abb-ba96-356983a54c22.svg#d90b3358-e1e2-4abb-ba96-356983a54c22\")",
      "url(../fonts/d90b3358-e1e2-4abb-ba96-356983a54c22.svg#d90b3358-e1e2-4abb-ba96-356983a54c22)"
    ]
  }),
  'fonts': cssContext({
    'keep format quotation': "@font-face{font-family:PublicVintage;src:url(./PublicVintage.otf) format('opentype')}",
    'remove font family quotation': [
      "a{font-family:\"Helvetica\",'Arial'}",
      "a{font-family:Helvetica,Arial}"
    ],
    'do not remove font family double quotation if space inside': 'a{font-family:"Courier New"}',
    'remove font quotation': [
      "a{font:12px/16px \"Helvetica\",'Arial'}",
      "a{font:12px/16px Helvetica,Arial}"
    ],
    'remove font quotation #2': [
      "a{font:12px/16px \"Helvetica1_12\",'Arial_1451'}",
      "a{font:12px/16px Helvetica1_12,Arial_1451}"
    ],
    'remove font quotation #3': [
      "a{font:12px/16px \"Helvetica-Regular\",'Arial-Bold'}",
      "a{font:12px/16px Helvetica-Regular,Arial-Bold}"
    ]
  }),
  'animations': cssContext({
    'shorten': [
      '@keyframes test\n{ from\n { width:100px; }\n to { width:200px; }\n}',
      '@keyframes test{from{width:100px}to{width:200px}}'
    ],
    'remove name quotes': [
      "@keyframes \"test1\"{}@keyframes 'test2'{}",
      "@keyframes test1{}@keyframes test2{}"
    ],
    'not remove name quotes if whitespace inside': "@keyframes \"test 1\"{}@keyframes 'test 2'{}",
    'remove name quotes for vendor prefixes': [
      "@-moz-keyframes 'test'{}@-o-keyframes 'test'{}@-webkit-keyframes 'test'{}",
      "@-moz-keyframes test{}@-o-keyframes test{}@-webkit-keyframes test{}"
    ],
    'remove quotes in animation': [
      "div{animation:'test' 2s ease-in .5s 3}",
      "div{animation:test 2s ease-in .5s 3}"
    ],
    'not remove quotes in animation when name with space inside': "div{animation:'test 1' 2s ease-in .5s 3}",
    'remove quotes in vendor prefixed animation': [
      "div{-moz-animation:'test' 2s ease-in;-o-animation:'test' 2s ease-in;-webkit-animation:'test' 2s ease-in}",
      "div{-moz-animation:test 2s ease-in;-o-animation:test 2s ease-in;-webkit-animation:test 2s ease-in}"
    ],
    'remove quotes in animation-name': [
      "div{animation-name:'test'}",
      "div{animation-name:test}"
    ],
    'not remove quotes in animation-name when name with space inside': "div{animation-name:'test 1'}",
    'remove quotes in vendor prefixed animation-name': [
      "div{-moz-animation-name:'test';-o-animation-name:'test';-webkit-animation-name:'test'}",
      "div{-moz-animation-name:test;-o-animation-name:test;-webkit-animation-name:test}"
    ]
  }),
  'attributes': cssContext({
    'should keep selector if no value': 'div[data-type]{border-color:red}',
    'should keep selector if no quotation': 'div[data-type=something]{border-color:red}',
    'should keep selector if equals in value': 'div[data-type="stupid=value"]{border-color:red}',
    'should keep quotation if whitespace inside': 'div[data-type^=\'object 1\']{border-color:red}',
    'should keep quotations if special characters inside': 'a[data-type="object_1"]{color:red}a[data-target="#some-place"]{color:red}',
    'should keep quotation if is a number': 'div[data-number=\'1\']{border-color:red}',
    'should keep quotation if starts with a number': 'div[data-type^=\'1something\']{border-color:red}',
    'should keep quotation if starts with a hyphen': 'div[data-type$=\'-something\']{border-color:red}',
    'should strip quotation if is a word': [
      'a[data-href=\'object\']{border-color:red}',
      'a[data-href=object]{border-color:red}'
    ],
    'should strip quotation if is a hyphen separated words': [
      'a[data-href=\'object-1-two\']{border-color:red}',
      'a[data-href=object-1-two]{border-color:red}'
    ],
    'should strip quotations if is less specific selectors': [
      'a[data-href*=\'object1\']{border-color:red}a[data-href|=\'object2\']{border-color:#0f0}',
      'a[data-href*=object1]{border-color:red}a[data-href|=object2]{border-color:#0f0}'
    ]
  }),
  'ie filters': cssContext({
    'short alpha': [
      "a{ filter:progid:DXImageTransform.Microsoft.Alpha(Opacity=80); -ms-filter:'progid:DXImageTransform.Microsoft.Alpha(Opacity=50)';}",
      "a{filter:alpha(Opacity=80);-ms-filter:'alpha(Opacity=50)'}"
    ],
    'short chroma': [
      'a{filter:progid:DXImageTransform.Microsoft.Chroma(color=#919191)}',
      'a{filter:chroma(color=#919191)}'
    ],
    'matrix filter spaces': [
      "a{filter:progid:DXImageTransform.Microsoft.Matrix(M11=0.984, M22=0.984, M12=0.17, M21=-0.17, SizingMethod='auto expand')",
      "a{filter:progid:DXImageTransform.Microsoft.Matrix(M11=.984, M22=.984, M12=.17, M21=-.17, SizingMethod='auto expand')"
    ],
    'multiple filters (IE7 issue)': [
      "a{filter:progid:DXImageTransform.Microsoft.Chroma(color=#919191) progid:DXImageTransform.Microsoft.Matrix(M11=0.984, M22=0.984, M12=0.17, M21=-0.17, SizingMethod='auto expand')}",
      "a{filter:progid:DXImageTransform.Microsoft.Chroma(color=#919191) progid:DXImageTransform.Microsoft.Matrix(M11=.984, M22=.984, M12=.17, M21=-.17, SizingMethod='auto expand')}"
    ]
  }),
  'charsets': cssContext({
    'not at beginning': [
      "a{ color: #f10; }@charset 'utf-8';b { font-weight: bolder}",
      "@charset 'utf-8';a{color:#f10}b{font-weight:bolder}"
    ],
    'multiple charsets': [
      "@charset 'utf-8';div :before { display: block }@charset 'utf-8';a { color: #f10 }",
      "@charset 'utf-8';div :before{display:block}a{color:#f10}"
    ]
  }),
  'important': cssContext({
    'space before': [
      "body{background-color:#fff  !important}",
      "body{background-color:#fff!important}"
    ]
  }),
  'empty elements': cssContext({
    'single': [
      ' div p {  \n}',
      ''
    ],
    'between non-empty': [
      'div {color:#fff}  a{  } p{  line-height:1.35em}',
      'div{color:#fff}p{line-height:1.35em}'
    ],
    'just a semicolon': [
      'div { ; }',
      ''
    ]
  }, { removeEmpty: true }),
  'skip empty elements': cssContext({
    'empty #1': 'a{}',
    'empty #2': 'div>a{}',
    'empty #3': 'div:nth-child(2n){}',
    'empty #4': 'a{color:#fff}div{}p{line-height:2em}'
  })
}).export(module);