/**
 * Clean-css - https://github.com/GoalSmashers/clean-css
 * Released under the terms of MIT license
 *
 * Copyright (C) 2011-2013 GoalSmashers.com
 */

var fs = require('fs');
var path = require('path');
var existsSync = fs.existsSync || path.existsSync;

var CleanCSS = {
  colors: {
    toHex: {
      aqua: '#0ff',
      black: '#000',
      blue: '#00f',
      fuchsia: '#f0f',
      white: '#fff',
      yellow: '#ff0'
    },
    toName: {
      '#000080': 'navy',
      '#008000': 'green',
      '#008080': 'teal',
      '#800000': 'maroon',
      '#800080': 'purple',
      '#808000': 'olive',
      '#808080': 'gray',
      '#c0c0c0': 'silver',
      '#f00': 'red'
    }
  },

  process: function(data, options) {
    var context = {
      specialComments: [],
      freeTextBlocks: [],
      urlBlocks: []
    };
    var replace = function() {
      if (typeof arguments[0] == 'function')
        arguments[0]();
      else
        data = data.replace.apply(data, arguments);
    };
    var lineBreak = process.platform == 'win32' ? '\r\n' : '\n';
    this.lineBreak = lineBreak;

    options = options || {};

    // * - leave all important comments
    // 1 - leave first important comment only
    // 0 - strip all important comments
    options.keepSpecialComments = 'keepSpecialComments' in options ?
      options.keepSpecialComments :
      '*';

    options.keepBreaks = options.keepBreaks || false;

    // replace function
    if (options.debug) {
      var originalReplace = replace;
      replace = function(pattern, replacement) {
        var name = typeof pattern == 'function' ?
          /function (\w+)\(/.exec(pattern.toString())[1] :
          pattern;

        var start = process.hrtime();
        originalReplace(pattern, replacement);

        var itTook = process.hrtime(start);
        console.log('%d ms: ' + name, 1000 * itTook[0] + itTook[1] / 1000000.0);
      };
    }

    var removeComments = function() {
      replace(function stripComments() {
        data = CleanCSS._stripComments(context, data);
      });
    };

    // replace all escaped line breaks
    replace(/\\(\r\n|\n)/mg, '');

    removeComments();

    // inline all imports
    replace(function inlineImports() {
      data = CleanCSS._inlineImports(data, {
        root: options.root || process.cwd(),
        relativeTo: options.relativeTo
      });
    });

    // strip comments with inlined imports
    if (data.indexOf('/*') > -1)
      removeComments();

    // strip parentheses in urls if possible (no spaces inside)
    replace(/url\((['"])([^\)]+)['"]\)/g, function(match, quote, url) {
      if (url.match(/[ \t]/g) !== null || url.indexOf('data:') === 0)
        return 'url(' + quote + url + quote + ')';
      else
        return 'url(' + url + ')';
    });

    // strip parentheses in animation & font names
    replace(/(animation|animation\-name|font|font\-family):([^;}]+)/g, function(match, propertyName, fontDef) {
      return propertyName + ':' + fontDef.replace(/['"]([\w\-]+)['"]/g, '$1');
    });

    // strip parentheses in @keyframes
    replace(/@(\-moz\-|\-o\-|\-webkit\-)?keyframes ([^{]+)/g, function(match, prefix, name) {
      prefix = prefix || '';
      return '@' + prefix + 'keyframes ' + (name.indexOf(' ') > -1 ? name : name.replace(/['"]/g, ''));
    });

    // IE shorter filters, but only if single (IE 7 issue)
    replace(/progid:DXImageTransform\.Microsoft\.(Alpha|Chroma)(\([^\)]+\))([;}'"])/g, function(match, filter, args, suffix) {
      return filter.toLowerCase() + args + suffix;
    });

    // strip parentheses in attribute values
    replace(/\[([^\]]+)\]/g, function(match, content) {
      var eqIndex = content.indexOf('=');
      if (eqIndex < 0 && content.indexOf('\'') < 0 && content.indexOf('"') < 0)
        return match;

      var key = content.substring(0, eqIndex);
      var value = content.substring(eqIndex + 1, content.length);

      if (/^['"](?:[a-zA-Z][a-zA-Z\d\-_]+)['"]$/.test(value))
        return '[' + key + '=' + value.substring(1, value.length - 1) + ']';
      else
        return match;
    });

    // replace all free text content with a placeholder
    replace(function stripFreeText() {
      data = CleanCSS._stripFreeText(context, data);
    });

    // replace url(...) with a placeholder
    replace(function stripUrls() {
      data = CleanCSS._stripUrls(context, data);
    });

    // line breaks
    if (!options.keepBreaks)
      replace(/[\r]?\n/g, ' ');

    // multiple whitespace
    replace(/[\t ]+/g, ' ');

    // multiple semicolons (with optional whitespace)
    replace(/;[ ]?;+/g, ';');

    // multiple line breaks to one
    replace(/ (?:\r\n|\n)/g, lineBreak);
    replace(/(?:\r\n|\n)+/g, lineBreak);

    // remove spaces around selectors
    replace(/ ([+~>]) /g, '$1');

    // remove extra spaces inside content
    replace(/([!\(\{\}:;=,\n]) /g, '$1');
    replace(/ ([!\)\{\};=,\n])/g, '$1');
    replace(/(?:\r\n|\n)\}/g, '}');
    replace(/([\{;,])(?:\r\n|\n)/g, '$1');
    replace(/ :([^\{\};]+)([;}])/g, ':$1$2');

    // restore spaces inside IE filters (IE 7 issue)
    replace(/progid:[^(]+\(([^\)]+)/g, function(match) {
      return match.replace(/,/g, ', ');
    });

    // trailing semicolons
    replace(/;\}/g, '}');

    // hsl to hex colors
    replace(/hsl\((\d+),(\d+)%?,(\d+)%?\)/g, function(match, hue, saturation, lightness) {
      var asRgb = CleanCSS._hslToRgb(hue, saturation, lightness);
      var redAsHex = asRgb[0].toString(16);
      var greenAsHex = asRgb[1].toString(16);
      var blueAsHex = asRgb[2].toString(16);

      return '#' +
        ((redAsHex.length == 1 ? '0' : '') + redAsHex) +
        ((greenAsHex.length == 1 ? '0' : '') + greenAsHex) +
        ((blueAsHex.length == 1 ? '0' : '') + blueAsHex);
    });

    // rgb to hex colors
    replace(/rgb\((\d+),(\d+),(\d+)\)/g, function(match, red, green, blue) {
      var redAsHex = parseInt(red, 10).toString(16);
      var greenAsHex = parseInt(green, 10).toString(16);
      var blueAsHex = parseInt(blue, 10).toString(16);

      return '#' +
        ((redAsHex.length == 1 ? '0' : '') + redAsHex) +
        ((greenAsHex.length == 1 ? '0' : '') + greenAsHex) +
        ((blueAsHex.length == 1 ? '0' : '') + blueAsHex);
    });

    // long hex to short hex colors
    replace(/([,: \(])#([0-9a-f]{6})/gi, function(match, prefix, color) {
      if (color[0] == color[1] && color[2] == color[3] && color[4] == color[5])
        return prefix + '#' + color[0] + color[2] + color[4];
      else
        return prefix + '#' + color;
    });

    // replace color name with hex values if shorter (or the other way around)
    ['toHex', 'toName'].forEach(function(type) {
      var pattern = '(' + Object.keys(CleanCSS.colors[type]).join('|') + ')';
      var colorSwitcher = function(match, prefix, colorValue, suffix) {
        return prefix + CleanCSS.colors[type][colorValue.toLowerCase()] + suffix;
      };
      replace(new RegExp('([ :,\\(])' + pattern + '([;\\}!\\) ])', 'ig'), colorSwitcher);
      replace(new RegExp('(,)' + pattern + '(,)', 'ig'), colorSwitcher);
    });

    // replace font weight with numerical value
    replace(/(font|font\-weight):(normal|bold)([ ;\}!])/g, function(match, property, weight, suffix) {
      if (weight == 'normal')
        return property + ':400' + suffix;
      else if (weight == 'bold')
        return property + ':700' + suffix;
      else
        return match;
    });

    // zero + unit to zero
    replace(/(\s|:|,)0(?:px|em|ex|cm|mm|in|pt|pc|%)/g, '$1' + '0');
    replace(/rect\(0(?:px|em|ex|cm|mm|in|pt|pc|%)/g, 'rect(0');

    // fraction zeros removal
    replace(/\.([1-9]*)0+(\D)/g, function(match, nonZeroPart, suffix) {
      return (nonZeroPart ? '.' : '') + nonZeroPart + suffix;
    });

    // restore 0% in hsl/hsla
    replace(/(hsl|hsla)\(([^\)]+)\)/g, function(match, colorFunction, colorDef) {
      var tokens = colorDef.split(',');
      if (tokens[1] == '0')
        tokens[1] = '0%';
      if (tokens[2] == '0')
        tokens[2] = '0%';
      return colorFunction + '(' + tokens.join(',') + ')';
    });

    // none to 0
    replace(/(border|border-top|border-right|border-bottom|border-left|outline):none/g, '$1:0');

    // background:none to 0
    replace(/(background):none([;}])/g, '$1:0$2');

    // multiple zeros into one
    replace(/box-shadow:0 0 0 0([^\.])/g, 'box-shadow:0 0$1');
    replace(/:0 0 0 0([^\.])/g, ':0$1');
    replace(/([: ,=\-])0\.(\d)/g, '$1.$2');

    // shorthand notations
    var shorthandRegex = function(repeats, hasSuffix) {
      var pattern = '(padding|margin|border\\-width|border\\-color|border\\-style|border\\-radius):';
      for (var i = 0; i < repeats; i++) {
        pattern += '([\\d\\w\\.%#\\(\\),]+)' + (i < repeats - 1 ? ' ' : '');
      }
      return new RegExp(pattern + (hasSuffix ? '([;}])' : ''), 'g');
    };

    // 4 size values into less
    replace(shorthandRegex(4), function(match, property, size1, size2, size3, size4) {
      if (size1 === size2 && size1 === size3 && size1 === size4)
        return property + ':' + size1;
      else if (size1 === size3 && size2 === size4)
        return property + ':' + size1 + ' ' + size2;
      else if (size2 === size4)
        return property + ':' + size1 + ' ' + size2 + ' ' + size3;
      else
        return match;
    });

    // 3 size values into less
    replace(shorthandRegex(3, true), function(match, property, size1, size2, size3, suffix) {
      if (size1 === size2 && size1 === size3)
        return property + ':' + size1 + suffix;
      else if (size1 === size3)
        return property + ':' + size1 + ' ' + size2 + suffix;
      else
        return match;
    });

    // same 2 values into one
    replace(shorthandRegex(2, true), function(match, property, size1, size2, suffix) {
      if (size1 === size2)
        return property + ':' + size1 + suffix;
      else
        return match;
    });

    // restore rect(...) zeros syntax for 4 zeros
    replace(/rect\(\s?0(\s|,)0[ ,]0[ ,]0\s?\)/g, 'rect(0$10$10$10)');

    // remove universal selector when not needed (*#id, *.class etc)
    replace(/\*([\.#:\[])/g, '$1');

    // Restore spaces inside calc back
    replace(/calc\([^\}]+\}/g, function(match) {
      return match.replace(/\+/g, ' + ');
    });

    // Restore urls, content content, and special comments (in that order)
    replace(/__URL__/g, function() {
      return context.urlBlocks.shift();
    });

    replace(/__CSSFREETEXT__/g, function() {
      return context.freeTextBlocks.shift();
    });

    var specialCommentsCount = context.specialComments.length;
    var breakSuffix = options.keepBreaks ? lineBreak : '';
    replace(new RegExp('__CSSCOMMENT__(' + lineBreak + '| )?', 'g'), function() {
      switch (options.keepSpecialComments) {
        case '*':
          return context.specialComments.shift() + breakSuffix;
        case 1:
          return context.specialComments.length == specialCommentsCount ?
            context.specialComments.shift() + breakSuffix :
            '';
        case 0:
          return '';
      }
    });

    // move first charset to the beginning
    replace(function moveCharset() {
      // get first charset in stylesheet
      var match = data.match(/@charset [^;]+;/);
      var firstCharset = match ? match[0] : null;
      if (!firstCharset)
        return;

      // reattach first charset and remove all subsequent
      data = firstCharset +
        (options.keepBreaks ? lineBreak : '') +
        data.replace(new RegExp('@charset [^;]+;(' + lineBreak + ')?', 'g'), '');
    });

    if (options.removeEmpty) {
      // empty elements
      replace(/[^\{\}]+\{\}/g, '');

      // empty @media declarations
      replace(/@media [^\{]+\{\}/g, '');
    }

    // trim spaces at beginning and end
    return data.trim();
  },

  // Inlines all imports taking care of repetitions, unknown files, and cilcular dependencies
  _inlineImports: function(data, options) {
    var tempData = [];
    var nextStart = 0;
    var nextEnd = 0;
    var cursor = 0;

    options.relativeTo = options.relativeTo || options.root;
    options._baseRelativeTo = options._baseRelativeTo || options.relativeTo;
    options.visited = options.visited || [];

    var inlinedFile = function() {
      var importedFile = data
        .substring(data.indexOf(' ', nextStart) + 1, nextEnd)
        .replace(/^url\(/, '')
        .replace(/\)$/, '')
        .replace(/['"]/g, '');

      if (/^(http|https):\/\//.test(importedFile) || /^\/\//.test(importedFile))
        return '@import url(' + importedFile + ');';

      var relativeTo = importedFile[0] == '/' ?
        options.root :
        options.relativeTo;

      var fullPath = path.resolve(path.join(relativeTo, importedFile));

      if (existsSync(fullPath) && fs.statSync(fullPath).isFile() && options.visited.indexOf(fullPath) == -1) {
        options.visited.push(fullPath);

        var importedData = fs.readFileSync(fullPath, 'utf8');
        var importRelativeTo = path.dirname(fullPath);
        importedData = CleanCSS._rebaseRelativeURLs(importedData, importRelativeTo, options._baseRelativeTo);
        return CleanCSS._inlineImports(importedData, {
          root: options.root,
          relativeTo: importRelativeTo,
          _baseRelativeTo: options.baseRelativeTo,
          visited: options.visited
        });
      } else {
        return '';
      }
    };

    for (; nextEnd < data.length; ) {
      nextStart = data.indexOf('@import', cursor);
      if (nextStart == -1)
        break;

      nextEnd = data.indexOf(';', nextStart);
      if (nextEnd == -1)
        break;

      tempData.push(data.substring(cursor, nextStart));
      tempData.push(inlinedFile());
      cursor = nextEnd + 1;
    }

    return tempData.length > 0 ?
      tempData.join('') + data.substring(cursor, data.length) :
      data;
  },

  _rebaseRelativeURLs: function(data, fromBase, toBase) {
    var tempData = [];
    var nextStart = 0;
    var nextEnd = 0;
    var cursor = 0;

    for (; nextEnd < data.length; ) {
      nextStart = data.indexOf('url(', nextEnd);
      if (nextStart == -1)
        break;
      nextEnd = data.indexOf(')', nextStart + 4);
      if (nextEnd == -1)
        break;

      tempData.push(data.substring(cursor, nextStart));
      var url = data.substring(nextStart + 4, nextEnd).replace(/['"]/g, '');
      if (url[0] != '/' && url.indexOf('data:') !== 0 && url.substring(url.length - 4) != '.css') {
        url = path.relative(toBase, path.join(fromBase, url)).replace(/\\/g, '/');
      }
      tempData.push('url(' + url + ')');
      cursor = nextEnd + 1;
    }

    return tempData.length > 0 ?
      tempData.join('') + data.substring(cursor, data.length) :
      data;
  },

  // Strip special comments (/*! ... */) by replacing them by __CSSCOMMENT__ marker
  // for further restoring. Plain comments are removed. It's done by scanning datq using
  // String#indexOf scanning instead of regexps to speed up the process.
  _stripComments: function(context, data) {
    var tempData = [];
    var nextStart = 0;
    var nextEnd = 0;
    var cursor = 0;

    for (; nextEnd < data.length; ) {
      nextStart = data.indexOf('/*', nextEnd);
      nextEnd = data.indexOf('*/', nextStart + 2);
      if (nextStart == -1 || nextEnd == -1)
        break;

      tempData.push(data.substring(cursor, nextStart));
      if (data[nextStart + 2] == '!') {
        // in case of special comments, replace them with a placeholder
        context.specialComments.push(data.substring(nextStart, nextEnd + 2));
        tempData.push('__CSSCOMMENT__');
      }
      cursor = nextEnd + 2;
    }

    return tempData.length > 0 ?
      tempData.join('') + data.substring(cursor, data.length) :
      data;
  },

  // Strip content tags by replacing them by the __CSSFREETEXT__
  // marker for further restoring. It's done via string scanning
  // instead of regexps to speed up the process.
  _stripFreeText: function(context, data) {
    var tempData = [];
    var nextStart = 0;
    var nextEnd = 0;
    var cursor = 0;
    var matchedParenthesis = null;
    var singleParenthesis = "'";
    var doubleParenthesis = '"';
    var dataLength = data.length;

    for (; nextEnd < data.length; ) {
      var nextStartSingle = data.indexOf(singleParenthesis, nextEnd + 1);
      var nextStartDouble = data.indexOf(doubleParenthesis, nextEnd + 1);

      if (nextStartSingle == -1)
        nextStartSingle = dataLength;
      if (nextStartDouble == -1)
        nextStartDouble = dataLength;

      if (nextStartSingle < nextStartDouble) {
        nextStart = nextStartSingle;
        matchedParenthesis = singleParenthesis;
      } else {
        nextStart = nextStartDouble;
        matchedParenthesis = doubleParenthesis;
      }

      if (nextStart == -1)
        break;

      nextEnd = data.indexOf(matchedParenthesis, nextStart + 1);
      if (nextStart == -1 || nextEnd == -1)
        break;

      tempData.push(data.substring(cursor, nextStart));
      tempData.push('__CSSFREETEXT__');
      context.freeTextBlocks.push(data.substring(nextStart, nextEnd + 1));
      cursor = nextEnd + 1;
    }

    return tempData.length > 0 ?
      tempData.join('') + data.substring(cursor, data.length) :
      data;
  },

  // Strip urls by replacing them by the __URL__
  // marker for further restoring. It's done via string scanning
  // instead of regexps to speed up the process.
  _stripUrls: function(context, data) {
    var nextStart = 0;
    var nextEnd = 0;
    var cursor = 0;
    var tempData = [];

    for (; nextEnd < data.length; ) {
      nextStart = data.indexOf('url(', nextEnd);
      if (nextStart == -1)
        break;

      nextEnd = data.indexOf(')', nextStart);

      tempData.push(data.substring(cursor, nextStart));
      tempData.push('__URL__');
      context.urlBlocks.push(data.substring(nextStart, nextEnd + 1));
      cursor = nextEnd + 1;
    }

    return tempData.length > 0 ?
      tempData.join('') + data.substring(cursor, data.length) :
      data;
  },

  // HSL to RGB converter. Both methods taken and adapted from:
  // http://mjijackson.com/2008/02/rgb-to-hsl-and-rgb-to-hsv-color-model-conversion-algorithms-in-javascript
  _hslToRgb: function(h, s, l) {
    var r, g, b;

    h = ~~h / 360;
    s = ~~s / 100;
    l = ~~l / 100;

    if (s === 0) {
      r = g = b = l; // achromatic
    } else {
      var q = l < 0.5 ?
        l * (1 + s) :
        l + s - l * s;
      var p = 2 * l - q;
      r = this._hueToRgb(p, q, h + 1/3);
      g = this._hueToRgb(p, q, h);
      b = this._hueToRgb(p, q, h - 1/3);
    }

    return [~~(r * 255), ~~(g * 255), ~~(b * 255)];
  },

  _hueToRgb: function(p, q, t) {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  }
};

module.exports = CleanCSS;
