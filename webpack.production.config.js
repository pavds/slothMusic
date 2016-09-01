const
	webpack = require('webpack'),
	path = require('path'),
	loaders = require('./webpack.loaders'),
	ExtractTextPlugin = require('extract-text-webpack-plugin'),
	HtmlWebpackPlugin = require('html-webpack-plugin'),
	WebpackCleanupPlugin = require('webpack-cleanup-plugin'),
	precss = require('precss'),
	autoprefixer = require('autoprefixer'),
	postcssNormalize = require('postcss-normalize');

module.exports = {
	entry: [
		'./src/Main.js'
	],
	output: {
		path: path.join(__dirname, 'public'),
		filename: '[chunkhash].js'
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
			cleaner: [
				autoprefixer({
					browsers: ['last 10 versions', 'Firefox ESR', 'ie >= 11', 'Opera 12.1'],
					flexbox: 'no-2009',
					cascade: false
				})
			]
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
	plugins: [
		new WebpackCleanupPlugin(),
		new webpack.DefinePlugin({
			'process.env': {
				NODE_ENV: '"production"'
			}
		}),
		new webpack.optimize.UglifyJsPlugin({
			compress: {
				warnings: false,
				screw_ie8: true,
				drop_console: true,
				drop_debugger: true
			}
		}),
		new webpack.optimize.OccurenceOrderPlugin(),
		new ExtractTextPlugin('[contenthash].css', {
			allChunks: true
		}),
		new HtmlWebpackPlugin({
			template: './src/template.html',
			title: 'Slothefy'
		})
	]
};
