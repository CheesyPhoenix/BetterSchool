<script lang="ts">
	import { onMount } from "svelte";

	import Class from "./Class.svelte";

	export let day: {
		name: string;
		date: string;
		classes: {
			date: string;
			time: string;
			room: string;
			name: string;
			teacher: string;
		}[];
	};

	$: dayName = day.name;

	$: dayDateOb = new Date(day.date);

	$: dayDate = dayDateOb.toLocaleDateString("no");

	$: classes = day.classes;

	// let dateOb =
	// 	classes.length == 0 ? undefined : new Date(day.classes[0].date);
	// $: {
	// 	dateOb =
	// 		classes.length == 0 ? undefined : new Date(day.classes[0].date);
	// }

	const todayDate = new Date();

	let bgColor = "#595959";
	let today = false;

	$: {
		if (
			dayDateOb &&
			dayDateOb.getDate() == todayDate.getDate() &&
			dayDateOb.getMonth() == todayDate.getMonth() &&
			dayDateOb.getFullYear() == todayDate.getFullYear()
		) {
			bgColor = "#696969";
			today = true;
		} else {
			bgColor = "#595959";
			today = false;
		}
	}

	onMount(() => {
		let blurred = false;
		window.addEventListener("blur", () => {
			blurred = true;
		});

		let refocusTimeout = false;

		window.addEventListener("focus", () => {
			if (refocusTimeout) return;

			refocusTimeout = true;
			setTimeout(() => {
				refocusTimeout = false;
			}, 60 * 1000);

			const todayDate = new Date();

			if (blurred) {
				if (
					dayDateOb &&
					dayDateOb.getDate() == todayDate.getDate() &&
					dayDateOb.getMonth() == todayDate.getMonth() &&
					dayDateOb.getFullYear() == todayDate.getFullYear()
				) {
					bgColor = "#696969";
					today = true;
				} else {
					today = false;
					bgColor = "#595959";
				}
			}
		});
	});

	export let widthPer: number;

	let dayHeight: number;

	let currTime = new Date();
	//update current time once a minute
	setInterval(() => {
		currTime = new Date();
	}, 60 * 1000);

	$: scale = 100 / 8.25;

	let nowLineActive = false;

	$: nowLinePos =
		(currTime.getHours() + currTime.getMinutes() / 60 - 8) * scale;

	$: {
		if (today && currTime.getHours() >= 8 && currTime.getHours() < 16) {
			nowLineActive = true;
		}
	}
</script>

<div class="day" style="background-color: {bgColor}; width: {widthPer}%">
	<div class="header">{dayName} {dayDate}</div>
	<div class="classes">
		{#each classes as classOb}
			<Class {classOb} {today} />
		{/each}

		{#if nowLineActive}
			<div class="nowLine" style="top: {nowLinePos}%;">
				<hr class="nowLineHr" />
				<span class="nowLineCircle" />
			</div>
		{/if}
	</div>
</div>

<style>
	.header {
		width: 100%;
		height: 2em;
		text-align: center;
	}
	.day {
		padding: 1em;
		min-width: 190px;
	}

	.classes {
		position: relative;
		height: 95%;
	}

	.nowLine {
		position: absolute;
		margin: 0;
		width: 100%;
		left: 0;
	}
	.nowLineHr {
		margin: 0;
		width: 102.5%;
		left: -1.25%;
		border-top: none;
		border-left: none;
		border-right: none;
		border-bottom: solid 1px red;
		position: absolute;
	}

	.nowLineCircle {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background-color: red;
		display: inline-block;
		top: -3px;
		left: 1px;
		position: absolute;
	}
</style>
