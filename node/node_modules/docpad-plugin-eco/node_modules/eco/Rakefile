desc "Build the eco-source gem"
task :gem do
  sh "cake dist"

  require "json"
  require "rubygems"
  require "rubygems/package"

  gemspec = Gem::Specification.new do |s|
    s.name        = "eco-source"
    s.version     = JSON.parse(File.read("package.json"))["version"].gsub("-", ".")
    s.date        = Time.now.strftime("%Y-%m-%d")

    s.homepage    = "https://github.com/sstephenson/eco/"
    s.summary     = "Eco compiler source"
    s.description = "JavaScript source code for the Eco (Embedded CoffeeScript template language) compiler"
    s.files = [
      "lib/eco/eco.js",
      "lib/eco/source.rb"
    ]

    s.authors     = ["Sam Stephenson"]
    s.email       = "sstephenson@gmail.com"
  end

  file = File.open("eco-source-#{gemspec.version}.gem", "w")
  Gem::Package.open(file, "w") do |pkg|
    pkg.metadata = gemspec.to_yaml

    path = "lib/eco/source.rb"
    contents = <<-RUBY
module Eco
  module Source
    VERSION = #{gemspec.version.to_s.inspect}

    def self.bundled_path
      File.expand_path("../eco.js", __FILE__)
    end
  end
end
    RUBY
    pkg.add_file_simple(path, 0644, contents.size) do |tar_io|
      tar_io.write(contents)
    end

    contents = File.read("dist/eco.js")
    path = "lib/eco/eco.js"
    pkg.add_file_simple(path, 0644, contents.size) do |tar_io|
      tar_io.write(contents)
    end
  end

  warn "Built #{file.path}"
end
