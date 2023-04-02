<script lang="ts">
	import closeAsset from "../assets/close.svg";
	import { fade, slide } from "svelte/transition";
	import { Jellyfish } from "svelte-loading-spinners";
	import { toasts, ToastContainer, FlatToast } from "svelte-toasts";
	import { swipe } from "svelte-gestures";
	import type { DataManager } from "./DataManager";
	import { exportICS, Week } from "./shared";

	export let selectedSchoolID: string;
	export let schools: { name: string; schoolID: string }[];

	export let selectedClassID: string;
	export let klasser: { className: string; classID: string }[];

	export let menuActive: boolean;

	export let dataManager: DataManager;

	//For .ics export
	export let weeks: Week[];

	let loading = false;

	let username: string;
	let password: string;
	let className: string;

	async function addNewUser() {
		loading = true;

		const { status, body } = await dataManager.addNewUser(
			username,
			password,
			className,
			selectedSchoolID
		);

		if (status == 200) {
			toasts.add({
				title: "New user added successfully!",
				description: "Class list will update shortly",
				duration: 3000,
				placement: "bottom-right",
				type: "success",
				theme: "dark",
				showProgress: true,
			});
		} else {
			toasts.add({
				title: "Failed to add user",
				description: body.length > 0 ? body : "Check your credentials!",
				duration: 3000,
				placement: "bottom-right",
				type: "error",
				theme: "dark",
				showProgress: true,
			});
		}

		loading = false;
	}

	function swipeHandler(
		event: CustomEvent<{
			direction: "top" | "right" | "bottom" | "left";
			target: EventTarget;
		}>
	) {
		if (event.detail.direction == "top") {
			menuActive = false;
		}
	}
</script>

<div
	id="menu"
	transition:slide
	use:swipe={{
		timeframe: 300,
		minSwipeDistance: 60,
		touchAction: "pan-x",
	}}
	on:swipe={swipeHandler}
>
	<h3 style="margin-left: 3rem;">Select school</h3>

	<select bind:value={selectedSchoolID} class="selectClass">
		{#if schools}
			{#each schools as school}
				<option value={school.schoolID}>{school.name}</option>
			{/each}
		{/if}
	</select>

	{#if selectedSchoolID}
		<h3 style="margin-left: 3rem;">Select class to view</h3>

		<select
			bind:value={selectedClassID}
			on:change={() => {
				menuActive = false;
			}}
			class="selectClass"
		>
			{#if klasser}
				{#each klasser as klasse}
					<option value={klasse.classID}>{klasse.className}</option>
				{/each}
			{/if}
		</select>

		<br />
		<br />
		<hr />
		<div style="margin-left: 3rem;">
			<h3>Register new class</h3>

			<p>
				Register using your Feide credentials. NOTE: These credentials
				will be saved on a server for the remainder of the current
				school year, and then used to log in to visma InSchool on your
				behalf to collect your schedule data. This data will thereafter
				be made PUBLICLY availible. If you are not comfortable with
				this, do not register!
			</p>

			<h5>Username:</h5>
			<input type="text" bind:value={username} />

			<h5>Password:</h5>
			<input type="password" bind:value={password} />

			<h5>Class:</h5>
			<input type="text" bind:value={className} />

			<h5>School:</h5>
			<select
				bind:value={selectedSchoolID}
				class="selectClass"
				style="margin-left: 0;"
			>
				{#if schools}
					{#each schools as school}
						<option value={school.schoolID}>{school.name}</option>
					{/each}
				{/if}
			</select>
			<br />
			<br />
			<button on:click={addNewUser}>Register</button>
		</div>

		{#if weeks}
			<br />
			<hr />
			<br />

			<button
				style="margin-left: 3rem;"
				on:click={() => {
					exportICS(weeks);
				}}>Download calendar file</button
			>
		{/if}

		<div class="centerHorizontal" id="GitHub-link">
			<a href="https://github.com/CheesyPhoenix/BetterSchool">
				This project is open-source! Fork me on GitHub or submit an
				issue here!
			</a>
		</div>

		{#if loading}
			<div class="loadingPanel" transition:fade>
				<Jellyfish />
			</div>
		{/if}

		<ToastContainer placement="bottom-right" let:data>
			<FlatToast {data} />
		</ToastContainer>
	{/if}

	<div
		class="settingsBtn"
		on:click={() => {
			menuActive = false;
		}}
		in:fade
		out:fade
	>
		<img
			src={closeAsset}
			alt="Forrige uke"
			class="buttonImg settingsImg"
			style="height: 35px;"
		/>
	</div>
</div>

<style>
	p {
		width: 36rem;
		color: #999;
	}

	a {
		text-decoration: none;
		color: #999;
	}
	a:hover {
		text-decoration: underline;
	}

	.centerHorizontal {
		width: 100%;
		text-align: center;
	}

	#GitHub-link {
		width: 100%;
		position: absolute;
		bottom: 1em;
	}

	#GitHub-link > a {
		margin-left: 0.5em;
		margin-right: 0.5em;
	}

	input {
		background-color: #333;
		border: none;
		border-radius: 5px;
		min-height: 2em;
		color: #f5f5f5;
		transition-duration: 0.15s;
		outline: none;
		padding-left: 5px;
	}
	input:hover {
		background-color: #444;
	}
	input:focus {
		background-color: #555;
		border: none;
	}
	input:focus-visible {
		border: none;
	}

	h5 {
		margin: 0.5em 0;
	}

	select {
		background-color: #333;
		border: none;
		border-radius: 5px;
		min-height: 2em;
		color: #f5f5f5;
		transition-duration: 0.15s;
		outline: none;
	}
	select:hover {
		background-color: #444;
	}
	select:focus {
		background-color: #555;
	}

	button {
		color: #f5f5f5;
		background-color: #333;
		height: 3em;
		width: auto;
		padding: 0.5em 1em;
		border: none;
		border-radius: 5px;
		transition-duration: 0.15s;
		cursor: pointer;
		outline: none;
	}
	button:hover {
		background-color: #555;
	}

	button:focus {
		background-color: #555;
	}

	#menu {
		z-index: 10;
		position: absolute;
		width: 100%;
		height: 100%;
		margin: 0;
		background-color: #222;
	}

	.loadingPanel {
		position: absolute;
		top: 0;
		left: 0;
		z-index: 11;
		width: 100%;
		height: 100%;
		display: flex;
		justify-content: center;
		align-items: center;
		background-color: #000000aa;
	}

	.selectClass {
		margin-left: 3rem;
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
</style>
