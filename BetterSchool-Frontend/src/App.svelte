<script lang="ts">
	import TimeTable from "./lib/TimeTable.svelte";
	import SingleDay from "./lib/SingleDay.svelte";
	import arrow from "./assets/arrow.svg";
	import { onMount } from "svelte";

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

	function getWeekNr() {
		var date = new Date();
		date.setHours(0, 0, 0, 0);
		// Thursday in current week decides the year.
		date.setDate(date.getDate() + 3 - ((date.getDay() + 6) % 7));
		// January 4 is always in week 1.
		var week1 = new Date(date.getFullYear(), 0, 4);
		// Adjust to Thursday in week 1 and count number of weeks from date to week1.
		return (
			1 +
			Math.round(
				((date.getTime() - week1.getTime()) / 86400000 -
					3 +
					((week1.getDay() + 6) % 7)) /
					7
			)
		);
	}

	let weekIndex = 0;

	let weeks: Week[];
	let currWeek: Week;

	onMount(async () => {
		const res = await fetch("https://api.betterschool.cheesyphoenix.tk");
		const _weeks: Week[] = await res.json();

		const weekNr = getWeekNr().toString();

		for (let i = 0; i < _weeks.length; i++) {
			const week = _weeks[i];
			if (week.weekNr == weekNr) weekIndex = i;
		}

		weeks = _weeks;
		currWeek = weeks[weekIndex];
	});

	let swipeOffset = 0;

	function changePage(by: number) {
		if (!weeks) return;

		swipeOffset = 0;

		if (weekIndex + by >= 0 && weekIndex + by < weeks.length) {
			weekIndex += by;

			swipeOffset = 50 * -by;
		}

		currWeek = weeks[weekIndex];
	}

	// check screen size

	let scrWidth: number;
	let phoneMode = scrWidth <= 900;
	$: phoneMode = scrWidth <= 900;
</script>

<svelte:window bind:innerWidth={scrWidth} />

{#if phoneMode}
	{#if currWeek}
		<SingleDay
			week={currWeek}
			{weekIndex}
			on:changeWeek={(event) => {
				changePage(event.detail);
			}}
		/>
	{/if}
{:else}
	{#if currWeek}
		<TimeTable week={currWeek} {swipeOffset} />
	{/if}

	<div
		class="button"
		style="left: 0;"
		on:click={() => {
			changePage(-1);
		}}
	>
		<!-- svelte-ignore a11y-invalid-attribute -->
		<img
			src={arrow}
			alt="Forrige uke"
			class="buttonImg"
			style="transform: rotate(180deg);"
		/>
	</div>
	<div
		class="button"
		style="right: 0;"
		on:click={() => {
			changePage(1);
		}}
	>
		<!-- svelte-ignore a11y-invalid-attribute -->
		<img src={arrow} alt="Neste uke" class="buttonImg" />
	</div>
{/if}

<style>
	:root {
		font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
			Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
		background-color: #333;
		color: #f5f5f5;
	}

	.buttonImg {
		height: 40px;
	}

	.button {
		height: 100%;
		position: fixed;
		top: 0;
		display: flex;
		flex-direction: column;
		justify-content: center;
		padding: 0 1em;
		z-index: 1;
		user-select: none;
		transition-duration: 0.3s;
	}

	.button:hover {
		cursor: pointer;
		background-color: #f5f5f530;
	}
</style>
