<script lang="ts">
	import { env } from "$env/dynamic/public";
	import LogoAnim from "$lib/assets/logo-anim.svg";
	import Input from "$lib/components/Input.svelte";
	import { headerText } from "$lib/stores/header";
	import { fade, fly, scale, slide } from "svelte/transition";
	import type { PageData } from "./$types";
	export let data: PageData;

	$headerText = [
		{ text: "Schools", url: "/schools" },
		{ text: data.schoolName, url: "./" },
		{ text: "Add Class" },
	];

	let username: string;
	let password: string;
	let className: string;

	let usernameValid: boolean;
	let passwordValid: boolean;
	let classNameValid: boolean;

	let loading = false;
	let addClassError: string | undefined = undefined;
	let addClassSuccess: boolean = false;

	async function addClass() {
		if (!usernameValid || !passwordValid || !classNameValid) {
			addClassError = "Not all fields are valid.";

			return;
		}

		loading = true;
		addClassError = undefined;
		addClassSuccess = false;

		const res = await fetch(
			`${
				env.PUBLIC_API_URL ?? "https://api.betterschool.chph.tk"
			}/addUser`,
			{
				body: JSON.stringify({
					username: username,
					pass: password,
					class: className,
					schoolID: data.schoolID,
				}),
				method: "post",
				headers: {
					"Content-Type": "application/json",
				},
			}
		);

		if (res.ok) {
			addClassSuccess = true;
		} else {
			addClassError = `Error: ${res.status} - ${await res.text()}`;
		}

		loading = false;
	}
</script>

{#if loading}
	<div
		in:fade
		out:fade
		class="absolute flex justify-center screenHeight w-screen top-0 flex-col z-10 bg-black bg-opacity-70 backdrop-blur-sm duration-200"
	>
		<div class="absolute flex justify-center w-screen">
			<img
				in:scale
				out:scale
				src={LogoAnim}
				alt="Loading..."
				class="w-36"
			/>
		</div>
	</div>
{/if}

<main
	in:fly={{ y: 100 }}
	out:fly={{ y: -100 }}
	class="absolute w-screen top-0 pt-16 overflow-y-auto screenHeight"
>
	<div class="max-w-[35rem] m-auto p-4">
		<h1 class="font-bold text-lg text-center">
			Add class to {data.schoolName}
		</h1>

		<br />

		<p class="text-zinc-400">
			Register using your Feide credentials. NOTE: These credentials will
			be saved on a server for the remainder of the current school year,
			and then used to log in to Visma InSchool on your behalf to collect
			your schedule data.This schedule will thereafter be made PUBLICLY
			availible. If you are not comfortable with this, do not register!
		</p>

		<br />

		<p class="text-zinc-400">
			<b class="font-bold">IMPORTANT!:</b> Since your plain-text
			credentials are needed to log in to Visma, there is only so much we
			can do to protect them. In the event of a malicious actor gaining
			access to the server in which the credentials are stored they can
			easily extract your raw password. It is therefore not adviseable to
			use the same password anywhere else.
			<a
				href="https://passord.vlfk.no/ForgottenPassword"
				class="hover:underline text-zinc-300"
				>If you want to change your Feide password to accomodate for
				this, you might be able to do that here</a
			>
		</p>

		<br />

		<form on:submit|preventDefault={addClass}>
			<p>Username:</p>
			<Input
				type="text"
				placeholder="Username..."
				required
				validator={(val) =>
					val.length == 0 ? "Please enter your username" : undefined}
				bind:value={username}
				bind:valid={usernameValid}
			/>

			<p>Password:</p>
			<Input
				type="password"
				placeholder="Password..."
				required
				validator={(val) =>
					val.length == 0 ? "Please enter your password" : undefined}
				bind:value={password}
				bind:valid={passwordValid}
			/>

			<p>Class name:</p>
			<Input
				type="text"
				placeholder="Class name..."
				required
				validator={(val) => {
					if (val.length == 0) return "Please enter your class name";

					if (data.classes.map((x) => x.className).includes(val))
						return "That name is already taken";

					return undefined;
				}}
				bind:value={className}
				bind:valid={classNameValid}
			/>

			<br />

			{#if addClassError}
				<p in:slide out:slide class="bg-red-700 p-2 rounded-md mb-2">
					{addClassError}
				</p>
			{/if}
			{#if addClassSuccess}
				<p in:slide out:slide class="bg-green-700 p-2 rounded-md mb-2">
					New class added successfully! Class list will update
					shortly.
				</p>
			{/if}

			<button type="submit" class="duration-200 btn"
				>Add class to {data.schoolName}</button
			>
		</form>
	</div>
</main>
