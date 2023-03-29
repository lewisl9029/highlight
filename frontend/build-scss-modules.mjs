import chokidar from 'chokidar'
import esbuild from 'esbuild'
import stylePlugin from 'esbuild-style-plugin'
import * as fs from 'node:fs'
import * as path_ from 'node:path'

const workingDirectory = path_.join(process.cwd(), './src')
const outputDirectory = path_.join(workingDirectory, '__generated/scss')

const watchedFiles = ['**/**.scss']

// uncomment for cleanup
await fs.promises.rm(outputDirectory, { recursive: true, force: true })

// TODO: also need a special case for /static/shared.scss where we need to update
// every .scss file that potentially imports from it
// Luckily that seems to be the only usage of scss imports
const build = async (path) => {
	console.log('building', path)
	const result = await esbuild.build({
		entryPoints: [path],
		outExtension: { '.js': '.scss.js' },
		absWorkingDir: workingDirectory,
		bundle: true,
		// TODO: support user supplied sourcemaps
		// sourcemap: true,
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
			}),
		],
		external: [],
		write: false,
		logLevel: 'warning',
	})
	const jsOutput = result.outputFiles.find(({ path }) => path.endsWith('.js'))
	const outputPath = jsOutput.path
	await fs.promises.mkdir(path_.dirname(outputPath), { recursive: true })
	await fs.promises.writeFile(outputPath, jsOutput.contents)
	console.log('built', path)
	return
}

const removeBuildOutput = async (path) => {
	console.log('removing', path)
	await fs.promises.rm(path_.join(outputDirectory, path + '.js'), {
		force: true,
	})
}

chokidar
	.watch(watchedFiles, {
		cwd: workingDirectory,
		ignored: ['**/__generated/**'],
	})
	.on('add', build)
	.on('change', build)
	.on('unlink', removeBuildOutput)
	.on('ready', () => console.log('ready'))
