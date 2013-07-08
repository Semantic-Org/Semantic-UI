var dirname = require('path').dirname;
var Transformer = require('./shared');

/**
 * minifiers must be first in order to be incorporated inside instances of respective output formats
 */
var uglifyJS = require('uglify-js');
exports.uglify = exports.uglifyJS = exports['uglify-js'] = new Transformer({
  name: 'uglify-js',
  engines: ['.'],
  outputFormat: 'js',
  isMinifier: true,
  sync: function (str, options) {
    options.fromString = true;
    return this.cache(options) || this.cache(options, uglifyJS.minify(str, options).code);
  }
});
var uglifyCSS = require('css');
exports.uglifyCSS = exports['uglify-css'] = new Transformer({
  name: 'uglify-css',
  engines: ['.'],
  outputFormat: 'css',
  isMinifier: true,
  sync: function (str, options) {
    options.compress = options.compress != false && options.beautify != true;
    return this.cache(options) || this.cache(options, uglifyCSS.stringify(uglifyCSS.parse(str), options));
  }
});

exports.uglifyJSON = exports['uglify-json'] = new Transformer({
  name: 'uglify-json',
  engines: ['.'],
  outputFormat: 'json',
  isMinifier: true,
  sync: function (str, options) {
    return JSON.stringify(JSON.parse(str), null, options.beautify);
  }
});


/**
 * Syncronous Templating Languages
 */

function sync(str, options) {
  var tmpl = this.cache(options) || this.cache(options, this.engine.compile(str, options));
  return tmpl(options);
}

exports.swig = new Transformer({
  name: 'swig',
  engines: ['swig'],
  outputFormat: 'xml',
  sync: sync
});

exports.atpl = new Transformer({
  name: 'atpl',
  engines: ['atpl'],
  outputFormat: 'xml',
  sync: function sync(str, options) {
    var tmpl = this.cache(options);
    if (!tmpl) {
      var cInfo = {cache: options.cache, filename: options.filename};
      if (options.filename) {
        delete options.filename; //atpl can't handle absolute windows file paths properly
      }
      tmpl = this.cache(cInfo, this.engine.compile(str, options));
    }
    return tmpl(options);
  }
});

exports.dot = new Transformer({
  name: 'dot',
  engines: ['dot'],
  outputFormat: 'xml',
  sync: function sync(str, options) {
    var tmpl = this.cache(options) || this.cache(options, this.engine.template(str));
    return tmpl(options);
  }
});

exports.liquor = new Transformer({
  name: 'liquor',
  engines: ['liquor'],
  outputFormat: 'xml',
  sync: sync
});

exports.ejs = new Transformer({
  name: 'ejs',
  engines: ['ejs'],
  outputFormat: 'xml',
  sync: sync
});

exports.eco = new Transformer({
  name: 'eco',
  engines: ['eco'],
  outputFormat: 'xml',
  sync: sync//N.B. eco's internal this.cache isn't quite right but this bypasses it
});

exports.jqtpl = new Transformer({
  name: 'jqtpl',
  engines: ['jqtpl'],
  outputFormat: 'xml',
  sync: function (str, options) {
    var engine = this.engine;
    var key = (options.cache && options.filename) ? options.filename : '@';
    engine.compile(str, key);
    var res = this.engine.render(key, options);
    if (!(options.cache && options.filename)) {
      delete engine.cache[key];
    }
    this.cache(options, true); // caching handled internally
    return res;
  }
});

exports.haml = new Transformer({
  name: 'haml',
  engines: ['hamljs'],
  outputFormat: 'xml',
  sync: sync
});

exports['haml-coffee'] = new Transformer({
  name: 'haml-coffee',
  engines: ['haml-coffee'],
  outputFormat: 'xml',
  sync: sync
});

exports.whiskers = new Transformer({
  name: 'whiskers',
  engines: ['whiskers'],
  outputFormat: 'xml',
  sync: sync
});

exports.hogan = new Transformer({
  name: 'hogan',
  engines: ['hogan.js'],
  outputFormat: 'xml',
  sync: function(str, options){
    var tmpl = this.cache(options) || this.cache(options, this.engine.compile(str, options));
    return tmpl.render(options, options.partials);
  }
});

