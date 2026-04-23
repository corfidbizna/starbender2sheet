<script setup lang="ts">
import type { StatBoxInfo } from '@/composables/useCharacterData';
import { computed } from 'vue';
import DiceRollButton from './DiceRollButton.vue';

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
		max = Math.max(max, item.value, item.value2 || item.value);
	});
	return max;
});
const makeBar = (min: number, max: number, value: number, value2?: number): string => {
	const colors = {
		gold: 'var(--color-masterwork)',
		green: 'var(--color-buff)',
		red: 'var(--color-debuff)',
	};
	const realValue2 = value2 === undefined ? value : value2;
	const color1 = '#ffff';
	const color2 = realValue2 > value ? colors.green : colors.red;
	const colorEmpty = '#fff3';
	const firstBoundaryPos = ((value - min) / (max - min)) * 100;
	const secondBoundaryPos = ((realValue2 - min) / (max - min)) * 100;
	const lowBoundaryPos = Math.max(Math.min(firstBoundaryPos, secondBoundaryPos), 0);
	const highBoundaryPos = Math.max(firstBoundaryPos, secondBoundaryPos, 0);
	return `background-image: linear-gradient(90deg, ${color1} ${lowBoundaryPos}%, ${color2} ${lowBoundaryPos}%, ${color2} ${highBoundaryPos}%, ${colorEmpty} ${highBoundaryPos}%);`;
};

const stats = computed<
	{
		label: string;
		hovertext: string;
		bar: string;
		value: number;
		description: string;
		hasNeutral: boolean;
	}[]
>(() => {
	const max = rangeMax.value;
	return props.data.map(({ label, hovertext, value, value2, description }) => ({
		label,
		hovertext:
			label +
			': ' +
			value +
			(value2 !== undefined && value2 !== value ? ' base, ' + value2 + ' total' : '') +
			(hovertext ? '\n' + hovertext : ''),
		bar: makeBar(0, max, value, value2),
		value: value2 != undefined ? value2 : value,
		description: description || '',
		hasNeutral: hovertext?.includes(' (+0 ') || false,
	}));
});
</script>
<template>
	<div>
		<h2 v-if="props.label">{{ props.label }}</h2>
		<table>
			<tr
				v-for="stat in stats"
				:key="stat.label"
				:title="stat.hovertext"
				:class="{ 'has-neutral': stat.hasNeutral }"
			>
				<td class="label">
					{{ stat.label }}
				</td>
				<td class="bar">
					<span
						class="bar-bg"
						:style="stat.bar"
					></span>
				</td>
				<td class="value">{{ stat.value }}</td>
				<td v-if="!props.noRoll">
					<DiceRollButton v-bind="{ labelLog: stat.label, formula: stat.value }" />
					<!-- <button @click="rollStat(stat.label, stat.value)"></button> -->
				</td>
				<td
					v-if="stat.description"
					class="description"
				>
					{{ stat.description }}
				</td>
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
	border-spacing: 1px;
}
tr {
	width: 100%;
}
tr.has-neutral {
	font-style: italic;
}
tr.has-neutral .label::after {
	content: ' ';
	position: absolute;
	width: 100%;
	height: 100%;
	background: linear-gradient(346deg, #46b6 0, transparent 50%);
	left: 0;
	bottom: 1px;
	text-align: center;
	z-index: -1;
}
.label,
.value {
	position: relative;
	text-align: right;
	padding: 0 0.5em;
	max-width: fit-content;
	white-space: nowrap;
}
.value {
	font-weight: 800;
}
.bar {
	/* background-image: linear-gradient(90deg, #ffff 55%, #eb3f 55%, #eb3f 60%, #fff3 60%); */
	margin: 4px;
	width: 100%;
}
.bar-bg {
	display: inline-block;
	width: 100%;
	height: 1em;
	vertical-align: middle;
}
button {
	margin: 0;
	height: 1.25em;
	color: #fff;
	text-decoration: none;
	border: 1px solid #fff8;
	background: #0001;
	transition: background 0.1s;
	font-family: 'Destiny Symbols Common';
}
button:hover {
	background: #fff1;
	transition: background 0.1s;
}
button:active {
	background: #fff8;
}
.description {
	padding-left: 1em;
	width: auto;
	white-space: nowrap;
}
</style>
