
/**
 * Module dependencies.
 */

var ejs = require('../')
  , assert = require('assert');

module.exports = {
  'test .version': function(){
    assert.ok(/^\d+\.\d+\.\d+$/.test(ejs.version), 'Test .version format');
  },
  
  'test html': function(){
    assert.equal('<p>yay</p>', ejs.render('<p>yay</p>'));
  },
  
  'test buffered code': function(){
    var html = '<p>tj</p>',
      str = '<p><%= name %></p>',
      locals = { name: 'tj' };
    assert.equal(html, ejs.render(str, { locals: locals }));
  },
  
  'test unbuffered code': function(){
    var html = '<p>tj</p>',
      str = '<% if (name) { %><p><%= name %></p><% } %>',
      locals = { name: 'tj' };
    assert.equal(html, ejs.render(str, { locals: locals }));
  },
  
  'test `scope` option': function(){
    var html = '<p>tj</p>',
      str = '<p><%= this %></p>';
    assert.equal(html, ejs.render(str, { scope: 'tj' }));
  },
  
  'test escaping': function(){
    assert.equal('&lt;script&gt;', ejs.render('<%= "<script>" %>'));
    assert.equal('<script>', ejs.render('<%- "<script>" %>'));
  },
  
  'test newlines': function(){
    var html = '\n<p>tj</p>\n<p>tj@sencha.com</p>',
      str = '<% if (name) { %>\n<p><%= name %></p>\n<p><%= email %></p><% } %>',
      locals = { name: 'tj', email: 'tj@sencha.com' };
    assert.equal(html, ejs.render(str, { locals: locals }));
  },
  
  'test single quotes': function(){
    var html = '<p>WAHOO</p>',
      str = "<p><%= up('wahoo') %></p>",
      locals = { up: function(str){ return str.toUpperCase(); }};
    assert.equal(html, ejs.render(str, { locals: locals }));
  },

  'test single quotes in the html': function(){
    var html = '<p>WAHOO that\'s cool</p>',
      str = '<p><%= up(\'wahoo\') %> that\'s cool</p>',
      locals = { up: function(str){ return str.toUpperCase(); }};
    assert.equal(html, ejs.render(str, { locals: locals }));
  },

  'test multiple single quotes': function() {
    var html = "<p>couldn't shouldn't can't</p>",
      str = "<p>couldn't shouldn't can't</p>";
    assert.equal(html, ejs.render(str));
  },

  'test single quotes inside tags': function() {
    var html = '<p>string</p>',
      str = "<p><%= 'string' %></p>";
    assert.equal(html, ejs.render(str));
  },

  'test back-slashes in the document': function() {
    var html = "<p>backslash: '\\'</p>",
      str = "<p>backslash: '\\'</p>";
    assert.equal(html, ejs.render(str));
  },
  
  'test double quotes': function(){
    var html = '<p>WAHOO</p>',
      str = '<p><%= up("wahoo") %></p>',
      locals = { up: function(str){ return str.toUpperCase(); }};
    assert.equal(html, ejs.render(str, { locals: locals }));
  },
  
  'test multiple double quotes': function() {
    var html = '<p>just a "test" wahoo</p>',
      str = '<p>just a "test" wahoo</p>';
    assert.equal(html, ejs.render(str));
  },
  
  'test whitespace': function(){
    var html = '<p>foo</p>',
      str = '<p><%="foo"%></p>';
    assert.equal(html, ejs.render(str));

    var html = '<p>foo</p>',
      str = '<p><%=bar%></p>';
    assert.equal(html, ejs.render(str, { locals: { bar: 'foo' }}));
  },
  
  'test custom tags': function(){
    var html = '<p>foo</p>',
      str = '<p>{{= "foo" }}</p>';

    assert.equal(html, ejs.render(str, {
      open: '{{',
      close: '}}'
    }));

    var html = '<p>foo</p>',
      str = '<p><?= "foo" ?></p>';

    assert.equal(html, ejs.render(str, {
      open: '<?',
      close: '?>'
    }));
  },

  'test custom tags over 2 chars': function(){
    var html = '<p>foo</p>',
      str = '<p>{{{{= "foo" }>>}</p>';

    assert.equal(html, ejs.render(str, {
      open: '{{{{',
      close: '}>>}'
    }));

    var html = '<p>foo</p>',
      str = '<p><??= "foo" ??></p>';

    assert.equal(html, ejs.render(str, {
      open: '<??',
      close: '??>'
    }));
  },
  
  'test global custom tags': function(){
    var html = '<p>foo</p>',
      str = '<p>{{= "foo" }}</p>';
    ejs.open = '{{';
    ejs.close = '}}';
    assert.equal(html, ejs.render(str));
    delete ejs.open;
    delete ejs.close;
  },
  
  'test iteration': function(){
    var html = '<p>foo</p>',
      str = '<% for (var key in items) { %>'
        + '<p><%= items[key] %></p>'
        + '<% } %>';
    assert.equal(html, ejs.render(str, {
      locals: {
        items: ['foo']
      }
    }));
    
    var html = '<p>foo</p>',
      str = '<% items.forEach(function(item){ %>'
        + '<p><%= item %></p>'
        + '<% }) %>';
    assert.equal(html, ejs.render(str, {
      locals: {
        items: ['foo']
      }
    }));
  },
  
  'test filter support': function(){
    var html = 'Zab',
      str = '<%=: items | reverse | first | reverse | capitalize %>';
    assert.equal(html, ejs.render(str, {
      locals: {
        items: ['foo', 'bar', 'baz']
      }
    }));
  },
  
  'test filter argument support': function(){
    var html = 'tj, guillermo',
      str = '<%=: users | map:"name" | join:", " %>';
    assert.equal(html, ejs.render(str, {
      locals: {
        users: [
          { name: 'tj' },
          { name: 'guillermo' }
        ]
      }
    }));
  },
  
  'test sort_by filter': function(){
    var html = 'tj',
      str = '<%=: users | sort_by:"name" | last | get:"name" %>';
    assert.equal(html, ejs.render(str, {
      locals: {
        users: [
          { name: 'guillermo' },
          { name: 'tj' },
          { name: 'mape' }
        ]
      }
    }));
  },
  
  'test custom filters': function(){
    var html = 'Welcome Tj Holowaychuk',
      str = '<%=: users | first | greeting %>';

    ejs.filters.greeting = function(user){
      return 'Welcome ' + user.first + ' ' + user.last + '';
    };

    assert.equal(html, ejs.render(str, {
      locals: {
        users: [
          { first: 'Tj', last: 'Holowaychuk' }
        ]
      }
    }));
  },

  'test useful stack traces': function(){  
    var str = [
      "A little somethin'",
      "somethin'",
      "<% if (name) { %>", // Failing line 
      "  <p><%= name %></p>",
      "  <p><%= email %></p>",
      "<% } %>"
    ].join("\n");
    
    try {
      ejs.render(str)
    } catch( err ){
      assert.includes(err.message,"name is not defined");
      assert.eql(err.name,"ReferenceError");
      var lineno = parseInt(err.toString().match(/ejs:(\d+)\n/)[1]);
      assert.eql(lineno,3,"Error should been thrown on line 3, was thrown on line "+lineno);
    }
  },
  
  'test useful stack traces multiline': function(){  
    var str = [
      "A little somethin'",
      "somethin'",
      "<% var some = 'pretty';",
      "   var multiline = 'javascript';",
      "%>",
      "<% if (name) { %>", // Failing line 
      "  <p><%= name %></p>",
      "  <p><%= email %></p>",
      "<% } %>"
    ].join("\n");
    
    try {
      ejs.render(str)
    } catch( err ){
      assert.includes(err.message,"name is not defined");
      assert.eql(err.name,"ReferenceError");
      var lineno = parseInt(err.toString().match(/ejs:(\d+)\n/)[1]);
      assert.eql(lineno,6,"Error should been thrown on line 3, was thrown on line "+lineno);
    }
  }
};
