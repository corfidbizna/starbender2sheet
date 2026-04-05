<script setup lang="ts">
import { rotateBGs } from '@/sharedState';

const props = defineProps<{ bgNames: string[] }>();
// const bgString =
// 	"background-image: url('./svgs/Lines_" +
// 	props.bgNames[0] +
// 	(rotateBGs.value ? '_anim' : '') +
// 	".svg');";
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
