<script setup lang="ts">
import { computed } from 'vue';

type StatGroup = {
	label: string;
	value: number;
};
export type StatBoxInfo = {
	label: string;
	data: StatGroup[];
};
const props = defineProps<StatBoxInfo>();
// const rangeMin = computed<number>((): number => {
// 	let min = Infinity;
// 	props.data.forEach((item) => {
// 		min = Math.min(min, item.value);
// 	});
// 	return min;
// });
const rangeMax = computed<number>((): number => {
	let max = -Infinity;
	props.data.forEach((item) => {
		max = Math.max(max, item.value);
	});
	return max;
});
const makeBar = (min: number, max: number, value: number, value2?: number): string => {
	const colorValue1 = '#ffff';
	const colorValue2 = '#eb3f';
	const colorEmpty = '#fff3';
	const firstBoundaryPos = ((value - min) / (max - min)) * 100; //2-0 / 10-0
	const secondBoundaryPos = ((value2 || 0 - min) / (max - min)) * 100;
	console.log(
		`background-image: linear-gradient(90deg, ${colorValue1} ${firstBoundaryPos}%, ${colorValue2} ${firstBoundaryPos}%, ${colorValue2} ${secondBoundaryPos}%, ${colorEmpty} ${secondBoundaryPos}%);`,
	);
	return `background-image: linear-gradient(90deg, ${colorValue1} ${firstBoundaryPos}%, ${colorValue2} ${firstBoundaryPos}%, ${colorValue2} ${secondBoundaryPos}%, ${colorEmpty} ${secondBoundaryPos}%);`;
};
</script>
<template>
	<div>
		<h2>{{ props.label }}</h2>
		<table>
			<tr
				v-for="stat in props.data"
				:key="stat.label"
			>
				<td class="label">{{ stat.label }}</td>
				<td
					class="bar"
					:style="makeBar(0, rangeMax, stat.value)"
				>
					 
				</td>
				<td class="value">{{ stat.value }}</td>
			</tr>
		</table>
	</div>
</template>
<style scoped>
div {
	margin: 0.5em;
}
table {
	width: 100%;
}
tr {
	width: 100%;
}
.label,
.value {
	text-align: right;
	padding: 0 0.5em;
	max-width: fit-content;
}
.value {
	font-weight: 800;
}
.bar {
	/* background-image: linear-gradient(90deg, #ffff 55%, #eb3f 55%, #eb3f 60%, #fff3 60%); */
	margin: 4px;
	width: 100%;
}
</style>
