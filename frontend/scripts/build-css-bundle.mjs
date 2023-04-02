import { vanillaExtractPlugin } from '@vanilla-extract/esbuild-plugin'
import esbuild from 'esbuild'
import stylePlugin from 'esbuild-style-plugin'
import * as fs from 'node:fs'
import * as path_ from 'node:path'
import tailwindcss from 'tailwindcss'

const args = process.argv.slice(2)
const watch = args.includes('--watch') || args.includes('-w')

const rootDirectory = process.cwd()
const workingDirectory = path_.join(rootDirectory, './src')
const outputDirectory = path_.join(workingDirectory, '__generated/')

const ignorePlugin = {
	name: 'ignore-imports',
	setup(build) {
		build.onLoad({ filter: /\.(svg|png|gif|jpeg)$/ }, () => ({
			contents: '',
		}))
	},
}

const resultPlugin = {
	name: 'result-plugin',
	setup(build) {
		build.onStart(() => {
			console.log(new Date(), 'building css bundle')
		})
		build.onEnd(async (result) => {
			const cssOutput = result.outputFiles.find(({ path }) =>
				path.endsWith('index.css'),
			)

			await fs.promises.writeFile(
				path_.join(outputDirectory, 'index.css'),
				cssOutput.contents,
			)
			console.log(new Date(), 'built css bundle', cssOutput.path)
		})
	},
}

await fs.promises.mkdir(outputDirectory, { recursive: true })

const context = await esbuild.context({
	entryPoints: [path_.join(workingDirectory, 'index.tsx')],
	bundle: true,
	absWorkingDir: rootDirectory,
	format: 'esm',
	allowOverwrite: true,
	platform: 'browser',
	outdir: outputDirectory,
	outbase: workingDirectory,
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
		resultPlugin,
	],
	external: ['consts:publicGraphURI'],
	write: false,
	logLevel: 'error',
})

if (watch) {
	// esbuild watch is actually polling based, some latency
	// could be optimized away with a custom watcher
	// https://esbuild.github.io/api/#watch
	await context.watch()
} else {
	await context.rebuild()
}
