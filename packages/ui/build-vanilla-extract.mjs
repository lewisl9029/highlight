import { vanillaExtractPlugin } from '@vanilla-extract/esbuild-plugin'
import chokidar from 'chokidar'
import esbuild from 'esbuild'
import * as path_ from 'node:path'
import readdirp from 'readdirp'

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
			directoryFilter: ['!__generated'],
		})
	).map(({ path }) => [path, path_.join(workingDirectory, path)]),
)

const build = async () => {
	console.log('building', new Date())
	await esbuild.build({
		entryPoints: Object.values(entryPoints),
		bundle: true,
		// TODO: support user supplied sourcemaps
		// sourcemap: true,
		format: 'esm',
		platform: 'browser',
		outdir: outputDirectory,
		outbase: workingDirectory,
		minify: true,
		splitting: true,
		target: 'esnext',
		// Working directory apparently affects vanilla extract's hashes?
		// Using frontend to stay consistent with vite setup
		absWorkingDir: path_.join(process.cwd(), '../../frontend'),
		plugins: [
			vanillaExtractPlugin({
				// We don't output css here, only the js modules for each stylesheet entrypoint
				outputCss: false,
				identifiers: 'short',
			}),
		],
		external: [],
		logLevel: 'warning',
	})
	console.log('built', new Date())
	return
}

const isEntryPoint = (path) => path.endsWith('.css.ts')

// No await here since we don't want to delay watcher and miss updates
build()

chokidar
	.watch(inputGlobs, {
		cwd: workingDirectory,
		ignoreInitial: true,
		ignored: ['**/__generated/**'],
	})
	.on('add', (path) => {
		if (isEntryPoint(path)) {
			console.log('adding entry point', path)
			entryPoints[path] = path_.join(workingDirectory, path)
		}
		// We'll probably run into race conditions with concurrent edits here...
		// TODO: make it more robust with some debouncing + transaction tracking
		build()
	})
	.on('change', () => build())
	.on('unlink', (path) => {
		if (isEntryPoint(path)) {
			console.log('removing entry point', path)
			delete entryPoints[path]
		}
		build()
	})
	.on('ready', () => console.log('ready'))
