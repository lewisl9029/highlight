import * as fs from 'node:fs'
import esbuild from 'esbuild'

const packageJson = JSON.parse(
	fs.readFileSync('node_modules/@highlight-run/rrweb/package.json'),
)

const context = await esbuild.context({
	entryPoints: [
		{
			in: 'node_modules/@highlight-run/rrweb/' + packageJson.module,
			out: 'rr',
		},
		{
			in: 'node_modules/@highlight-run/rrweb/dist/rrweb.min.css',
			out: 'rr.min',
		},
	],
	bundle: true,
	sourcemap: false,
	format: 'esm',
	platform: 'browser',
	outdir: 'frontend/src/__generated/rr',
	minify: true,
	target: 'esnext',
	// external: Object.keys(packageJson.dependencies).concat(
	//   Object.keys(packageJson.peerDependencies),
	// ),
	logLevel: 'info',
})

await context.watch()