exports.handlebars = new Transformer({
  name: 'handlebars',
  engines: ['handlebars'],
  outputFormat: 'xml',
  sync: function(str, options){
    for (var partial in options.partials) {
      this.engine.registerPartial(partial, options.partials[partial]);
    }
    var tmpl = this.cache(options) || this.cache(options, this.engine.compile(str, options));
    return tmpl(options);
  }
});

exports.underscore = new Transformer({
  name: 'underscore',
  engines: ['underscore'],
  outputFormat: 'xml',
  sync: function(str, options){
    var tmpl = this.cache(options) || this.cache(options, this.engine.template(str));
    return tmpl(options);
  }
});

exports.walrus = new Transformer({
  name: 'walrus',
  engines: ['walrus'],
  outputFormat: 'xml',
  sync: function(str, options){
    var tmpl = this.cache(options) || this.cache(options, this.engine.parse(str));
    return tmpl.compile(options);
  }
});

exports.mustache = new Transformer({
  name: 'mustache',
  engines: ['mustache'],
  outputFormat: 'xml',
  sync: function(str, options){
    var tmpl = this.cache(options) || this.cache(options, this.engine.compile(str));
    return tmpl(options, options.partials);
  }
});

exports.templayed = new Transformer({
  name: 'templayed',
  engines: ['templayed'],
  outputFormat: 'xml',
  sync: function(str, options){
    var tmpl = this.cache(options) || this.cache(options, this.engine(str));
    return tmpl(options);
  }
});

exports.plates = new Transformer({
  name: 'plates',
  engines: ['plates'],
  outputFormat: 'xml',
  sync: function(str, options){
    str = this.cache(options) || this.cache(options, str);
    return this.engine.bind(str, options, options.map);
  }
});

exports.mote = new Transformer({
  name: 'mote',
  engines: ['mote'],
  outputFormat: 'xml',
  sync: sync
});

exports.toffee = new Transformer({
  name: 'toffee',
  engines: ['toffee'],
  outputFormat: 'xml',
  sync: function (str, options) {
    var View = this.engine.view;
    var v = this.cache(options) || this.cache(options, new View(str, options));
    var res = v.run(options, require('vm').createContext({}));
    if (res[0]) throw res[0];
    else return res[1];
  }
});

exports.coffeekup = exports.coffeecup = new Transformer({
  name: 'coffeecup',
  engines: ['coffeecup', 'coffeekup'],
  outputFormat: 'xml',
  sync: function (str, options) {
    var compiled = this.cache(options) || this.cache(options, this.engine.compile(str, options));
    return compiled(options);
  }
});

/**
 * Asyncronous Templating Languages
 */

exports.just = new Transformer({
  name: 'just',
  engines: ['just'],
  outputFormat: 'xml',
  sudoSync: true,
  async: function (str, options, cb) {
    var JUST = this.engine;
    var tmpl = this.cache(options) || this.cache(options, new JUST({ root: { page: str }}));
    tmpl.render('page', options, cb);
  }
});

exports.ect = new Transformer({
  name: 'ect',
  engines: ['ect'],
  outputFormat: 'xml',
  sudoSync: true, // Always runs syncronously
  async: function (str, options, cb) {
    var ECT = this.engine;
    var tmpl = this.cache(options) || this.cache(options, new ECT({ root: { page: str }}));
    tmpl.render('page', options, cb);
  }
});

exports.jade = new Transformer({
  name: 'jade',
  engines: ['jade', 'then-jade'],
  outputFormat: 'xml',
  sudoSync: 'The jade file FILENAME could not be rendered syncronously.  N.B. then-jade does not support syncronous rendering.',
  async: function (str, options, cb) {
    this.cache(options, true);//jade handles this.cache internally
    this.engine.render(str, options, cb);
  }
})

