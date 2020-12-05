<script>
	import { getContext } from 'svelte'
	import { MODE_NORMAL } from 'svelte-ms/src/Container.svelte';
	
	const {
		mode
	} = getContext('container')
	
	const {
		left,
		nth,
	} = getContext('wrapper')
</script>

<div class="ms-left ms-left-{$nth}" class:ms-mode-normal={$mode === MODE_NORMAL} style='transform: translateY(calc({$left} * 1%))'>
	<slot nth={$nth}></slot>
</div>

<style>
	.ms-mode-normal {
		transform: none !important;
	}
</style>