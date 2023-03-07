<script lang="ts">
	import Day from "./Day.svelte";
	//import { swipe } from "svelte-gestures";
	import { createEventDispatcher } from "svelte";
	import { fly, fade } from "svelte/transition";
	import { getWeekNr } from "./shared";

	export let weekIndex: number;

	export let week: App.Week;
	let days = week.days;
	$: days = week.days;

	let dayIndex: number = 0;

	for (let i = 0; i < days.length; i++) {
		const day = days[i];

		if (new Date(day.date).getDay() == new Date().getDay()) {
			dayIndex = i;
			break;
		}
	}

	const now = new Date();

	const nowFormatted = `${now.getDate()}.${
		now.getMonth() + 1
	}.${now.getFullYear()}, uke ${getWeekNr()}`;

	//

	const dispatch = createEventDispatcher();

	let swipeOffset = 0;

	function swipeHandler(
		event: CustomEvent<{
			direction: "top" | "right" | "bottom" | "left";
			target: EventTarget;
		}>
	) {
		if (event.detail.direction == "left") {
			dayIndex++;
			swipeOffset = -50;
		} else if (event.detail.direction == "right") {
			dayIndex--;
			swipeOffset = 50;
		}

		if (dayIndex >= week.days.length && weekIndex < 2) {
			dayIndex = 0;
			dispatch("changeWeek", 1);
		} else if (dayIndex < 0 && weekIndex > 0) {
			dayIndex = week.days.length - 1;
			dispatch("changeWeek", -1);
		} else if (weekIndex == 0 && dayIndex < 0) {
			dayIndex = 0;
			swipeOffset = 0;
		} else if (weekIndex == 2 && dayIndex >= week.days.length) {
			dayIndex = week.days.length - 1;
			swipeOffset = 0;
		}
	}

	export let className: string = "";
</script>

<div class="absolute left-6 top-0">
	<h2 class="weekNr">{"Uke " + week.weekNr} - {className}</h2>
	<h5 class="nowDate">Dato: {nowFormatted}</h5>
</div>
{#key dayIndex}
	<div class="centerVertical" out:fly={{ x: swipeOffset }} in:fade>
		<div class="table">
			<Day day={days[dayIndex]} widthPer={100} singleDay={true} />
		</div>
	</div>
{/key}

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
		height: max-content;
		position: absolute;
		width: 100vw;
		margin: 0;
		left: 0;
		top: 0;
		margin-top: 4em;
		min-height: calc(100% - 4em);
	}

	.table {
		margin: auto;
		width: 95%;
		display: flex;
		overflow-x: auto;
		border-radius: 15px;
		margin-bottom: 2em;

		min-height: 700px;
		margin-top: 0;
	}
</style>