exports.dust = new Transformer({
  name: 'dust',
  engines: ['dust', 'dustjs-linkedin'],
  outputFormat: 'xml',
  sudoSync: false,
  async: function (str, options, cb) {
    var ext = 'dust'
      , views = '.';

    if (options) {
      if (options.ext) ext = options.ext;
      if (options.views) views = options.views;
      if (options.settings && options.settings.views) views = options.settings.views;
    }

    this.engine.onLoad = function(path, callback){
      if ('' == extname(path)) path += '.' + ext;
      if ('/' !== path[0]) path = views + '/' + path;
      read(path, options, callback);
    };

    var tmpl = this.cache(options) || this.cache(options, this.engine.compileFn(str));
    if (options && !options.cache) this.engine.cache = {};//invalidate dust's internal cache
    tmpl(options, cb);
  }
});

exports.jazz = new Transformer({
  name: 'jazz',
  engines: ['jazz'],
  outputFormat: 'xml',
  sudoSync: true, // except when an async function is passed to locals
  async: function (str, options, cb) {
    var tmpl = this.cache(options) || this.cache(options, this.engine.compile(str, options));
    tmpl.eval(options, function(str){
      cb(null, str);
    });
  }
});

exports.qejs = new Transformer({
  name: 'qejs',
  engines: ['qejs'],
  outputFormat: 'xml',
  sudoSync: false,
  async: function (str, options, cb) {
    var tmpl = this.cache(options) || this.cache(options, this.engine.compile(str, options));
    tmpl(options).done(function (result) {
        cb(null, result);
    }, function (err) {
        cb(err);
    });
  }
});

/**
 * Stylsheet Languages
 */

exports.less = new Transformer({
  name: 'less',
  engines: ['less'],
  outputFormat: 'css',
  sudoSync: 'The less file FILENAME could not be rendered syncronously.  This is usually because the file contains `@import url` statements.',
  async: function (str, options, cb) {
    var self = this;
    if (self.cache(options)) return cb(null, self.cache(options));
    if (options.filename) {
      options.paths = options.paths || [dirname(options.filename)];
    }
    //If this.cache is enabled, compress by default
    if (options.compress !== true && options.compress !== false) {
      options.compress = options.cache || false;
    }
    if (options.sudoSync) {
      options.syncImport = true;
    }
    var parser = new(this.engine.Parser)(options);
    parser.parse(str, function (err, tree) {
      try {
        if (err) throw err;
        var res = tree.toCSS(options);
        self.cache(options, res);
        cb(null, res);
      } catch (ex) {
        if (!(ex instanceof Error) && typeof ex === 'object') {
          ex.filename = ex.filename || '"Unkown Source"';
          var err = new Error(self.engine.formatError(ex, options).replace(/^[^:]+:/, ''), ex.filename, ex.line);
          err.name = ex.type;
          ex = err;
        }
        console.log('\n\n' + ex.stack + '\n\n');
        return cb(ex);
      }
    });
  }
});

exports.styl = exports.stylus = new Transformer({
  name: 'stylus',
  engines: ['stylus'],
  outputFormat: 'css',
  sudoSync: true,// always runs syncronously
  async: function (str, options, cb) {
    var self = this;
    if (self.cache(options)) return cb(null, self.cache(options));
    if (options.filename) {
      options.paths = options.paths || [dirname(options.filename)];
    }
    //If this.cache is enabled, compress by default
    if (options.compress !== true && options.compress !== false) {
      options.compress = options.cache || false;
    }
    this.engine.render(str, options, function (err, res) {
      if (err) return cb(err);
      self.cache(options, res);
      cb(null, res);
    });
  }
})

exports.sass = new Transformer({
  name: 'sass',
  engines: ['sass'],
  outputFormat: 'css',
  sync: function (str, options) {
    try {
      return this.cache(options) || this.cache(options, this.engine.render(str));
    } catch (ex) {
      if (options.filename) ex.message += ' in ' + options.filename;
      throw ex;
    }
  }
});

/**
 * Miscelaneous
 */

exports.md = exports.markdown = new Transformer({
  name: 'markdown',
  engines: ['marked', 'supermarked', 'markdown-js', 'markdown'],
  outputFormat: 'html',
  sync: function (str, options) {
    var arg = options;
    if (this.engineName === 'markdown') arg = options.dialect; //even if undefined
    return this.cache(options) || this.cache(options, this.engine.parse(str, arg));
  }
});


