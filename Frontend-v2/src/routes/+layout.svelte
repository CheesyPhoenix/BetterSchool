<script lang="ts">
	import "../app.css";
	import favicon from "$lib/assets/betterschool-icon-32.png";
	import { isMobile } from "$lib/stores/isMobile";
	import { mobileThreshold } from "$lib/components/timetable/shared";
	import { onMount } from "svelte";
	import { goto } from "$app/navigation";
	import { page } from "$app/stores";

	let screenWidth: number | undefined = undefined;

	$: {
		if (screenWidth) {
			$isMobile = screenWidth < mobileThreshold;
		}
	}

	onMount(() => {
		const lastPageVisited = window.localStorage.getItem("lastPageVisited");
		if (lastPageVisited != null && $page.url.pathname == "/")
			goto(lastPageVisited);
	});
</script>

<svelte:window bind:innerWidth={screenWidth} />

<svelte:head>
	<link rel="shortcut icon" href={favicon} type="image/x-icon" />
</svelte:head>

<slot />
