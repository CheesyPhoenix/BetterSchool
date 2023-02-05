<script lang="ts">
	import TimeTable from "$lib/components/timetable/TimeTable.svelte";
	import type { PageData } from "./$types";
	import arrow from "$lib/assets/arrow.svg";

	export let data: PageData;

	let weekIndex = 0;

	let swipeDir = 0;
</script>

<TimeTable
	className="Temp"
	swipeOffset={window.innerWidth * swipeDir}
	week={data.weeks[weekIndex]}
/>

<div class="h-screen left-0 flex flex-col justify-center absolute">
	<button
		on:click={() => {
			if (weekIndex > 0) {
				swipeDir = 1;
				weekIndex--;
			}
		}}
		class="rotate-180 h-[86.5%] mt-[50%] pl-4 pr-3 hover:bg-opacity-25 duration-300 bg-opacity-0 bg-white rounded-tl-full rounded-bl-full"
		><img src={arrow} alt="previous week" class="h-[40px]" /></button
	>
</div>

<div class="h-screen right-0 flex flex-col justify-center absolute">
	<button
		on:click={() => {
			if (data.weeks.length - 1 > weekIndex) {
				swipeDir = -1;
				weekIndex++;
			}
		}}
		class="h-[86.5%] mt-[50%] pl-4 pr-3 hover:bg-opacity-25 duration-300 bg-opacity-0 bg-white rounded-tl-full rounded-bl-full"
		><img src={arrow} alt="previous week" class="h-[40px]" /></button
	>
</div>
