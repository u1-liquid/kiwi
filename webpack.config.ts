/**
 * webpack configuration
 */

import * as webpack from 'webpack';
import chalk from 'chalk';
const { VueLoaderPlugin } = require('vue-loader');
const ProgressBarPlugin = require('progress-bar-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

const isProduction = process.env.NODE_ENV == 'production';

const locales = require('./locales');
const meta = require('./package.json');

module.exports = {
	entry: {
		app: './src/client/app.ts',
	},
	module: {
		rules: [{
			test: /\.vue$/,
			exclude: /node_modules/,
			use: [{
				loader: 'vue-loader',
				options: {
					cssSourceMap: false,
					compilerOptions: {
						preserveWhitespace: false
					},
					loaders: {
						scss: 'vue-style-loader!css-loader!sass-loader'
					}
				}
			}]
		}, {
			test: /\.scss$/,
			use: [{
				loader: 'vue-style-loader'
			}, {
				loader: 'css-loader'
			}, {
				loader: 'postcss-loader',
				options: {
					plugins: [
						require('cssnano')({
							preset: 'default'
						})
					]
				},
			}, {
				loader: 'sass-loader'
			}]
		}, {
			test: /\.css$/,
			use: [{
				loader: 'vue-style-loader'
			}, {
				loader: 'css-loader'
			}, {
				loader: 'postcss-loader',
				options: {
					plugins: [
						require('cssnano')({
							preset: 'default'
						})
					]
				},
			}]
		}, {
			test: /\.(eot|woff|woff2|svg|ttf)([?]?.*)$/,
			loader: 'url-loader'
		}, {
			test: /\.ts$/,
			exclude: /node_modules/,
			use: [{
				loader: 'ts-loader',
				options: {
					happyPackMode: true,
					configFile: __dirname + '/src/client/tsconfig.json',
					appendTsSuffixTo: [/\.vue$/]
				}
			}]
		}]
	},
	plugins: [
		//new HardSourceWebpackPlugin(),
		new ProgressBarPlugin({
			format: chalk`  {cyan.bold yes we can} {bold [}:bar{bold ]} {green.bold :percent} {gray (:current/:total)} :elapseds`,
			clear: false
		}),
		new webpack.DefinePlugin({
			_VERSION_: JSON.stringify(meta.version),
			_LANGS_: JSON.stringify(Object.keys(locales)),
			_ENV_: JSON.stringify(process.env.NODE_ENV)
		}),
		new webpack.DefinePlugin({
			'process.env.NODE_ENV': JSON.stringify(isProduction ? 'production' : 'development')
		}),
		new VueLoaderPlugin(),
		new webpack.optimize.ModuleConcatenationPlugin()
	],
	output: {
		path: __dirname + '/built/assets',
		filename: `[name].js`,
		publicPath: `/_assets/`
	},
	resolve: {
		extensions: [
			'.js', '.ts', '.json'
		],
		alias: {
			'const.styl': __dirname + '/src/client/const.styl'
		}
	},
	resolveLoader: {
		modules: ['node_modules']
	},
	optimization: {
		minimizer: [new TerserPlugin()]
	},
	cache: true,
	devtool: false, //'source-map',
	mode: isProduction ? 'production' : 'development'
};
