<script lang="ts">
	import Day from "./Day.svelte";
	import { onMount } from "svelte";
	import { getWeekNr } from "./shared";
	import Swiper from "$lib/components/Swiper.svelte";

	export let initWeekIndex: number;
	export let weeks: App.Week[];
	export let className: string = "";

	let swipeIndex: number | undefined = undefined;

	$: dayIndex = swipeIndex == undefined ? undefined : swipeIndex % 5;
	let currDayIndex: number | undefined = undefined;

	$: weekIndex =
		swipeIndex == undefined || dayIndex == undefined
			? undefined
			: (swipeIndex - dayIndex) / 5;
	$: week = weekIndex == undefined ? undefined : weeks[weekIndex];

	onMount(() => {
		for (let i = 0; i < weeks[initWeekIndex].days.length; i++) {
			const day = weeks[initWeekIndex].days[i];

			if (
				new Date(day.date).getDate() == new Date().getDate() &&
				new Date(day.date).getMonth() == new Date().getMonth() &&
				new Date(day.date).getFullYear() == new Date().getFullYear()
			) {
				currDayIndex = i;
				swipeIndex = i + initWeekIndex * 5;

				break;
			}
		}

		if (swipeIndex == undefined) {
			swipeIndex = 5 + initWeekIndex * 5;
		}
	});

	const now = new Date("14 march 2023 10:36");

	const nowFormatted = `${now.getDate()}.${
		now.getMonth() + 1
	}.${now.getFullYear()}, uke ${getWeekNr()}`;

	let prevDay: App.Day | undefined;
	$: {
		if (swipeIndex == undefined) {
			prevDay = undefined;
		} else {
			if (swipeIndex == 0) prevDay = undefined;
			else prevDay = weeks.flatMap((x) => x.days)[swipeIndex - 1];
		}
	}

	let nextDay: App.Day | undefined;
	$: {
		if (swipeIndex == undefined) {
			nextDay = undefined;
		} else {
			if (swipeIndex == weeks.flatMap((x) => x.days).length - 1)
				nextDay = undefined;
			else nextDay = weeks.flatMap((x) => x.days)[swipeIndex + 1];
		}
	}
</script>

{#if week != undefined}
	<div class="relative w-screen screenHeight select-none">
		<div class="absolute left-6 top-0">
			<h2 class="weekNr">{"Uke " + week.weekNr} - {className}</h2>
			<h5 class="nowDate">Dato: {nowFormatted}</h5>
		</div>

		{#if dayIndex != undefined && swipeIndex != undefined && weekIndex != undefined}
			<div class="pt-16 pb-24 h-full">
				<Swiper
					length={weeks.flatMap((x) => x.days).length}
					bind:index={swipeIndex}
					defaultIndex={swipeIndex}
				>
					<svelte:fragment slot="prev">
						{#if prevDay}
							<div class="table h-full">
								<Day
									day={prevDay}
									widthPer={100}
									singleDay={true}
								/>
							</div>
						{/if}
					</svelte:fragment>

					<div class="table h-full" slot="main">
						<Day
							day={week.days[dayIndex]}
							widthPer={100}
							singleDay={true}
						/>
					</div>

					<svelte:fragment slot="next">
						{#if nextDay}
							<div class="table h-full">
								<Day
									day={nextDay}
									widthPer={100}
									singleDay={true}
								/>
							</div>
						{/if}
					</svelte:fragment>
				</Swiper>
			</div>

			<div class="fixed bottom-4 left-0 z-[2] w-screen h-16">
				<Swiper
					length={weeks.length}
					on:change={(e) => {
						if (swipeIndex != undefined)
							swipeIndex +=
								(e.detail.newIndex - e.detail.oldIndex) * 5;
					}}
					bind:index={weekIndex}
					defaultIndex={weekIndex}
				>
					<svelte:fragment slot="prev" let:index>
						{#if index >= 0}
							<div
								class="w-max flex justify-center gap-6 m-auto bg-black bg-opacity-20 backdrop-blur-sm rounded-lg p-2"
							>
								{#each week.days as day, i}
									<button
										on:click={() =>
											(swipeIndex = i + index * 5)}
										class="{swipeIndex == i + index * 5
											? 'bg-[#333] pointer-events-none'
											: 'bg-[#222] hover:bg-[#444]'} rounded-full h-12 w-12 drop-shadow-lg duration-200 border-[#777] {index ==
											initWeekIndex && currDayIndex == i
											? 'border'
											: 'border-none'}"
										>{day.name.slice(0, 1)}</button
									>
								{/each}
							</div>
						{/if}
					</svelte:fragment>

					<div
						class="w-max flex justify-center gap-6 m-auto bg-black bg-opacity-20 backdrop-blur-sm rounded-lg p-2"
						slot="main"
						let:index
					>
						{#each week.days as day, i}
							<button
								on:click|stopPropagation={() =>
									(swipeIndex = i + index * 5)}
								class="{swipeIndex == i + index * 5
									? 'bg-[#333] pointer-events-none'
									: 'bg-[#222] hover:bg-[#444]'} rounded-full h-12 w-12 drop-shadow-lg duration-200 border-[#777] {index ==
									initWeekIndex && currDayIndex == i
									? 'border'
									: 'border-none'}"
								>{day.name.slice(0, 1)}</button
							>
						{/each}
					</div>

					<svelte:fragment slot="next" let:index>
						{#if index >= 0}
							<div
								class="w-max flex justify-center gap-6 m-auto bg-black bg-opacity-20 backdrop-blur-sm rounded-lg p-2"
							>
								{#each week.days as day, i}
									<button
										on:click={() =>
											(swipeIndex = i + index * 5)}
										class="{swipeIndex == i + index * 5
											? 'bg-[#333] pointer-events-none'
											: 'bg-[#222] hover:bg-[#444]'} rounded-full h-12 w-12 drop-shadow-lg duration-200 border-[#777] {index ==
											initWeekIndex && currDayIndex == i
											? 'border'
											: 'border-none'}"
										>{day.name.slice(0, 1)}</button
									>
								{/each}
							</div>
						{/if}
					</svelte:fragment>
				</Swiper>
			</div>
		{/if}
	</div>
{/if}

<style>
	.weekNr {
		margin-bottom: 0;
		font-size: 1.5em;
		font-weight: bold;
	}
	.nowDate {
		font-size: 0.83em;
		font-weight: bold;
	}

	.centerVertical {
		display: flex;
		justify-content: center;
		position: absolute;
		width: 100vw;
		margin: 0;
		left: 0;
		top: 0;
		margin-top: 4em;
		min-height: calc(100% - 8em);
	}

	.table {
		margin: auto;
		width: 95%;
		display: flex;
		overflow: auto;
		border-radius: 15px;
		margin-bottom: 2em;
		margin-top: 0;
	}
</style>
