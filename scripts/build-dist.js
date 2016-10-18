var outputFile = require("output-file-sync");
var each       = require("lodash/collection/each");
var _          = require("lodash");
var helpers    = require("babel-helpers");
var babel      = require("babel-core");
var t          = require("babel-types");
var path       = require("path");
var fs         = require("fs");


function relative(filename) {
  return __dirname + "/../" + filename;
}

function writeFile(filename, content) {
  filename = relative(filename);
  outputFile(filename, content);
}

var transformOpts = {
  presets: [
    require("babel-preset-es2015")
  ],

  plugins: [
    [require("babel-plugin-transform-es2015-modules-commonjs"), {loose: true, strict: false}],
    require("babel-plugin-transform-es3-member-expression-literals"),
    require("babel-plugin-transform-es3-property-literals")
  ]
};

function buildRuntimeRewritePlugin(relativePath, helperName) {
  return {
    pre: function (file){
      var original = file.get("helperGenerator");
      file.set("helperGenerator", function(name){
        if (!original) return;

        // make sure that helpers won't insert circular references to themselves
        if (name === helperName) return;

        return original(name);
      });
    }
  };
}

function buildHelper(helperName) {
  var tree = t.program([
    t.exportDefaultDeclaration(helpers.get(helperName))
  ]);

  return babel.transformFromAst(tree, null, {
    presets: transformOpts.presets,
    plugins: transformOpts.plugins.concat([buildRuntimeRewritePlugin("..", helperName)])
  }).code;
}

each(helpers.list, function (helperName) {
  writeFile("lib/" + helperName + ".js", buildHelper(helperName));

  // compat
  var helperAlias = _.kebabCase(helperName);
  var content = "module.exports = require(\"./" + helperName + ".js\");";
  writeFile("lib/_" + helperAlias + ".js", content);
  if (helperAlias !== helperName) writeFile("lib/" + helperAlias + ".js", content);
});

// apply overrides from the overrides folder
var overridesFolder = path.join(__dirname, 'overrides');
fs.readdir(overridesFolder, function(err, entries) {
  if (!err) {
    each(entries, function(entryName) {
      try {
        var filePath = path.join(overridesFolder, entryName);
        var stats = fs.statSync(filePath);

        if (stats.isFile()) {
          fs.writeFileSync("lib/" + entryName, fs.readFileSync(filePath));
        }
      } catch(e) {
        console.log(e);
      }
    });
  }
});
