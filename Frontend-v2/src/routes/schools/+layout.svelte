<script lang="ts">
	import { mobileThreshold } from "$lib/components/timetable/shared";
	import { headerText } from "$lib/stores/header";
	import { fade, fly, scale } from "svelte/transition";
	import settingsSVG from "$lib/assets/settings.svg";
	import closeSVG from "$lib/assets/close.svg";
	import { afterNavigate } from "$app/navigation";
	import { isMobile } from "$lib/stores/isMobile";

	let menuOpen = false;

	afterNavigate(() => {
		menuOpen = false;
	});

	$: headerLength = $headerText.length;
</script>

<svelte:head>
	<title>{$headerText.map((x) => x.text).join(" / ")}</title>
</svelte:head>

<div
	in:fly={{ y: 100 }}
	out:fly={{ y: -100 }}
	class="absolute max-w-screen w-max"
>
	{#if $isMobile == false}
		<header
			in:fade
			out:fade
			class="w-full h-16 p-2 z-10 flex flex-col justify-center font-bold"
		>
			<div>
				<h1 class="inline text-2xl hover:underline">
					<a href="/">BetterSchool</a>
				</h1>
				<br />
				{#if $headerText}
					<h2 class="inline ml-2 text-sm">
						{#each $headerText as text, i}
							<a
								href={text.url}
								class={text.url
									? "hover:underline"
									: "opacity-70"}>{text.text}</a
							>
							<p class="inline opacity-40">
								{i < $headerText.length - 1 ? " / " : ""}
							</p>
						{/each}
					</h2>
				{/if}
			</div>
		</header>
	{:else if $isMobile == true}
		<div class="absolute z-20 top-0">
			<button
				class="relative w-screen block select-none"
				on:click={() => (menuOpen = !menuOpen)}
			>
				{#if menuOpen}
					<img
						in:scale
						out:scale
						src={closeSVG}
						alt="close settings"
						class="right-5 top-4 h-8 absolute hover:drop-shadow-[2px_4px_6px_black] hover:cursor-pointer hover:brightness-150 duration-200"
					/>
				{:else}
					<img
						in:scale
						out:scale
						src={settingsSVG}
						alt="open settings"
						class="right-4 top-3 h-10 absolute hover:drop-shadow-[2px_4px_6px_black] hover:cursor-pointer hover:brightness-150 duration-200"
					/>
				{/if}
			</button>
		</div>

		{#if menuOpen}
			<div
				in:fade
				out:fade
				class="fixed z-10 top-0 left-0 w-screen h-screen bg-black bg-opacity-80 backdrop-blur-sm"
			>
				<div
					class="max-w-md m-auto flex justify-start pt-36 flex-col h-screen gap-2"
				>
					<a
						href="/"
						class="bg-[#555] hover:bg-[#777] duration-200 w-full p-4 rounded-xl block"
						in:fly={{ y: -25 }}
						out:fly={{
							y: -25,
							delay: 70 * headerLength,
						}}>Home</a
					>

					{#each $headerText as headerText, i}
						<div
							in:fly={{ y: -50, delay: 70 * i }}
							out:fly={{
								y: -50,
								delay: 70 * (headerLength - i),
							}}
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								stroke-width="1.5"
								stroke="currentColor"
								class="w-6 h-6 mx-auto"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									d="M19.5 8.25l-7.5 7.5-7.5-7.5"
								/>
							</svg>

							<a
								href={headerText.url}
								class="{headerText.url !== undefined
									? 'bg-[#555] hover:bg-[#777]'
									: 'bg-[#333]'} duration-200 w-full p-4 rounded-xl block"
								>{headerText.text}</a
							>
						</div>
					{/each}
				</div>
			</div>
		{/if}
	{/if}

	<slot />
</div>
