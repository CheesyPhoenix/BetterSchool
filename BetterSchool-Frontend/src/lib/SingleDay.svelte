<script lang="ts">
	import Day from "./TimeTable/Day.svelte";
	import { swipe } from "svelte-gestures";
	import { createEventDispatcher } from "svelte";

	interface Week {
		weekNr: string;
		days: {
			name: string;
			date: string;
			classes: {
				date: string;
				time: string;
				room: string;
				name: string;
			}[];
		}[];
	}

	export let weekIndex: number;

	export let week: Week;
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

	//

	const dispatch = createEventDispatcher();

	function swipeHandler(
		event: CustomEvent<{
			direction: "top" | "right" | "bottom" | "left";
			target: EventTarget;
		}>
	) {
		if (event.detail.direction == "left") {
			dayIndex++;
		} else if (event.detail.direction == "right") {
			dayIndex--;
		}

		if (dayIndex >= week.days.length && weekIndex < 2) {
			dayIndex = 0;
			dispatch("changeWeek", 1);
		} else if (dayIndex < 0 && weekIndex > 0) {
			dayIndex = week.days.length - 1;
			dispatch("changeWeek", -1);
		} else if (weekIndex == 0 && dayIndex < 0) {
			dayIndex = 0;
		} else if (weekIndex == 2 && dayIndex >= week.days.length) {
			dayIndex = week.days.length - 1;
		}
	}
</script>

<div class="weekNrCont">
	<h2 class="weekNr">{"Uke " + week.weekNr}</h2>
</div>
<div class="centerVertical">
	<div
		class="table"
		use:swipe={{
			timeframe: 300,
			minSwipeDistance: 60,
			touchAction: "pan-y",
		}}
		on:swipe={swipeHandler}
	>
		<Day day={days[dayIndex]} widthPer={100} />
	</div>
</div>

<style>
	.weekNrCont {
		width: 95%;
		z-index: 1;
		position: absolute;
		left: 2em;
		top: 1em;
	}
	.weekNr {
		margin: 0;
	}

	.centerVertical {
		display: flex;
		justify-content: center;
		height: 100vh;
		position: absolute;
		width: 100vw;
		margin: 0;
		left: 0;
		top: 0;
	}

	.table {
		margin: auto;
		width: 95%;
		display: flex;
		overflow-x: auto;
		border-radius: 15px;
	}
</style>
