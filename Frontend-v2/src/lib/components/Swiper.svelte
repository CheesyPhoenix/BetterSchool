<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import { fly } from "svelte/transition";

	export let defaultIndex: number;
	export let index = defaultIndex;
	let _index = defaultIndex;
	$: {
		if (index != _index || _index != index) {
			animFromX = 0;
			animFromI = _index;

			_index = index;
		}
	}

	export let length: number;

	const dispatch = createEventDispatcher();

	// swiping

	let startSwipePosX: number | undefined = undefined;
	let currSwipePosX: number | undefined = undefined;
	let animFromX = 0;
	let animFromI: number | undefined = undefined;

	function startSwipe(
		e:
			| (MouseEvent & {
					currentTarget: EventTarget & HTMLDivElement;
			  })
			| (TouchEvent & {
					currentTarget: EventTarget & HTMLDivElement;
			  })
	) {
		let event;
		if ((e as TouchEvent).changedTouches)
			event = (e as TouchEvent).changedTouches[0];
		else event = e as MouseEvent;

		startSwipePosX = event.clientX;
	}

	function endSwipe(
		e:
			| (MouseEvent & {
					currentTarget: EventTarget & HTMLDivElement;
			  })
			| (TouchEvent & {
					currentTarget: EventTarget & HTMLDivElement;
			  })
	) {
		if (
			startSwipePosX == undefined ||
			_index == undefined ||
			currSwipePosX == undefined
		) {
			startSwipePosX = undefined;
			currSwipePosX = undefined;
			return;
		}

		let event;
		if ((e as TouchEvent).changedTouches)
			event = (e as TouchEvent).changedTouches[0];
		else event = e as MouseEvent;

		animFromI = _index;

		let diff = event.clientX - startSwipePosX;
		if (Math.abs(diff) > 100) {
			if (diff > 0) {
				if (_index > 0) {
					_index--;
					index--;
				}
			} else {
				if (_index < length - 1) {
					_index++;
					index++;
				}
			}
		}

		animFromX = currSwipePosX - startSwipePosX;

		startSwipePosX = undefined;
		currSwipePosX = undefined;

		// emit change event
		dispatch("change", { newIndex: _index, oldIndex: animFromI });
	}

	function swiping(
		e:
			| (MouseEvent & {
					currentTarget: EventTarget & HTMLDivElement;
			  })
			| (TouchEvent & {
					currentTarget: EventTarget & HTMLDivElement;
			  })
	) {
		if (startSwipePosX == undefined) return;

		let event;
		if ((e as TouchEvent).changedTouches)
			event = (e as TouchEvent).changedTouches[0];
		else event = e as MouseEvent;

		currSwipePosX = event.clientX;
	}

	let windowWidth: number;
</script>

<svelte:window bind:innerWidth={windowWidth} />

<div class="w-max h-full">
	<div
		style="transform: translateX(calc(1/3*-100% + {startSwipePosX ==
			undefined || currSwipePosX == undefined
			? '0px'
			: currSwipePosX - startSwipePosX + 'px'}));"
		class="flex justify-center w-max h-full"
		on:mousedown={startSwipe}
		on:touchstart={startSwipe}
		on:mouseup={endSwipe}
		on:touchend={endSwipe}
		on:mousemove={swiping}
		on:touchmove={swiping}
	>
		{#key animFromX}
			{#key animFromI}
				<div
					class="w-screen"
					in:fly={{
						opacity: 1,
						x:
							animFromI != undefined
								? (windowWidth * (_index != animFromI ? 1 : 0) -
										Math.abs(animFromX)) *
								  (animFromI == _index
										? animFromX < 0
											? 1
											: -1
										: animFromI > _index
										? -1
										: 1)
								: 0,
					}}
				>
					<slot name="prev" index={_index - 1} />
				</div>

				<div
					class="w-screen"
					in:fly={{
						opacity: 1,
						x:
							animFromI != undefined
								? (windowWidth * (_index != animFromI ? 1 : 0) -
										Math.abs(animFromX)) *
								  (animFromI == _index
										? animFromX < 0
											? 1
											: -1
										: animFromI > _index
										? -1
										: 1)
								: 0,
					}}
				>
					<slot name="main" index={_index} />
				</div>

				<div
					class="w-screen"
					in:fly={{
						opacity: 1,
						x:
							animFromI != undefined
								? (windowWidth * (_index != animFromI ? 1 : 0) -
										Math.abs(animFromX)) *
								  (animFromI == _index
										? animFromX < 0
											? 1
											: -1
										: animFromI > _index
										? -1
										: 1)
								: 0,
					}}
				>
					<slot name="next" index={_index + 1} />
				</div>
			{/key}
		{/key}
	</div>
</div>
