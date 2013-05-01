var path = require('path')

module.exports = function(fs, ready) {
  var global_files = {}

  var recurse = function(dir, okay) {
    fs.readdir(dir, function(err, dir_files) {
      var countdown = 0
        , files = []
        , dirs  = []
        , checked = 0
      dir_files.forEach(function(file, idx, all) {
        fs.stat(path.join(dir, file), function(err, stat) {
          if(stat.isDirectory() && !/node_modules/g.test(dir)) {
            dirs.push(file)
          } else if(/\.js$/g.test(file)) {
            files.push(file)
          }

          if(++checked >= dir_files.length)
            recurse_dirs()
        })
      })

      function recurse_dirs() {
        var total = 0
        dirs.forEach(function(this_dir) {
          recurse(path.join(dir, this_dir), function(err, data) {
            if(++total >= dirs.length)
              recurse_files() 
          })
        })

        if(!dirs.length)
          recurse_files()
      }

      function recurse_files() {
        var total = 0
        files.forEach(function(file) {
          fs.readFile(path.join(dir, file), 'utf8', function(err, src) {
            global_files[path.join(dir, file)] = src
            ++total >= files.length &&
              okay(null, global_files)
          })
        })

        if(!files.length)
          okay(null, global_files)
      }

      if(!dir_files.length)
        okay(null, global_files)
    })
  }

  recurse('.', ready)
}


