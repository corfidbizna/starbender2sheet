<script setup lang="ts">
import { computed } from 'vue';

type CapacityBarInfo = {
	max: number;
	current: number;
	color: string;
	colorFull?: string;
	min?: number;
	hideLine?: boolean;
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
		<!-- <span class="remaining"></span> -->
		<span
			class="bar"
			:style="'width: ' + progress + '%; background-color: ' + color"
		></span>
		<span
			v-if="!hideLine"
			class="line"
			:style="'left: calc(' + progress + '% - 1px)'"
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
	text-align: left;
	display: inline-block;
	width: 100%;
	max-height: 1.2em;
	height: 100%;
	background-color: #fff4;
}
.bar,
.line {
	transition:
		width 0.15s,
		background-color 0.075s;
}
.bar {
	display: block;
	height: 100%;
}
.line {
	position: absolute;
	display: block;
	top: -1px;
	width: 2px;
	height: calc(100% + 2px);
	background-color: #fff;
}
.line {
	transition: left 0.15s;
}
.blank {
	height: 1em;
	display: block;
}
</style>
