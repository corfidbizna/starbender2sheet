<script setup lang="ts">
import { computed } from 'vue';

type CapacityBarInfo = {
	max: number;
	current: number;
	color: string;
	colorFull?: string;
	min?: number;
};
const props = defineProps<CapacityBarInfo>();
const range = computed<number>(() => props.max - (props.min || 0));
const color = computed<string>(() => {
	if (!!props.colorFull && progress.value >= 100) {
		return props.colorFull || '#f0f';
	}
	return props.color || '#f0f';
});
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
			:style="'width: ' + progress + '%; background-color: ' + color"
		></span>
		<span
			class="line"
			:style="'left: calc(' + progress + '% - 1px)'"
		></span>
		<span
			class="remaining"
			:style="'width: calc(' + (100 - progress) + '%);'"
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
	position: relative;
	display: inline-block;
	width: 100%;
	height: 1.2em;
	margin: 2px;
}
.bar,
.remaining,
.line {
	transition:
		width 0.15s,
		background-color 0.075s;
}
.bar,
.remaining {
	display: inline-block;
	height: calc(100% - 2px);
	margin-top: 1px;
	margin-bottom: 1px;
}
.line {
	position: absolute;
	display: inline-block;
	width: 2px;
	height: 100%;
	background-color: #fff;
}
.line {
	transition: left 0.15s;
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
