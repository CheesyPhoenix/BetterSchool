<script lang="ts">
	import "../app.css";
	import favicon from "$lib/assets/betterschool-icon-32.png";
	import { isMobile } from "$lib/stores/isMobile";
	import { mobileThreshold } from "$lib/components/timetable/shared";

	let screenWidth = 0;

	$: {
		$isMobile = screenWidth < mobileThreshold;
	}
</script>

<svelte:window bind:innerWidth={screenWidth} />

<svelte:head>
	<link rel="shortcut icon" href={favicon} type="image/x-icon" />
</svelte:head>

<slot />
