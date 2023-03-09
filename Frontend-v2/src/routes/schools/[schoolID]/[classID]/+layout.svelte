<script>
	import { fly } from "svelte/transition";
</script>

<main
	in:fly={{ y: 100 }}
	out:fly={{ y: -100 }}
	class="absolute w-screen screenHeight overflow-y-auto overflow-x-hidden top-0 z-[-1]"
>
	<slot />
</main>
