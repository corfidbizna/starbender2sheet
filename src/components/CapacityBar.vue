<script setup lang="ts">
type CapacityBarInfo = {
	max: number;
	current: number;
	color: string;
	min?: number;
};
const props = defineProps<CapacityBarInfo>();
const range = props.max - (props.min || 0);
const color = props.color || '#f0f';
const progress = (100 * (props.current - (props.min || 0))) / range;
// const progress = () => {
// 	const backgroundColor = '#fffa';
// 	const progress = (100 * (props.current - (props.min || 0))) / range;
// 	return (
// 		'background-color: linear-gradient(90deg, ' +
// 		props.color +
// 		' ' +
// 		progress +
// 		'%, ' +
// 		backgroundColor +
// 		' ' +
// 		progress +
// 		';'
// 	);
// };
</script>
<template>
	<span class="container">
		<span
			class="bar"
			:style="'width: ' + progress + '%; background-color: ' + color"
		></span>
		<span class="line"></span>
		<span
			class="remaining"
			:style="'width: calc(' + (100 - progress) + '% - 1px);'"
		></span>
	</span>
</template>
<style scoped>
.container {
	display: inline-block;
	width: calc(100% - 1px);
	height: 1.2em;
	margin: 2px;
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
	width: 1px;
	height: 100%;
	background-color: #fff;
}
.remaining {
	background-color: #fff4;
}
</style>
