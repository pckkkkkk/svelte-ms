<script>
	import { getContext, setContext, onMount } from 'svelte'
	import { DEFAULT_THRESHOLD, MODE_NORMAL } from 'svelte-ms/src/Container.svelte';
	import { writable } from 'svelte/store'
	
	setContext('wrapper', {
		nth: writable(0),
		left: writable(0),
		right: writable(0)
	})
	
	let {
		items,
		current,
		isVisible,
		animDisabled,
		mode
	} = getContext('container')
	
	let {
		nth,
		left,
		right
	} = getContext('wrapper')
	
	let visible = false, ready = false
	
	
	$: modeChanged($mode)
	$: position = $items.find(item => item.nth === $nth)
	$: position && updatePosition(position)
	
	const modeChanged = () => {
		ready = false
		setTimeout(() => {
			ready = true
		}, 0)
	}
	
	
	const updatePosition = position => {		
		$left = position.left
		$right = position.right
		visible = position.visible
	}
	
	onMount(() => {
		$nth = $items.length
		
		$items = [...$items, {
			left: 0,
			right: -$nth * 2 * 100,
			nth: $nth,
			visible: isVisible({ nth: $nth, current: $current, threshold: DEFAULT_THRESHOLD })
		}]
	})
</script>

<div class:ready-to-be-animated={visible && ready && !$animDisabled} class="ms-wrapper ms-wrapper--{$nth}">
	{#if visible || $mode === MODE_NORMAL}
	<slot nth={$nth}></slot>
	{/if}
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