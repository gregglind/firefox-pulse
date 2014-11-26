
// can't figure out where webpack lives, irritatingly
//var webpack = require("webpack");
//console.log(require.paths)
//var CommonsChunkPlugin = require("./lib/optimize/CommonsChunkPlugin");
//var commonsPlugin =
//  new CommonsChunkPlugin('common.js');

module.exports = {
	//context: __dirname + "/app",
	entry: {
        uitest:  "./src/ui-demos",
        after:  "./src/after"

		//Doorhanger2: "./src/entry2",
	},
	output: {
	    //path: __dirname + "/dist",
	    path: __dirname,
	    filename: "packed-[name].js"
	},
    module: {
        loaders: [
            { test: /\.css$/, loader: "style!css" }
        ]
    },
    resolve : {
    	// relative to 'entry' above
        alias: {
            jquery: "./thirdparty/jquery/jquery.js",
            //aplugin: "./aplugin/popper.js",
            //uistuff: "../../ui.js"
        }
    }
    // unclear how to get split to work, given 'no webpack' errors from cli
    //plugins: [
    //	commonsPlugin
    //  	//new webpack.optimize.CommonsChunkPlugin(/* chunkName= */"vendor", /* filename= */"vendor.bundle.js")
  	//]
};

/*
module.exports = {
  entry: './main.js',
  output: {
    filename: 'bundle.js'
  }
};

*/
