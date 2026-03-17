<script setup lang="ts">
import { rotateBGs } from '@/sharedState';

const props = defineProps<{ bgName: string }>();
const bgString =
	"background-image: url('/svgs/Lines_" +
	props.bgName +
	(rotateBGs.value ? '_anim' : '') +
	".svg');";
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
	opacity: 0.3;
	background-size: cover;
	background-attachment: fixed;
	background-position: center;
}
</style>
