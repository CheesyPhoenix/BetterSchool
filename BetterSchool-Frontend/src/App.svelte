<script lang="ts">
	import TimeTable from "./lib/TimeTable.svelte";
	import SingleDay from "./lib/SingleDay.svelte";
	import arrowAsset from "./assets/arrow.svg";
	import settingsAsset from "./assets/settings.svg";
	import { onMount } from "svelte";
	import Menu from "./lib/Menu.svelte";
	import { swipe } from "svelte-gestures";

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

	function getPrevClass() {
		return window.localStorage.getItem("class");
	}

	let klasser: string[];

	let selectedIndex: number;

	$: {
		if (selectedIndex || selectedIndex == 0) {
			window.localStorage.setItem("class", klasser[selectedIndex]);
		}
	}

	$: {
		if (klasser && (selectedIndex || selectedIndex == 0)) {
			getClass(klasser[selectedIndex]);
		}
	}

	async function getClass(klasse: string) {
		const res = await fetch(
			"https://api.betterschool.cheesyphoenix.tk/" + klasse
		);

		const _weeks: Week[] = await res.json();
		weeks = _weeks;
		currWeek = weeks[weekIndex];
	}

	onMount(async () => {
		let res = await fetch(
			"https://api.betterschool.cheesyphoenix.tk/classes"
		);
		klasser = await res.json();

		klasser.sort();

		if (getPrevClass() != "" && klasser.includes(getPrevClass())) {
			res = await fetch(
				"https://api.betterschool.cheesyphoenix.tk/" + getPrevClass()
			);

			selectedIndex = klasser.indexOf(getPrevClass());
		} else {
			res = await fetch(
				"https://api.betterschool.cheesyphoenix.tk/" + klasser[0]
			);

			selectedIndex = 0;
		}

		const _weeks: Week[] = await res.json();

		let weekNr = getWeekNr().toString();

		//go to next week if day is Saturday or Sunday
		if (new Date().getDay() > 5) {
			weekNr = (parseInt(weekNr) + 1).toString();
		}

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

	//

	let menuActive = false;

	function swipeHandler(
		event: CustomEvent<{
			direction: "top" | "right" | "bottom" | "left";
			target: EventTarget;
		}>
	) {
		if (event.detail.direction == "bottom") {
			menuActive = true;
		}
	}

	$: {
		if (phoneMode) {
			document.getElementById("app").style.overflowY = "auto";
		} else {
			document.getElementById("app").style.overflowY = "hidden";
		}
	}
</script>

<svelte:window bind:innerWidth={scrWidth} />

{#if menuActive}
	<Menu {klasser} bind:selectedIndex bind:menuActive />
{/if}

<div
	use:swipe={{
		timeframe: 300,
		minSwipeDistance: 60,
		touchAction: "pan-x",
	}}
	on:swipe={swipeHandler}
	id="main"
>
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
				src={arrowAsset}
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
			<img src={arrowAsset} alt="Neste uke" class="buttonImg" />
		</div>

		<!--settings btn-->
		<div
			class="settingsBtn"
			on:click={() => {
				menuActive = true;
			}}
		>
			<!-- svelte-ignore a11y-invalid-attribute -->
			<img
				src={settingsAsset}
				alt="Forrige uke"
				class="buttonImg settingsImg"
			/>
		</div>
	{/if}
</div>

<style>
	:root {
		font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
			Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
		background-color: #333;
		color: #f5f5f5;
	}

	#main {
		width: 100%;
		height: 100%;
		margin: 0;
	}

	.settingsBtn {
		right: 0.75em;
		top: 0.75em;
		position: absolute;
		z-index: 2;
		user-select: none;
		transition-duration: 0.3s;
	}
	.settingsBtn:hover {
		cursor: pointer;
	}

	.settingsImg {
		filter: none;
		transition-duration: 0.15s;
	}
	.settingsImg:hover {
		filter: drop-shadow(2px 4px 6px black) brightness(1.5);
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
