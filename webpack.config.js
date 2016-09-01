const
	webpack = require('webpack'),
	path = require('path'),
	loaders = require('./webpack.loaders'),
	HtmlWebpackPlugin = require('html-webpack-plugin'),
	ExtractTextPlugin = require('extract-text-webpack-plugin'),
	precss = require('precss'),
	autoprefixer = require('autoprefixer'),
	postcssNormalize = require('postcss-normalize');

const
	HOST = process.env.HOST || '127.0.0.1',
	PORT = process.env.PORT || '8888';

// global css
loaders.push({
	test: /[\/\\](node_modules|global)[\/\\].*\.css$/,
	loaders: [
		'style?sourceMap',
		'css'
	]
});

// local css modules
loaders.push({
	test: /[\/\\]src[\/\\].*\.css$/,
	loaders: [
		'style?sourceMap',
		'css?modules&importLoaders=1&localIdentName=[path]___[name]__[local]___[hash:base64:5]'
	]
});

module.exports = {
	entry: [
		`webpack-dev-server/client?http://${HOST}:${PORT}`,
		`webpack/hot/only-dev-server`,
		`./src/Main.js`
	],
	devtool: process.env.WEBPACK_DEVTOOL || 'cheap-module-source-map',
	output: {
		path: path.join(__dirname, 'public'),
		filename: 'app.js'
	},
	resolve: {
		extensions: ['', '.js', '.jsx']
	},
	module: {
		loaders
	},
	sassLoader: {
		includePaths: [path.resolve(__dirname, './src/assets/scss')]
	},
	postcss: function () {
		return {
			defaults: [precss, postcssNormalize, autoprefixer],
		};
	},
	imageWebpackLoader: {
		pngquant: {
			quality: '65-90',
			speed: 4
		},
		svgo: {
			plugins: [
				{
					removeViewBox: false
				},
				{
					removeEmptyAttrs: false
				}
			]
		}
	},
	devServer: {
		contentBase: './public',
		noInfo: true,
		hot: true,
		inline: true,
		historyApiFallback: true,
		port: PORT,
		host: HOST,
		headers: {
			'Access-Control-Allow-Origin': '*'
		}
	},
	plugins: [
		new webpack.NoErrorsPlugin(),
		new webpack.HotModuleReplacementPlugin(),
		new ExtractTextPlugin('app.css'),
		new HtmlWebpackPlugin({
			template: './src/template.html',
			title: 'Slothefy'
		})
	]
};
