import { sveltekit } from "@sveltejs/kit/vite";
import type { UserConfig } from "vite";
import { SvelteKitPWA } from "@vite-pwa/sveltekit";

const config: UserConfig = {
	plugins: [
		sveltekit(),
		SvelteKitPWA({
			registerType: "autoUpdate",
			srcDir: "./src",
			devOptions: { enabled: true },
			manifest: {
				background_color: "#333",
				theme_color: "#333",
				name: "BetterSchool",
				short_name: "BetterSchool",
				start_url: "/",
				display: "standalone",
				icons: [
					{
						src: "/betterschool-icon-512.png",
						sizes: "512x512",
						type: "image/png",
					},
					{
						src: "/betterschool-icon-192.png",
						sizes: "192x192",
						type: "image/png",
					},
					{
						src: "/betterschool-icon-192.png",
						sizes: "192x192",
						type: "image/png",
						purpose: "any maskable",
					},
				],
			},
			injectManifest: {
				globPatterns: [
					"client/**/*.{js,css,ico,png,svg,webp,woff,woff2}",
				],
			},
			workbox: {
				cleanupOutdatedCaches: true,
				runtimeCaching: [
					{
						handler: "StaleWhileRevalidate",
						urlPattern: (opt) => {
							return (
								!opt.sameOrigin &&
								opt.url.pathname.includes("school")
							);
						},
						method: "GET",
						options: {
							cacheName: "Api responses",
							expiration: {
								maxEntries: 500,
								maxAgeSeconds: 60 * 60 * 24 * 365 * 2, // 2 years
							},
							cacheableResponse: {
								statuses: [200],
							},
						},
					},
				],
			},
		}),
	],
};

export default config;
