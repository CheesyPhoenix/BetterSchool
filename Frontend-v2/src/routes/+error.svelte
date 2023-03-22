<script>
	import { page } from "$app/stores";
</script>

<div class="m-auto w-max text-center mt-32">
	<h1 class="text-2xl bold mb-2">{$page.status}: {$page.error?.message}</h1>

	<a
		href="/"
		class="p-4 md:p-2 bg-[#444] block mb-2 rounded-lg duration-200 w-full hover:bg-[#666] opacity-100"
		>Return to safety</a
	>
</div>
