import * as fs from 'node:fs'
import esbuild from 'esbuild'
import * as path from 'node:path'

const args = process.argv.slice(2)
const watch = args.includes('--watch') || args.includes('-w')

const packageDirectory = '../node_modules/@highlight-run/rrweb'
const packageJson = JSON.parse(
	fs.readFileSync(path.join(packageDirectory, 'package.json')),
)

const context = await esbuild.context({
	entryPoints: [
		{
			in: path.join(packageDirectory, packageJson.module),
			out: 'rr',
		},
		{
			in: path.join(packageDirectory, 'dist/rrweb.min.css'),
			out: 'rr.min',
		},
	],
	bundle: true,
	sourcemap: false,
	format: 'esm',
	platform: 'browser',
	outdir: 'src/__generated/rr',
	minify: true,
	target: 'esnext',
	// external: Object.keys(packageJson.dependencies).concat(
	//   Object.keys(packageJson.peerDependencies),
	// ),
	logLevel: 'info',
})

if (watch) {
	console.log('watching')
	await context.watch()
	console.log('watched')
} else {
	await context.rebuild()
}