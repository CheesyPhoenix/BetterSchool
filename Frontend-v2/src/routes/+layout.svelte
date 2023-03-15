<script lang="ts">
	import "../app.css";
	import favicon from "$lib/assets/betterschool-icon-32.png";
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
	<link rel="shortcut icon" href={favicon} type="image/x-icon" />
	{@html webManifest}
</svelte:head>

<slot />
