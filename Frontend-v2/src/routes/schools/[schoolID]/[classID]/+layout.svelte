<script>
	import { fly } from "svelte/transition";
</script>

<main in:fly={{ y: 100 }} out:fly={{ y: -100 }} class="absolute w-screen top-0">
	<slot />
</main>
