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
	
	export const MODE_SCROLL = 'scroll'
	export const MODE_NORMAL = 'normal'
	export const DEFAULT_THRESHOLD = 10
	
	const defaultOptions = {
		duration: 400,
		easing: 'linear',
		minWidth: 768
	}
</script>

<script>
	import { setContext, getContext, onMount } from 'svelte'
	import { writable } from 'svelte/store'
	import { createEventDispatcher } from 'svelte';
	
	const dispatch = createEventDispatcher()
	
	let className = '', externalCurrent = 0
	export { className as class }
	export { externalCurrent as current}
	
	export let plugins = []
	export let options = defaultOptions
	
	options = Object.assign(defaultOptions, options)
	
	const delay = (options.duration < 600 ? 600 : options.duration) + 150
	
	setContext('container', {
		items: writable([]),
		current: writable(externalCurrent),
		mode: writable(MODE_NORMAL),
		ready: writable(true),
		animDisabled: writable(false),
		isVisible: ({ nth, current, threshold }) => (nth >= current - threshold) && (nth <= current +  threshold)
	})
	
	let {
		items,
		current,
		mode,
		isVisible,
		animDisabled,
	} = getContext('container')
	
	let wait, width, el, mounted
	
	$: style = Object
	.entries(options)
	.map(([prop, val]) => `--ms-${prop}: ${val}`)
	.join(';')
	$: normal = $mode === MODE_NORMAL
	$: width && updateWidth()
	$: $mode && updateMode()
	
	const getMode = () => width < options.minWidth ? MODE_NORMAL: MODE_SCROLL
	
	const updateWidth = debounce(() => {
		if(!mounted || !el) return
		
		$mode = getMode()
	}, 50)
	
	const updateMode = () => {
		if(!mounted || !el) return
		
		switch($mode) {
			case MODE_NORMAL: 
			
			el.scrollTop = el.clientHeight * $current
			wait = false
			
			break;
			case MODE_SCROLL:
			
			el.scrollTop = 0
			move($current, { forced: true })
			
			break;
			default: break;
		}
	}
	const move = (number, { forced, silent } = { forced: false, silent: false}) => {	
		let err = !mounted || normal || isNaN(number)
		
		const temp = clamp(number, 0, $items.length - 1)
		if(temp === $current || err) {
			if(!forced) {
				wait = false
				return
			}
		}
		
		$animDisabled = silent
		$current = temp
		
		dispatch('before-scroll', { current: $current })
		emit('beforeScroll')
		
		
		for(let i = 0; i < $items.length; i++) {			
			$items[i].right = ($current * 100) + -($items[i].nth * 200)
			$items[i].left= -$current * 100
			$items[i].visible = isVisible({ nth: $items[i].nth, current: $current, threshold: DEFAULT_THRESHOLD })
		}
		
		finished.call(null)
	}
	
	const finished = debounce(() => {
		dispatch('after-scroll', { current: $current })
		emit('afterScroll')
		wait = false
	}, delay)
	
	const emit = fn => {
		plugins.map(p => {
			if(fn in p) {
				p[fn]
				.bind({
					items: $items,
					current: $current,
					options,
					constants: { DEFAULT_THRESHOLD },
					move,
					getMode,
					getCurrent: () => $current,
					...p
				}).call(null)
			}
		})
	}
	
	const wheeling = async ({ deltaY }) => {
		if(wait) return
		
		if(!normal) {
			wait = true
			const dir = Math.sign(deltaY)			
			move($current + dir)
		} else {
			$current = Math.ceil(el.scrollTop / el.clientHeight)
		}
	}
	
	const swiping = e => {
		if(!isMobile()) return
		
		const directions = e.detail.directions;
		
		if(directions.top) {
			move($current - 1)
		}
		if(directions.bottom) {
			move($current + 1)
		}
	}
	
	onMount(() => {
		mounted = true
		
		SwipeListener(el)
		el.addEventListener('swipe', swiping)
		
		$mode = getMode()
		move($current)
		
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
class:ms-mode-normal={normal}
class:ms-mode-scroll={!normal}
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