<script>
	import { getContext, setContext, onMount } from 'svelte'
	import { writable } from 'svelte/store'

	setContext('nth', writable(null))
	setContext('left', writable(0))
	setContext('right', writable(0))
	
	let items = getContext('items')
	let nth = getContext('nth')
	let left = getContext('left')
	let right = getContext('right')
	let readyToBeAnimated = getContext('ready-to-be-animated')
	
	$: position = $items.find(item => item.nth === $nth)
	$: update(position)
	
	const update = (position) => {
		if(!position) return
		
		$left = position.left
		$right = position.right
	}
	
	onMount(() => {
		$nth = $items.length
		
		$items = [...$items, {
			left: 0,
			right: -$nth * 2 * 100,
			nth: $nth
		}]
	})
</script>

<div class:ready-to-be-animated={$readyToBeAnimated} class=" ms-wrapper ms-wrapper--{$nth}">
	<slot nth={$nth}></slot>
</div>

<style>
	div {
		height:100%;
		position: relative;
	}
	
	div :global(> div) {
		height: 100%;
	}
	
	div :global(> div) {
		position: absolute;
		height: 100%;
		width: 50%;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.ready-to-be-animated :global(> div) {
		transition: transform calc(1ms * var(--ms-duration)) var(--ms-easing);
	}
</style>