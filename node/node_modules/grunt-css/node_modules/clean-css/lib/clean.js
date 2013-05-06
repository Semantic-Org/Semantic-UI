/**
 * Clean-css - https://github.com/GoalSmashers/clean-css
 * Released under the terms of MIT license
 *
 * Copyright (C) 2011-2012 GoalSmashers.com
 */

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
      contentBlocks: []
    };
    var replace = function() {
      if (typeof arguments[0] == 'function')
        arguments[0]();
      else
        data = data.replace.apply(data, arguments);
    };
    var lineBreak = process.platform == 'win32' ? '\r\n' : '\n';

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

    // strip comments one by one
    replace(function stripComments() {
      data = CleanCSS._stripComments(context, data);
    });

    // replace content: with a placeholder
    replace(function stripContent() {
      data = CleanCSS._stripContent(context, data);
    });

    // strip url's parentheses if possible (no spaces inside)
    replace(/url\(['"]([^\)]+)['"]\)/g, function(urlMatch) {
      if (urlMatch.match(/\s/g) !== null)
        return urlMatch;
      else
        return urlMatch.replace(/\(['"]/, '(').replace(/['"]\)$/, ')');
    });

    // line breaks
    if (!options.keepBreaks)
      replace(/[\r]?\n/g, '');

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
    replace(/([\(\{\}:;=,\n]) /g, '$1');
    replace(/ ([!\)\{\};=,\n])/g, '$1');
    replace(/(?:\r\n|\n)\}/g, '}');
    replace(/([\{;,])(?:\r\n|\n)/g, '$1');
    replace(/content :/g, 'content:');

    // restore spaces inside IE filters (IE 7 issue)
    replace(/progid:[^(]+\(([^\)]+)/g, function(match) {
      return match.replace(/,/g, ', ');
    });

    // trailing semicolons
    replace(/;\}/g, '}');

    // strip quotation in animations & font names
    replace(/(animation|animation\-name|font|font\-family):([^;}]+)/g, function(match, propertyName, fontDef) {
      return propertyName + ':' + fontDef.replace(/['"]([\w\-]+)['"]/g, '$1');
    });

    // strip quotation in @keyframes
    replace(/@(\-moz\-|\-o\-|\-webkit\-)?keyframes ([^{]+)/g, function(match, prefix, name) {
      prefix = prefix || '';
      return '@' + prefix + 'keyframes ' + (name.indexOf(' ') > -1 ? name : name.replace(/['"]/g, ''));
    });

    // strip quotation in attribute values
    replace(/\[([^\]]+)\]/g, function(match, content) {
      var eqIndex = content.indexOf('=');
      if (eqIndex < 0 && content.indexOf('\'') < 0 && content.indexOf('"') < 0)
        return match;

      var key = content.substring(0, eqIndex);
      var value = content.substring(eqIndex + 1, content.length);

      if (/^['"](?:[a-zA-Z][a-zA-Z\d\-]+)['"]$/.test(value))
        return '[' + key + '=' + value.substring(1, value.length - 1) + ']';
      else
        return match;
    });

    // rgb to hex colors
    replace(/rgb\s*\(([^\)]+)\)/g, function(match, color) {
      var parts = color.split(',');
      var encoded = '#';
      for (var i = 0; i < 3; i++) {
        var asHex = parseInt(parts[i], 10).toString(16);
        encoded += asHex.length == 1 ? '0' + asHex : asHex;
      }
      return encoded;
    });

    // long color hex to short hex
    replace(/([,: \(])#([0-9a-f]{6})/gi, function(match, prefix, color) {
      if (color[0] == color[1] && color[2] == color[3] && color[4] == color[5])
        return prefix + '#' + color[0] + color[2] + color[4];
      else
        return prefix + '#' + color;
    });

    // replace color name with hex values if shorter (or other way around)
    ['toHex', 'toName'].forEach(function(type) {
      var pattern = "(" + Object.keys(CleanCSS.colors[type]).join('|') + ")";
      var colorSwitcher = function(match, prefix, colorValue, suffix) {
        return prefix + CleanCSS.colors[type][colorValue] + suffix;
      };
      replace(new RegExp("([ :,\(])" + pattern + "([;\\}!\\) ])", 'g'), colorSwitcher);
      replace(new RegExp("(,)" + pattern + "(,)", 'g'), colorSwitcher);
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

    // IE shorter filters but only if single (IE 7 issue)
    replace(/progid:DXImageTransform\.Microsoft\.(Alpha|Chroma)(\([^\)]+\))([;}'"])/g, function(match, filter, args, suffix) {
      return filter.toLowerCase() + args + suffix;
    });

    // zero + unit to zero
    replace(/(\s|:|,)0(?:px|em|ex|cm|mm|in|pt|pc|%)/g, '$1' + '0');
    replace(/rect\(0(?:px|em|ex|cm|mm|in|pt|pc|%)/g, 'rect(0');

    // restore 0% in hsl/hsla
    replace(/(hsl|hsla)\(([^\)]+)\)/g, function(match, colorFunction, colorDef) {
      var tokens = colorDef.split(',');
      if (tokens[1] == "0") tokens[1] = '0%';
      if (tokens[2] == "0") tokens[2] = '0%';
      return colorFunction + "(" + tokens.join(',') + ")";
    });

    // none to 0
    replace(/(border|border-top|border-right|border-bottom|border-left|outline):none/g, '$1:0');

    // background:none to 0
    replace(/(background):none([;}])/g, '$1:0$2');

    // multiple zeros into one
    replace(/:0 0 0 0([^\.])/g, ':0$1');
    replace(/([: ,=\-])0\.(\d)/g, '$1.$2');

    // shorthand notations
    var shorthandRegex = function(repeats, hasSuffix) {
      var pattern = "(padding|margin|border\\-width|border\\-color|border\\-style|border\\-radius):";
      for (var i = 0; i < repeats; i++) {
        pattern += "([\\d\\w\\.%#\\(\\),]+)" + (i < repeats - 1 ? ' ' : '');
      }
      return new RegExp(pattern + (hasSuffix ? '([;}])' : ''), 'g');
    };

    // 4 size values into less
    replace(shorthandRegex(4), function(match, property, size1, size2, size3, size4) {
      if (size1 === size2 && size1 === size3 && size1 === size4)
        return property + ':' + size1;
      else if (size1 === size3 && size2 === size4)
        return property + ':' + size1 + ' ' + size2;
      else if (size2 == size4)
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
        return property + ":" + size1 + suffix;
      else
        return match;
    });

    // restore rect(...) zeros syntax for 4 zeros
    replace(/rect\(\s?0(\s|,)0[ ,]0[ ,]0\s?\)/g, 'rect(0$10$10$10)');

    // empty elements
    if (options.removeEmpty)
      replace(/[^\}]+?\{\}/g, '');

    // move first charset to the beginning
    if (data.indexOf('charset') > 0)
      replace(/(.+)(@charset [^;]+;)/, '$2$1');

    // remove all extra charsets that are not at the beginning
    replace(/(.)(?:@charset [^;]+;)/g, '$1');

    // remove universal selector when not needed (*#id, *.class etc)
    replace(/\*([\.#:\[])/g, '$1');

    // Restore special comments, content content, and spaces inside calc back
    var specialCommentsCount = context.specialComments.length;

    replace(/calc\([^\}]+\}/g, function(match) {
      return match.replace(/\+/g, ' + ');
    });
    replace(/__CSSCOMMENT__/g, function() {
      switch (options.keepSpecialComments) {
        case '*':
          return context.specialComments.shift();
        case 1:
          return context.specialComments.length == specialCommentsCount ?
            context.specialComments.shift() :
            '';
        case 0:
          return '';
      }
    });
    replace(/__CSSCONTENT__/g, function() {
      return context.contentBlocks.shift();
    });

    // trim spaces at beginning and end
    return data.trim();
  },

  // Strips special comments (/*! ... */) by replacing them by __CSSCOMMENT__ marker
  // for further restoring. Plain comments are removed. It's done by scanning datq using
  // String#indexOf scanning instead of regexps to speed up the process.
  _stripComments: function(context, data) {
    var tempData = [],
      nextStart = 0,
      nextEnd = 0,
      cursor = 0;

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

  // Strips content tags by replacing them by __CSSCONTENT__ marker
  // for further restoring. It's done via string scanning instead of
  // regexps to speed up the process.
  _stripContent: function(context, data) {
    var tempData = [],
      nextStart = 0,
      nextEnd = 0,
      cursor = 0,
      matchedParenthesis = null;

    // Finds either first (matchedParenthesis == null) or second matching parenthesis
    // so we can determine boundaries of content block.
    var nextParenthesis = function(pos) {
      var min,
        max = data.length;

      if (matchedParenthesis) {
        min = data.indexOf(matchedParenthesis, pos);
        if (min == -1)
          min = max;
      } else {
        var next1 = data.indexOf("'", pos);
        var next2 = data.indexOf('"', pos);
        if (next1 == -1)
          next1 = max;
        if (next2 == -1)
          next2 = max;

        min = next1 > next2 ? next2 : next1;
      }

      if (min == max)
        return -1;

      if (matchedParenthesis) {
        matchedParenthesis = null;
        return min;
      } else {
        // check if there's anything else between pos and min that doesn't match ':' or whitespace
        if (/[^:\s]/.test(data.substring(pos, min)))
          return -1;

        matchedParenthesis = data.charAt(min);
        return min + 1;
      }
    };

    for (; nextEnd < data.length; ) {
      nextStart = data.indexOf('content', nextEnd);
      if (nextStart == -1)
        break;

      nextStart = nextParenthesis(nextStart + 7);
      nextEnd = nextParenthesis(nextStart);
      if (nextStart == -1 || nextEnd == -1)
        break;

      tempData.push(data.substring(cursor, nextStart - 1));
      tempData.push('__CSSCONTENT__');
      context.contentBlocks.push(data.substring(nextStart - 1, nextEnd + 1));
      cursor = nextEnd + 1;
    }

    return tempData.length > 0 ?
      tempData.join('') + data.substring(cursor, data.length) :
      data;
  }
};

module.exports = CleanCSS;
