<script>
	import { getContext } from 'svelte'
	import { MODE_NORMAL } from 'svelte-ms/src/Container.svelte';
	
	const {
		mode
	} = getContext('container')
	
	const {
		right,
		nth,
	} = getContext('wrapper')
	
</script>

<div class="ms-right ms-right-{$nth}" class:ms-mode-normal={$mode === MODE_NORMAL} style='transform: translateY(calc({$right} * 1%))'>
	<slot nth={$nth}></slot>
</div>

<style>
	div {
		left: 50%;
	}
	
	.ms-mode-normal {
		transform: none !important;
	}
</style>