exports.coffee = exports['coffee-script'] = exports.coffeescript = exports.coffeeScript = new Transformer({
  name: 'coffee-script',
  engines: ['coffee-script'],
  outputFormat: 'js',
  sync: function (str, options) {
    return this.cache(options) || this.cache(options, this.engine.compile(str, options));
  }
});

exports.cson = new Transformer({
  name: 'cson',
  engines: ['cson'],
  outputFormat: 'json',
  sync: function (str, options) {
    //todo: remove once https://github.com/rstacruz/js2coffee/pull/174 accepted & released
    if (global.Narcissus) delete global.Narcissus; //prevent global leak
    return this.cache(options) || this.cache(options, JSON.stringify(this.engine.parseSync(str)));
  }
});

exports.cdata = new Transformer({
  name: 'cdata',
  engines: ['.'],// `.` means "no dependency"
  outputFormat: 'xml',
  sync: function (str, options) {
    return this.cache(options) || this.cache(options, '<![CDATA[\n' + str + '\n]]>');
  }
});

exports.component = exports['component-js'] = new Transformer({
  name: 'component-js',
  engines: ['component-builder'],
  outputFormat: 'js',
  async: function (str, options, cb) {
    if (this.cache(options)) return this.cache(options);
    var self = this;
    var builder = new this.engine(dirname(options.filename));
    if (options.development) {
      builder.development();
    }
    if (options.sourceURLs === true || (options.sourceURLs !== false && options.development)) {
      builder.addSourceURLs();
    }
    var path = require('path');
    builder.paths = (options.paths || ['components']).map(function (p) {
      if (path.resolve(p) === p) {
        return p;
      } else {
        return path.join(dirname(options.filename), p);
      }
    });
    builder.build(function (err, obj) {
      if (err) return cb(err);
      else return cb(null, self.cache(options, obj.require + obj.js));
    });
  }
});

exports['component-css'] = new Transformer({
  name: 'component-css',
  engines: ['component-builder'],
  outputFormat: 'css',
  async: function (str, options, cb) {
    if (this.cache(options)) return this.cache(options);
    var self = this;
    var builder = new this.engine(dirname(options.filename));
    if (options.development) {
      builder.development();
    }
    if (options.sourceURLs === true || (options.sourceURLs !== false && options.development)) {
      builder.addSourceURLs();
    }
    var path = require('path');
    builder.paths = (options.paths || ['components']).map(function (p) {
      if (path.resolve(p) === p) {
        return p;
      } else {
        return path.join(dirname(options.filename), p);
      }
    });
    builder.build(function (err, obj) {
      if (err) return cb(err);
      else return cb(null, self.cache(options, obj.css));
    });
  }
});

exports['html2jade'] = new Transformer({
  name: 'html2jade',
  engines: ['html2jade'],
  outputFormat: 'jade',
  async: function (str, options, cb) {
    return this.cache(options) || this.cache(options, this.engine.convertHtml(str, options, cb));
  }
});

exports['highlight'] = new Transformer({
  name: 'highlight',
  engines: ['highlight.js'],
  outputFormat: 'xml',
  sync: function (str, options, cb) {
    if (this.cache(options)) return this.cache(options);
    if (options.lang) {
      try {
        return this.cache(options, this.engine.highlight(options.lang, str).value);
      } catch (ex) {}
    }
    if (options.auto || !options.lang) {
      try {
        return this.cache(options, this.engine.highlightAuto(str).value);
      } catch (ex) {}
    }
    return this.cache(options, str);
  }
});


/**
 * Marker transformers (they don't actually apply a transformation, but let you declare the 'outputFormat')
 */

exports.css = new Transformer({
  name: 'css',
  engines: ['.'],// `.` means "no dependency"
  outputFormat: 'css',
  sync: function (str, options) {
    return this.cache(options) || this.cache(options, str);
  }
});

exports.js = new Transformer({
  name: 'js',
  engines: ['.'],// `.` means "no dependency"
  outputFormat: 'js',
  sync: function (str, options) {
    return this.cache(options) || this.cache(options, str);
  }
});


