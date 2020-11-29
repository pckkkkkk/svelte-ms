<script context="module">
	import SwipeListener from 'swipe-listener';
	
	export function clamp(num, min, max) {
		return num <= min ? min : num >= max ? max : num;
	}
	
	export const debounce = (callback, time = 250, interval) => 
	(...args) => {
		clearTimeout(interval, interval = setTimeout(() => callback(...args), time));
	}
</script>

<script>
	import { setContext, getContext, onMount, tick, onDestroy } from 'svelte'
	import { writable } from 'svelte/store'
	import { createEventDispatcher } from 'svelte';
	
	export let current = 0
	export let plugins = []
	export let options = {
		duration: 400,
		easing: 'linear',
		minWidth: 400
	}
	
	const getCurrent = () => current
	
	const dispatch = createEventDispatcher()
	
	const style = Object
	.entries(options)
	.map(([prop, val]) => `--ms-${prop}: ${val}`)
	.join(';')
	
	let wait, stid, width, el
	
	setContext('ready-to-be-animated', writable(true))
	setContext('items', writable([]))
	setContext('is-normal', writable(width < options.minWidth))
	
	let items = getContext('items')
	let isNormal = getContext('is-normal')
	let readyToBeAnimated = getContext('ready-to-be-animated')
	
	$: updateWidth(width)
	
	const updateWidth = debounce((width) => {
		$isNormal = width < options.minWidth
		$readyToBeAnimated = false
		
		if(el) {
			if(!$isNormal) {
				el.scrollTop = 0
				move(current)
			} else {
				el.scrollTop = el.clientHeight * current
			}
		}
	}, 50)
	
	
	let className = ''
	export { className as class }
	
	const move = async (number, releaseAnimationBlock = false) => {
		if($isNormal || isNaN(number)) return 
		
		let temp = current
		current = clamp(number, 0, $items.length - 1)
		if(temp === current ) return;
		
		if(releaseAnimationBlock) {
			$readyToBeAnimated = true
			await tick()
		}
		
		dispatch('before-scroll', { current })
		__triggerPlugins('beforeScroll')
		
		for(let i = 0; i < $items.length; i++) {
			const { nth } = $items[i]
			
			$items[i].right = (current * 100) + -(nth * 200)
			$items[i].left= -current * 100
		}
		
		setTimeout(() => {
			$readyToBeAnimated = true
		}, 250)
		
		clearTimeout(stid)
		stid = setTimeout(() => {
			dispatch('after-scroll', { current })
			__triggerPlugins('afterScroll')
			
		}, options.duration)
	}
	
	const __triggerPlugins = (fn) => {
		plugins.map(p => {
			if(fn in p) {
				p[fn]
				.bind({
					current,
					options,
					move,
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
		const directions = e.detail.directions;

		if(directions.top) {
			move(current - 1)
		}
		if(directions.bottom) {
			move(current + 1)
		}
	}

	/*const pressing = ({ keyCode }) => {
		if([38, 40].includes(keyCode)) {
			move(current + (keyCode === 38 ? -1: 1))
		}
	}*/
	
	onMount(() => {
		$readyToBeAnimated = !$isNormal
		
		SwipeListener(el)
		el.addEventListener('swipe', swiping)

		move(current)
		
		__triggerPlugins('init')
	})

	onDestroy(() => {
		el.removeEventListener('swipe', swiping)
	})
</script>

<svelte:window bind:innerWidth={width} />

<div 
bind:this={el}
class:ms-mode-normal={$isNormal}
class:ms-mode-scroll={!$isNormal}
class="ms-container {className}"
{style}
on:wheel|passive={wheeling}
on:scroll={wheeling}>
<slot></slot>
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