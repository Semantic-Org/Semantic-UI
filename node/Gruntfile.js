module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-bower-task');
  grunt.loadNpmTasks('grunt-css');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-copy');
  var gruntConfig = require('./grunt-config.json');
  grunt.initConfig({
    min: {
      js: {
        src: [
          "out/javascript/library/jquery.js",
          "out/javascript/library/ace/ace.js",
          "out/javascript/library/sidr.js",
          "out/javascript/library/waypoints.js",
          "out/modules/behavior/state.js",
          "out/modules/ui/shape.js",
          "out/javascript/semantic.js"
        ],
        dest: "out/scripts/all.min.js"
      }
    },
    "concat": {
      "css": {
        "src": [
          "out/stylesheets/reset.css",
          "out/stylesheets/semantic.css",
          "out/ui/flat/elements/icons.css",
          "out/ui/flat/elements/button.css",
          "out/ui/flat/elements/checkbox.css",
          "out/ui/flat/elements/label.css",
          "out/ui/flat/elements/divider.css",
          "out/ui/flat/elements/block.css",
          "out/ui/flat/elements/segment.css",
          "out/ui/flat/collections/grid.css",
          "out/ui/flat/collections/form.css",
          "out/ui/flat/collections/menu.css",
          "out/ui/flat/modules/shape.css",
          "out/stylesheets/library/sidr.css"
        ],
        "dest": "out/styles/all.css"
      }
    },
    "cssmin": {
      "all": {
        "src": ["out/styles/all.css"],
        "dest": "out/styles/all.min.css"
      }
    },
    watch: {
      scripts: {
        files: ["../src/**/*"],
        tasks: ["copy"]
      }
    },
    copy: {
      main: {
        files: [
          {expand: true, src: ["../src/**/*"], dest: 'src/files/components/semantic/src/'}
        ]
      }
    }
  });
  grunt.registerTask('default', Object.keys(gruntConfig).join(' '));
};
