import { vanillaExtractPlugin } from '@vanilla-extract/esbuild-plugin'
import chokidar from 'chokidar'
import esbuild from 'esbuild'
import * as path_ from 'node:path'
import readdirp from 'readdirp'

// Uncomment for cleanup
// TODO: automate this by checking for css.ts next to each
// const removals = []
// for await (const entry of readdirp('.', {
// 	fileFilter: '**.css.generated.js',
// 	directoryFilter: ['!.git', '!node_modules'],
// })) {
// 	const { path } = entry
// 	removals.push(fs.promises.rm(path))
// }

// await Promise.all(removals)

const watchedFiles = ['**.css.ts']

const build = async (path) => {
	console.log('building', path)
	await esbuild.build({
		entryPoints: [path_.join(process.cwd(), path)],
		entryNames: '[name].generated',
		bundle: true,
		// TODO: support user supplied sourcemaps
		// sourcemap: true,
		format: 'esm',
		platform: 'browser',
		outdir: path_.dirname(path_.join(process.cwd(), path)),
		minify: true,
		splitting: false,
		target: 'esnext',
		// Working directory apparently affects vanilla extract's hashes?
		// Using frontend to stay consistent with vite setup
		absWorkingDir: path_.join(process.cwd(), 'frontend'),
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
	console.log('built', path)
	return
}

const removeBuildOutput = (path) => {
	console.log('remove', path)
	// TODO:
}

await Promise.all(
	(
		await readdirp.promise('.', {
			fileFilter: watchedFiles,
			directoryFilter: ['!.git', '!node_modules'],
		})
	).map(({ path }) => build(path)),
)

chokidar
	.watch(watchedFiles, {
		// not sure why this doesn't seem to work?
		// cwd: workingDirectory,
		// Also not working? using a manual readdirp pass instead
		// ignoreInitial: false,
		ignoreInitial: true,
		ignored: ['**/.git/**', '**/node_modules/**'],
	})
	.on('add', build)
	.on('change', build)
	.on('unlink', removeBuildOutput)
	.on('ready', () => console.log('ready'))
