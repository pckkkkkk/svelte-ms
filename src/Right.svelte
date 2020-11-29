<script>
	import { getContext } from 'svelte'
	
	let right = getContext('right')
	let nth = getContext('nth')
	let isNormal = getContext('is-normal')
</script>

<div class="ms-right-{$nth}" class:ms-mode-normal={$isNormal} style='transform: translateY(calc({$right} * 1%))'>
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