'use strict';

var path = require('path');

var layoutsManager = require('../tasks/lib/layouts_manager');

exports.layouts_manager = {

  defaultLayouts: function(test) {
    test.expect(2);

    var byTypeLayout = layoutsManager.getLayout('byType');
    test.equal(byTypeLayout('js', 'bootstrap'), path.normalize('js/bootstrap'));

    var byComponentLayout = layoutsManager.getLayout('byComponent');
    test.equal(byComponentLayout('sass', 'bourbone'), path.normalize('bourbone/sass'));

    test.done();
  },

  customLayout: function(test) {
    test.expect(1);

    var customLayout = layoutsManager.getLayout(function(type, pkg) {
      return type + pkg;
    });

    test.equal(customLayout('img', 'logo.png'), 'imglogo.png');

    test.done();
  }

};
