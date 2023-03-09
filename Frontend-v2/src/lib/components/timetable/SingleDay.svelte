<script lang="ts">
	import Day from "./Day.svelte";
	import { createEventDispatcher, onMount } from "svelte";
	import { fly, fade } from "svelte/transition";
	import { getWeekNr } from "./shared";
	import { Swipe, SwipeItem } from "svelte-swipe";

	export let initWeekIndex: number;
	export let weeks: App.Week[];

	let dayIndex: number | undefined = undefined;

	$: weekIndex =
		dayIndex !== undefined
			? (dayIndex - (dayIndex % 5)) / 5
			: initWeekIndex;
	$: week = weeks[weekIndex];

	onMount(() => {
		for (let i = 0; i < week.days.length; i++) {
			const day = week.days[i];

			if (
				new Date(day.date).getDate() == new Date().getDate() &&
				new Date(day.date).getMonth() == new Date().getMonth() &&
				new Date(day.date).getFullYear() == new Date().getFullYear()
			) {
				dayIndex = i;
				break;
			}
		}
	});

	const now = new Date();

	const nowFormatted = `${now.getDate()}.${
		now.getMonth() + 1
	}.${now.getFullYear()}, uke ${getWeekNr()}`;

	//

	let swipeOffset = 0;

	export let className: string = "";

	let swipeGoTo: (step: any) => void;
	let weekGoTo: (step: any) => void;

	$: {
		if (dayIndex != undefined && swipeGoTo) {
			swipeGoTo(dayIndex);
		}
	}

	$: {
		if (weekIndex != undefined && weekGoTo) {
			weekGoTo(weekIndex);
		}
	}
</script>

<div class="relative w-screen screenHeight select-none">
	<div class="absolute left-6 top-0">
		<h2 class="weekNr">{"Uke " + week.weekNr} - {className}</h2>
		<h5 class="nowDate">Dato: {nowFormatted}</h5>
	</div>

	{#if dayIndex != undefined}
		<Swipe
			bind:active_item={dayIndex}
			defaultIndex={dayIndex}
			bind:goTo={swipeGoTo}
		>
			{#each weeks as week}
				{#each week.days as day}
					<SwipeItem>
						<div
							class="centerVertical"
							out:fly={{ x: swipeOffset }}
							in:fade
						>
							<div class="table">
								<Day {day} widthPer={100} singleDay={true} />
							</div>
						</div>
					</SwipeItem>
				{/each}
			{/each}
		</Swipe>
	{/if}

	<div class="fixed bottom-4 left-0 z-[2] w-screen h-16">
		<Swipe
			defaultIndex={weekIndex}
			bind:goTo={weekGoTo}
			on:change={(e) => {
				dayIndex = e.detail.active_item * 5 + ((dayIndex ?? 0) % 5);
			}}
		>
			{#each weeks as week}
				<SwipeItem>
					<div
						class="w-max flex justify-center gap-6 m-auto bg-black bg-opacity-20 backdrop-blur-sm rounded-lg p-2"
					>
						{#each week.days as day, i}
							{#if dayIndex !== undefined && dayIndex % 5 === i}
								<button
									on:click={() =>
										(dayIndex = weekIndex * 5 + i)}
									class="bg-[#333] rounded-full h-12 w-12 drop-shadow-lg duration-200"
									>{day.name.slice(0, 1)}</button
								>
							{:else}
								<button
									on:click={() =>
										(dayIndex = weekIndex * 5 + i)}
									class="bg-[#222] rounded-full h-12 w-12 drop-shadow-lg hover:bg-[#444] duration-200 pointer-events-auto"
									>{day.name.slice(0, 1)}</button
								>
							{/if}
						{/each}
					</div>
				</SwipeItem>
			{/each}
		</Swipe>
	</div>
</div>

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
