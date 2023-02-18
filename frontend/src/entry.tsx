// @ts-nocheck
import './bundles/index.css'
// This is the entry point to your app.

// It's a good place to execute one-time side effects, such as initializing the React root,
// because it will never get fast-refreshed in development mode.

// react and react-dom are installed by default, so we can just import them.
// import * as react from 'react'
// import * as reactDom from 'react-dom/client'

// We import with .js extension because typescript will complain if we used .ts,
// though Reflame itself supports all of .js, .ts and extensionless import specifiers
// through import maps.
//
// Also note we're using / to refer to the root directory (/app in this case).
// This is just how absolute paths on the web works natively.
// import './index.tsx'
export const init = () => {
	// We pre-filled your app ID in the widget URL: 'https://widget.intercom.io/widget/gm6369ty'
	;(function () {
		const w = window
		const ic = w.Intercom
		if (typeof ic === 'function') {
			ic('reattach_activator')
			ic('update', w.intercomSettings)
		} else {
			const d = document
			var i = function () {
				i.c(arguments)
			}
			i.q = []
			i.c = function (args) {
				i.q.push(args)
			}
			w.Intercom = i
			const l = function () {
				const s = d.createElement('script')
				s.type = 'text/javascript'
				s.async = true
				s.src = 'https://widget.intercom.io/widget/gm6369ty'
				const x = d.getElementsByTagName('script')[0]
				x.parentNode.insertBefore(s, x)
			}
			if (w.attachEvent) {
				w.attachEvent('onload', l)
			} else {
				w.addEventListener('load', l, false)
			}
		}
	})()
	import('./index.tsx')
}
