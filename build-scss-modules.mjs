import * as fs from 'node:fs'
import * as path_ from 'node:path'
import chokidar from 'chokidar'
import esbuild from 'esbuild'
import readdirp from 'readdirp'
import stylePlugin from 'esbuild-style-plugin'

const watchedFiles = ['**.scss']

const build = async (path) => {
	console.log('building', path)
	const result = await esbuild.build({
		entryPoints: [path],
		// entryNames: '[dir]/[name][ext]',
		outExtension: { '.js': '.scss.js' },
		bundle: true,
		// TODO: support user supplied sourcemaps
		// sourcemap: true,
		format: 'esm',
		allowOverwrite: true,
		platform: 'browser',
		outdir: path_.dirname(path),
		minify: true,
		splitting: false,
		target: 'esnext',
		plugins: [
			stylePlugin({
				cssModulesOptions: {
					localsConvention: 'camelCaseOnly',
				},
			}),
		],
		external: [],
		write: false,
		logLevel: 'warning',
	})
	const jsOutput = result.outputFiles.find(({ path }) => path.endsWith('.js'))
	await fs.promises.writeFile(jsOutput.path, jsOutput.contents)
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
