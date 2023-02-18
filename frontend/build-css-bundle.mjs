import { vanillaExtractPlugin } from '@vanilla-extract/esbuild-plugin'
import esbuild from 'esbuild'
import stylePlugin from 'esbuild-style-plugin'
import fs from 'node:fs'
import tailwindcss from 'tailwindcss'

const watchedFiles = ['**.scss', '**.css.ts']

const ignorePlugin = {
	name: 'ignore-imports',
	setup(build) {
		build.onLoad({ filter: /\.(png|gif|jpeg)$/ }, () => ({ contents: '' }))
	},
}

// const isModule = path.endsWith('.module.scss')
// console.log('building', path)
const result = await esbuild.build({
	entryPoints: ['./src/index.tsx'],
	// entryNames: '[dir]/[name][ext]',
	// outExtension: { '.js': '.scss.js' },
	bundle: true,
	// TODO: support user supplied sourcemaps
	// sourcemap: true,
	format: 'esm',
	allowOverwrite: true,
	platform: 'browser',
	outdir: './src/bundles/built/',
	minify: true,
	splitting: false,
	target: 'esnext',
	plugins: [
		stylePlugin({
			cssModulesOptions: {
				localsConvention: 'camelCaseOnly',
			},
			postcss: {
				plugins: [tailwindcss()],
			},
		}),
		ignorePlugin,
		vanillaExtractPlugin({ identifiers: 'short' }),
	],
	external: [],
	write: false,
	logLevel: 'warning',
})

const cssOutput = result.outputFiles.find(({ path }) =>
	path.endsWith('index.css'),
)

await fs.promises.writeFile('./src/bundles/index.css', cssOutput.contents)
// console.log('built', path)
