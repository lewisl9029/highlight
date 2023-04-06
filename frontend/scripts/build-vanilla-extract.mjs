import { vanillaExtractPlugin } from '@vanilla-extract/esbuild-plugin'
import chokidar from 'chokidar'
import esbuild from 'esbuild'
import * as fs from 'node:fs'
import * as path_ from 'node:path'
import readdirp from 'readdirp'

const args = process.argv.slice(2)
const watch = args.includes('--watch') || args.includes('-w')

const packageJson = JSON.parse(await fs.promises.readFile('../package.json'))

// We actually need to watch all .ts/.tsx files and rebuild everything
// since .css.ts can technically import from anywhere
// Should probably use them as entry points and use native esbuild watcher instead
// Blocked by https://github.com/evanw/esbuild/issues/1204#issuecomment-1483294233
const entryPointGlobs = ['**/**.css.ts']
const inputGlobs = ['**/**.ts', '**/**.tsx']

const rootDirectory = process.cwd()
const workingDirectory = path_.join(rootDirectory, './src')
const outputDirectory = path_.join(workingDirectory, '__generated/ve')

// uncomment for cleanup
// await fs.promises.rm(outputDirectory, { recursive: true, force: true })

let entryPoints = Object.fromEntries(
	(
		await readdirp.promise(workingDirectory, {
			fileFilter: entryPointGlobs,
			directoryFilter: ['!__generated', '!graph/generated'],
		})
	).map(({ path }) => [path, path_.join(workingDirectory, path)]),
)

const ignorePlugin = {
	name: 'ignore-imports',
	setup(build) {
		build.onLoad({ filter: /\.(svg|png|gif|jpeg|scss|css)$/ }, () => ({
			contents: '',
		}))
	},
}

const resultPlugin = {
	name: 'result-plugin',
	setup(build) {
		build.onEnd(async (result) => {
			const cssBundleOutput = result.outputFiles.find(({ path }) =>
				path.endsWith('index.css'),
			)

			const jsEntryPointsOutputs = result.outputFiles.filter(({ path }) =>
				path.endsWith('.css.js'),
			)

			await Promise.all([
				fs.promises.mkdir(outputDirectory, { recursive: true }),
				...jsEntryPointsOutputs.map(({ path }) =>
					fs.promises.mkdir(path_.dirname(path), { recursive: true }),
				),
			])
			await Promise.all([
				fs.promises.writeFile(
					path_.join(outputDirectory, 'index.css'),
					cssBundleOutput.contents,
				),
				...jsEntryPointsOutputs.map(({ path, contents }) =>
					fs.promises.writeFile(path, contents),
				),
			])
		})
	},
}

const build = async (path) => {
	console.log(
		new Date(),
		'building vanilla extract entry points & bundle',
		path,
	)
	await esbuild.build({
		entryPoints: ['index.tsx', ...Object.values(entryPoints)],
		bundle: true,
		// TODO: support user supplied sourcemaps
		// sourcemap: true,
		format: 'esm',
		platform: 'browser',
		outdir: outputDirectory,
		outbase: workingDirectory,
		minify: true,
		splitting: false,
		target: 'esnext',
		// Working directory apparently affects vanilla extract's hashes?
		// Using rootDirectory to stay consistent with vite setup
		absWorkingDir: rootDirectory,
		plugins: [
			vanillaExtractPlugin({
				// We don't output css here, only the js modules for each stylesheet entrypoint
				// outputCss: false,
				identifiers: 'short',
			}),
			ignorePlugin,
			resultPlugin,
		],
		external: [
			'__generated/*',
			...Object.entries(packageJson.dependencies).flatMap(
				([name, spec]) =>
					!spec.startsWith('workspace:') ? [name] : [],
			),
		],
		write: false,
		logLevel: 'error',
	})
	console.log(new Date(), 'built vanilla extract entry points & bundle')
	return
}

const isEntryPoint = (path) => path.endsWith('.css.ts')

if (watch) {
	// No await here since we don't want to delay watcher and miss updates
	build()

	chokidar
		.watch(inputGlobs, {
			cwd: workingDirectory,
			ignoreInitial: true,
			ignored: [
				'**/__generated/**/**',
				'**/graph/generated/**/**',
				'**/**.d.ts',
			],
		})
		.on('add', (path) => {
			if (isEntryPoint(path)) {
				console.log(
					new Date(),
					'adding vanilla extract entry point',
					path,
				)
				entryPoints[path] = path_.join(workingDirectory, path)
			}
			// We'll probably run into race conditions with concurrent edits here...
			// TODO: make it more robust with some debouncing + transaction tracking
			build(path)
		})
		.on('change', (path) => build(path))
		.on('unlink', (path) => {
			if (isEntryPoint(path)) {
				delete entryPoints[path]
			}
			build(path)
		})
		.on('ready', () => console.log(new Date(), 'ready'))
} else {
	await build()
}
