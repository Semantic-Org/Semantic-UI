/*!
  * Sqwish - a CSS Compressor
  * Copyright Dustin Diaz 2011
  * https://github.com/ded/sqwish
  * License MIT
  */

var fs = require('fs');

function uniq(ar) {
  var a = [], i, j;
  label:
  for (i = ar.length - 1; i >= 0; i--) {
    for (j = a.length - 1; j >= 0; j--) {
      if (a[j] == ar[i]) {
        continue label;
      }
    }
    a[a.length] = ar[i];
  }
  return a;
}

function sqwish(css, strict) {
  // allow /*! bla */ style comments to retain copyrights etc.
  var comments = css.match(/\/\*![\s\S]+?\*\//g);

  css = css.trim() // give it a solid trimming to start

    // comments
    .replace(/\/\*[\s\S]+?\*\//g, '')

    // line breaks and carriage returns
    .replace(/[\n\r]/g, '')

    // space between selectors, declarations, properties and values
    .replace(/\s*([:;,{}])\s*/g, '$1')

    // replace multiple spaces with single spaces
    .replace(/\s+/g, ' ')

    // space between last declaration and end of rule
    // also remove trailing semi-colons on last declaration
    .replace(/;}/g, '}')

    // this is important
    .replace(/\s+(!important)/g, '$1')

    // convert longhand hex to shorthand hex
    .replace(/#([a-fA-F0-9])\1([a-fA-F0-9])\2([a-fA-F0-9])\3/g, '#$1$2$3')

    // replace longhand values with shorthand '5px 5px 5px 5px' => '5px'
    .replace(/(\d+[a-z]{2}) \1 \1 \1/gi, '$1')

    // replace double-specified longhand values with shorthand '5px 2px 5px 2px' => '5px 2px'
    .replace(/(\d+[a-z]{2}) (\d+[a-z]{2}) \1 \2/gi, '$1 $2')

    // replace 0px with 0
    .replace(/([\s|:])[0]+px/g, '$10');

  if (strict) {
    css = strict_css(css);
  }

  // put back in copyrights
  if (comments) {
    comments = comments ? comments.join('\n') : '';
    css = comments + '\n' + css;
  }
  return css;
}

function strict_css(css) {
  // now some super fun funky shit where we remove duplicate declarations
  // into combined rules

  // store global dict of all rules
  var ruleList = {},
      rules = css.match(/([^{]+\{[^}]+\})+?/g);

  // lets find the dups
  rules.forEach(function (rule) {
    // break rule into selector|declaration parts
    var parts = rule.match(/([^{]+)\{([^}]+)/),
        selector = parts[1],
        declarations = parts[2];

    // start new list if it wasn't created already
    if (!ruleList[selector]) {
      ruleList[selector] = [];
    }

    declarations = declarations.split(';');
    // filter out duplicate properties
    ruleList[selector] = ruleList[selector].filter(function (decl) {
      var prop = decl.match(/[^:]+/)[0];
      // pre-existing properties are not wanted anymore
      return !declarations.some(function (dec) {
        // must include '^' as to not confuse "color" with "border-color" etc.
        return dec.match(new RegExp('^' + prop + ':'));
      });
    });

    // latter takes presedence :)
    ruleList[selector] = ruleList[selector].concat(declarations);
    // still dups? just in case
    ruleList[selector] = uniq(ruleList[selector]);
  });

  // reset css because we're gonna recreate the whole shabang.
  css = '';
  for (var selector in ruleList) {
    var joinedRuleList = ruleList[selector].join(';');
    css += selector + '{' + (joinedRuleList).replace(/;$/, '') + '}';
  }
  return css;
}

module.exports.exec = function (args) {
  var out;
  var read = args[0];
  if (out = args.indexOf('-o') != -1) {
    out = args[out + 1];
  } else {
    out = read.replace(/\.css$/, '.min.css');
  }
  console.log('compressing ' + read + ' to ' + out + '...');
  var data = fs.readFileSync(read, 'utf8');
  fs.writeFileSync(out, sqwish(data, (args.indexOf('--strict') != -1)), 'utf8');
};
module.exports.minify = function (css, strict) {
  return sqwish(css, strict);
};