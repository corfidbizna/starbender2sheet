<script setup lang="ts">
import { computed } from 'vue';

type CapacityBarInfo = {
	max: number;
	current: number;
	color: string;
	min?: number;
};
const props = defineProps<CapacityBarInfo>();
const range = computed<number>(() => props.max - (props.min || 0));
const color = computed<string>(() => props.color || '#f0f');
const progress = computed<number>(() =>
	Math.min(100, Math.max(0, (100 * (props.current - (props.min || 0))) / range.value)),
);
</script>
<template>
	<span
		class="container"
		v-if="props.max > 0"
	>
		<span
			class="bar"
			:style="'width: calc(' + progress + '% - 2px); background-color: ' + color"
		></span>
		<span class="line"></span>
		<span
			class="remaining"
			:style="'width: calc(' + (100 - progress) + '% - 2px);'"
		></span>
	</span>
	<span
		v-else
		class="blank"
		:style="'width: 100%; background-color: ' + color"
	></span>
</template>
<style scoped>
.container {
	display: inline-block;
	width: calc(100% - 2px);
	height: 1.2em;
	margin: 2px;
}
.bar,
.remaining,
.line {
	transition: width 0.15s;
}
.bar,
.remaining {
	display: inline-block;
	height: calc(100% - 2px);
	margin-top: 1px;
	margin-bottom: 1px;
}
.line {
	display: inline-block;
	width: 2px;
	height: 100%;
	background-color: #fff;
}
.remaining {
	background-color: #fff4;
}
.blank {
	height: 1em;
	display: inline-block;
	margin: 2px;
}
</style>
