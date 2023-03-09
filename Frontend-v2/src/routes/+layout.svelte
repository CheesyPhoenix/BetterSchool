<script lang="ts">
	import "../app.css";
	import favicon from "$lib/assets/betterschool-icon-32.png";
	import { isMobile } from "$lib/stores/isMobile";
	import { mobileThreshold } from "$lib/components/timetable/shared";

	let screenWidth: number | undefined = undefined;
	let screenHeight: number | undefined = undefined;

	$: {
		if (screenWidth) {
			$isMobile = screenWidth < mobileThreshold;
		}
	}

	$: {
		// Have to manually get the height of the viewport because mobile browsers suck. Source: https://css-tricks.com/the-trick-to-viewport-units-on-mobile/
		if (screenHeight) {
			for (const el of [
				...(document.getElementsByClassName(
					"screenHeight"
				) as HTMLCollectionOf<HTMLElement>),
				...(document.getElementsByClassName(
					"screenHeight80"
				) as HTMLCollectionOf<HTMLElement>),
			]) {
				el.style.setProperty(
					"--vh",
					(screenHeight / 100).toString() + "px"
				);
			}
		}
	}
</script>

<svelte:window bind:innerWidth={screenWidth} bind:innerHeight={screenHeight} />

<svelte:head>
	<link rel="shortcut icon" href={favicon} type="image/x-icon" />
</svelte:head>

<slot />
