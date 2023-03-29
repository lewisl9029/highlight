import * as svgr from '@svgr/core'
import chokidar from 'chokidar'
import * as fs from 'node:fs'
import * as path_ from 'node:path'

const watchedFiles = ['**/**.svg']

const workingDirectory = path_.join(process.cwd(), './src')
const outputDirectory = path_.join(workingDirectory, '__generated/svgr')

// uncomment for cleanup
// await fs.promises.rm(outputDirectory, { recursive: true, force: true })

const build = async (path) => {
	console.log('building', path)
	const code = await fs.promises.readFile(
		path_.join(workingDirectory, path),
		'utf-8',
	)
	const output = await svgr.transform(
		code,
		{
			plugins: ['@svgr/plugin-jsx'],
			jsxRuntime: 'automatic',
			exportType: 'named',
		},
		{ componentName: 'ReactComponent' },
	)
	const pathOutput = path_.join(outputDirectory, path + '.js')
	await fs.promises.mkdir(path_.dirname(pathOutput), { recursive: true })
	await fs.promises.writeFile(pathOutput, output)
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
