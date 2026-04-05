<script setup lang="ts">
import { rotateBGs } from '@/sharedState';

const props = defineProps<{ bgNames: string[] }>();

/* GROUP ANIMATION */
/*
The following code is to be added to a group to achieve rotation.
This example will rotate the group around the coordinate (432,432)
	by 360° over the course of 350 seconds.

	<animateTransform attributeName="transform" type="rotate" dur="350s" values="0 432 432;360 432 432;" repeatCount="indefinite"/>

In the "[°deg] 432 432" portion of the tag, the "432" is half of the dimensions of the viewBox.
(Top of document)                                      (found here)
<?xml version="1.0" encoding="UTF-8"?>       vvvvv       vvv vvv
	<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 864 864">
	(the rest of the document)
*/

/* COMPONENT ANIMATION */
/*
The following code is to be added to the inside of a component to animate it.
This example will cause the `cy` property of the component to slide linearly
	from 367 to 430 and then back to 367 over the course of 78 seconds.

	<animate attributeName="cy" values="367;430;367" dur="78s" repeatCount="indefinite"/>

Note: the tag of the component you're adding this to might be self-closing.
	<circle ……properties…… />
	This `/>` bit at the end here is the self-closing thing.
	You'll want to change the tag into the following shape before pasting the above example into it.
	<circle ……properties……></circle>
	                      /\
					(insert animation code here)
*/

const bgString =
	'background-image: ' +
	props.bgNames
		.map((name) => "url('./svgs/Lines_" + name + (rotateBGs.value ? '_anim' : '') + ".svg')")
		.join(', ') +
	';';
</script>
<template>
	<div
		class="rotating-bg"
		:style="bgString"
	></div>
</template>
<style>
.rotating-bg {
	position: absolute;
	overflow: hidden;
	width: 100vw;
	height: 100vh;
	left: 0;
	top: 0;
	z-index: -1;
	mix-blend-mode: screen;
	opacity: 0.2;
	background-blend-mode: screen;
	background-size: cover;
	background-attachment: fixed;
	background-position: center;
}
</style>
