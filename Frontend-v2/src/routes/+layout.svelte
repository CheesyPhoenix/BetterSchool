<script lang="ts">
	import "../app.css";
	import { isMobile } from "$lib/stores/isMobile";
	import { mobileThreshold } from "$lib/components/timetable/shared";
	import { onMount } from "svelte";
	import { goto } from "$app/navigation";
	import { page } from "$app/stores";
	//@ts-ignore
	import { pwaInfo } from "virtual:pwa-info";

	let screenWidth: number | undefined = undefined;

	$: {
		if (screenWidth) {
			$isMobile = screenWidth < mobileThreshold;
		}
	}

	onMount(async () => {
		// PWA
		console.log(pwaInfo);

		if (pwaInfo) {
			const { registerSW } = await import("virtual:pwa-register");
			registerSW({
				immediate: true,
				onRegistered(r) {
					setInterval(() => {
						r && r.update();
					}, 60 * 60 * 1000);

					console.log(`SW Registered: ${r}`);
				},
				onRegisterError(error) {
					console.log("SW registration error", error);
				},
			});
		}

		const lastPageVisited = window.localStorage.getItem("lastPageVisited");
		if (lastPageVisited != null && $page.url.pathname == "/")
			goto(lastPageVisited);
	});

	$: webManifest = pwaInfo ? pwaInfo.webManifest.linkTag : "";
</script>

<svelte:window bind:innerWidth={screenWidth} />

<svelte:head>
	<link
		rel="shortcut icon"
		href="/betterschool-icon-32.png"
		type="image/x-icon"
	/>
	<meta name="theme-color" content="#333" />
	<link rel="apple-touch-icon" href="/betterschool-icon-192.png" />
	<meta
		name="description"
		content="BetterSchool is a better way of viewing your Visma InSchool schedule. Don't waste time logging in to the app every time you just want to check when your next class starts, use BetterSchool instead!"
	/>
	{@html webManifest}
</svelte:head>

<slot />
