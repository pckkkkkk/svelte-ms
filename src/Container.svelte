<script context="module">
	import SwipeListener from 'swipe-listener';
	
	export const isMobile = () => /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
	
	export function clamp(num, min, max) {
		return num <= min ? min : num >= max ? max : num
	}
	
	export const debounce = (callback, time = 250, interval) => 
	(...args) => {
		clearTimeout(interval, interval = setTimeout(() => callback(...args), time))
	}
	
	const defaultOptions = {
		duration: 400,
		easing: 'linear',
		minWidth: 400
	}
</script>

<script>
	import { setContext, getContext, onMount } from 'svelte'
	import { writable } from 'svelte/store'
	import { createEventDispatcher } from 'svelte';
	
	let className = ''
	export { className as class }
	export let current = 0
	export let plugins = []
	export let options = defaultOptions
	
	options = Object.assign(defaultOptions, options)
	
	const getCurrent = () => current
	const getMode = () => $isNormal ? 'normal' : 'scroll'
	
	const dispatch = createEventDispatcher()
	const style = Object
	.entries(options)
	.map(([prop, val]) => `--ms-${prop}: ${val}`)
	.join(';')
	
	let wait, stid, rtid, width, el, mounted
	
	setContext('ready-to-be-animated', writable(true))
	setContext('items', writable([]))
	setContext('is-normal', writable(width < options.minWidth))
	
	let items = getContext('items')
	let isNormal = getContext('is-normal')
	let readyToBeAnimated = getContext('ready-to-be-animated')
	
	$:  updateWidth(width)
	
	const updateWidth = debounce((width) => {
		if(!mounted) return

		$isNormal = width < options.minWidth
		$readyToBeAnimated = false
		
		if(!el) return
		
		if(!$isNormal) {
			el.scrollTop = 0
			move(current, true)
		} else {
			el.scrollTop = el.clientHeight * current
		}
		
		clearTimeout(rtid)
		rtid = setTimeout(() => {
			$readyToBeAnimated = true
		}, 100)
	}, 50)
	
	const move = async (number, releaseAnimationBlock = false) => {
		if($isNormal || isNaN(number)) return 
		
		const temp = current
		current = clamp(number, 0, $items.length - 1)
		if(temp === current ) return;
		
		if(releaseAnimationBlock) {
			$readyToBeAnimated = true
		}
		
		dispatch('before-scroll', { current })
		emit('beforeScroll')
		
		for(let i = 0; i < $items.length; i++) {
			const { nth } = $items[i]
			
			$items[i].right = (current * 100) + -(nth * 200)
			$items[i].left= -current * 100
		}
		
		setTimeout(() => {
			$readyToBeAnimated = true
		}, 100)
		
		clearTimeout(stid)
		stid = setTimeout(() => {
			dispatch('after-scroll', { current })
			emit('afterScroll')
		}, options.duration)
	}
	
	const emit = fn => {
		plugins.map(p => {
			if(fn in p) {
				p[fn]
				.bind({
					items: $items,
					current,
					options,
					move,
					getMode,
					getCurrent,
					...p
				}).call(null)
			}
		})
	}
	
	const wheeling = ({ deltaY }) => {
		if(!$isNormal) {
			if(wait) return
			
			wait = true
			const dir = Math.sign(deltaY)
			move(current + dir)
			
			setTimeout(() => {
				wait = false
			}, 600)
		} else {
			current = Math.ceil(el.scrollTop / el.clientHeight)
		}
	}
	
	const swiping = e => {
		if(!isMobile()) return
		
		const directions = e.detail.directions;
		
		if(directions.top) {
			move(current - 1)
		}
		if(directions.bottom) {
			move(current + 1)
		}
	}
	
	onMount(() => {
		mounted = true
		$readyToBeAnimated = !$isNormal
		
		SwipeListener(el)
		el.addEventListener('swipe', swiping)
		
		move(current)
		emit('init')
		
		return () => {
			emit('destroy')
			el.removeEventListener('swipe', swiping)
		}
	})
</script>

<svelte:window bind:innerWidth={width} />

<div {style}
bind:this={el}
class:ms-mode-normal={$isNormal}
class:ms-mode-scroll={!$isNormal}
class="ms-container {className}"
on:wheel|passive={wheeling}
on:scroll={wheeling}>
<slot />
</div>

<style>
	div {
		position: relative;
		height: 100%;
		width: 100%;
	}
	
	div.ms-mode-normal {
		overflow: auto
	}
	
	div.ms-mode-scroll {
		overflow: hidden
	}
</style>