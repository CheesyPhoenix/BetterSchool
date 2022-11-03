<script lang="ts">
	import TimeTable from "./lib/TimeTable.svelte";
	import SingleDay from "./lib/SingleDay.svelte";
	import arrowAsset from "./assets/arrow.svg";
	import settingsAsset from "./assets/settings.svg";
	import { onMount } from "svelte";
	import Menu from "./lib/Menu.svelte";
	import { swipe } from "svelte-gestures";
	import { DataManager } from "./lib/DataManager";
	import { getWeekNr, Week } from "./lib/shared";

	let dataManager: DataManager;

	if (import.meta.env.DEV) {
		dataManager = new DataManager("http://localhost:8080");
	} else {
		dataManager = new DataManager(
			"https://api.betterschool.cheesyphoenix.tk"
		);
	}

	let selectedSchoolID: string;
	let selectedClassID: string;

	let weekIndex = 0;

	let weeks: Week[];
	let currWeek: Week;

	let klasser: { className: string; classID: string }[];
	let schools: { name: string; schoolID: string }[];

	let selectedClassName: string = "";
	$: {
		if (selectedClassID && klasser) {
			klasser.forEach((klasse) => {
				if (klasse.classID == selectedClassID)
					selectedClassName = klasse.className;
			});
		}
	}

	async function updateKlasser() {
		klasser = await dataManager.getClasses();

		klasser.sort((a, b) => {
			return a.className.localeCompare(b.className);
		});
	}

	$: {
		if (selectedSchoolID) {
			console.log("Schoolid updated");

			window.localStorage.setItem("schoolID", selectedSchoolID);

			dataManager.schoolID = selectedSchoolID;

			updateKlasser();
		}
	}

	$: {
		if (selectedClassID && selectedSchoolID) {
			window.localStorage.setItem("classID", selectedClassID);

			dataManager.classID = selectedClassID;
		}
	}

	async function updateWeeks() {
		const _weeks: Week[] = await dataManager.getWeeks();

		let weekNr = getWeekNr().toString();

		//go to next week if day is Saturday or Sunday
		if (new Date().getDay() == 6 || new Date().getDay() == 0) {
			weekNr = (parseInt(weekNr) + 1).toString();
		}

		for (let i = 0; i < _weeks.length; i++) {
			const week = _weeks[i];
			if (week.weekNr == weekNr) weekIndex = i;
		}

		weeks = _weeks;
		currWeek = weeks[weekIndex];
	}

	$: {
		if (selectedClassID && selectedSchoolID) {
			updateWeeks();
		}
	}

	onMount(async () => {
		// check for saved school and class ids
		selectedClassID = window.localStorage.getItem("classID");
		selectedSchoolID = window.localStorage.getItem("schoolID");

		schools = await dataManager.getSchools();

		if (!selectedSchoolID || !selectedClassID) {
			menuActive = true;
		}
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
</script>

<svelte:window bind:innerWidth={scrWidth} />

{#if menuActive}
	<Menu
		{klasser}
		{schools}
		{dataManager}
		{weeks}
		bind:selectedClassID
		bind:selectedSchoolID
		bind:menuActive
	/>
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
				className={selectedClassName}
				{weekIndex}
				on:changeWeek={(event) => {
					changePage(event.detail);
				}}
			/>
		{/if}
	{:else}
		{#if currWeek}
			<TimeTable
				week={currWeek}
				{swipeOffset}
				className={selectedClassName}
			/>
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
	{/if}
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
