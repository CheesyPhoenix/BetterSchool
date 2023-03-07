<script lang="ts">
	import TimeTable from "$lib/components/timetable/TimeTable.svelte";
	import type { PageData } from "./$types";
	import arrow from "$lib/assets/arrow.svg";
	import { onMount } from "svelte";
	import { headerText } from "$lib/stores/header";
	import { afterNavigate, beforeNavigate } from "$app/navigation";
	import {
		getWeekNr,
		mobileThreshold,
	} from "$lib/components/timetable/shared";
	import { fade, fly, scale, slide } from "svelte/transition";
	import SingleDay from "$lib/components/timetable/SingleDay.svelte";
	import { isMobile } from "$lib/stores/isMobile";

	export let data: PageData;

	$headerText = [
		{ text: "Schools", url: "/schools" },
		{ text: data.schoolName, url: "./" },
		{ text: data.className },
	];

	const currWeek = data.weeks.find((x) => x.weekNr == getWeekNr().toString());
	let weekIndex = currWeek ? data.weeks.indexOf(currWeek) : 0;

	let swipeDir = 0;
	let swipeOffset = 0;

	let clientSide = false;
	onMount(() => {
		clientSide = true;
	});

	$: {
		if (clientSide) swipeOffset = window.innerWidth * swipeDir;
	}

	let windowWidth = 0;
</script>

<svelte:window bind:innerWidth={windowWidth} />

{#if !$isMobile}
	<div
		in:fly|local={{ x: -100 }}
		out:fly|local={{ x: 100 }}
		class="absolute w-screen h-screen"
	>
		<TimeTable
			className={data.className}
			{swipeOffset}
			week={data.weeks[weekIndex]}
		/>

		<div
			class="h-screen left-0 flex flex-col justify-center absolute top-0"
		>
			<button
				on:click={() => {
					if (weekIndex > 0) {
						swipeDir = 1;
						weekIndex--;
					}
				}}
				class="rotate-180 h-[86.5%] mt-[50%] pl-4 pr-3 hover:bg-opacity-25 duration-300 bg-opacity-0 bg-white rounded-tl-full rounded-bl-full"
				><img
					src={arrow}
					alt="previous week"
					class="h-[40px]"
				/></button
			>
		</div>

		<div
			class="h-screen right-0 flex flex-col justify-center absolute top-0"
		>
			<button
				on:click={() => {
					if (data.weeks.length - 1 > weekIndex) {
						swipeDir = -1;
						weekIndex++;
					}
				}}
				class="h-[86.5%] mt-[50%] pl-4 pr-3 hover:bg-opacity-25 duration-300 bg-opacity-0 bg-white rounded-tl-full rounded-bl-full"
				><img
					src={arrow}
					alt="previous week"
					class="h-[40px]"
				/></button
			>
		</div>
	</div>
{:else}
	<div
		in:fly|local={{ x: -100 }}
		out:fly|local={{ x: 100 }}
		class="absolute w-screen h-screen"
	>
		<SingleDay
			className={data.className}
			week={data.weeks[weekIndex]}
			{weekIndex}
		/>
	</div>
{/if}
