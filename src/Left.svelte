<script>
	import { getContext } from 'svelte'

	let left = getContext('left')
	let nth = getContext('nth')
	let isNormal = getContext('is-normal')
</script>

<div class="ms-left ms-left-{$nth}" class:ms-mode-normal={$isNormal} style='transform: translateY(calc({$left} * 1%))'>
	<slot nth={$nth}></slot>
</div>

<style>
	.ms-mode-normal {
		transform: none !important;
	}
</style>