import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		svelte(),
		VitePWA({
			registerType: "autoUpdate",
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
			workbox: {
				runtimeCaching: [
					{
						handler: "StaleWhileRevalidate",
						urlPattern: (opt) => {
							return (
								opt.url.origin ==
								"https://api.betterschool.cheesyphoenix.tk"
							);
						},
						method: "GET",
					},
				],
			},
		}),
	],
});
