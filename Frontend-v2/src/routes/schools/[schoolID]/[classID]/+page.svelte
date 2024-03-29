<script lang="ts">
	import TimeTable from "$lib/components/timetable/TimeTable.svelte";
	import type { PageData } from "./$types";
	import arrow from "$lib/assets/arrow.svg";
	import { onMount } from "svelte";
	import { headerText } from "$lib/stores/header";
	import { beforeNavigate } from "$app/navigation";
	import { getWeekNr } from "$lib/components/timetable/shared";
	import { fade } from "svelte/transition";
	import SingleDay from "$lib/components/timetable/SingleDay.svelte";
	import { isMobile } from "$lib/stores/isMobile";
	import { page } from "$app/stores";

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

		// save last visited class and redirect on initial page load
		window.localStorage.setItem("lastPageVisited", $page.url.pathname);
	});

	$: {
		if (clientSide) swipeOffset = window.innerWidth * swipeDir;
	}

	let windowWidth = 0;

	beforeNavigate(() => {
		swipeDir = 0;
	});
</script>

<svelte:window bind:innerWidth={windowWidth} />

{#if $isMobile == false}
	<div in:fade|local out:fade|local class="absolute w-screen screenHeight">
		<TimeTable
			className={data.className}
			{swipeOffset}
			week={data.weeks[weekIndex]}
		/>

		<div
			class="screenHeight left-0 flex flex-col justify-center absolute top-0"
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
			class="screenHeight right-0 flex flex-col justify-center absolute top-0"
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
{:else if $isMobile == true}
	<div in:fade|local out:fade|local class="absolute w-screen screenHeight">
		<SingleDay
			className={data.className}
			weeks={data.weeks}
			initWeekIndex={weekIndex}
		/>
	</div>
{/if}
