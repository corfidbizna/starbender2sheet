<script setup lang="ts">
import type { StatBoxInfo } from '@/composables/useCharacterData';
import { DiceFormula } from '@/business_logic/diceFormula';
import { updateLog } from '@/sharedState';
import { computed } from 'vue';

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
		gold: '#eb3f',
		green: '#afaf',
		red: '#fa9f',
	};
	const realValue2 = value2 === undefined ? value : value2 || 0;
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
	{ label: string; hovertext: string; bar: string; value: number; description: string }[]
>(() => {
	const max = rangeMax.value;
	return props.data.map(({ label, hovertext, value, value2, description }) => ({
		label,
		hovertext:
			label +
			': ' +
			value +
			(value2 != undefined
				? ' base, ' + (value2 != undefined ? value2 : value) + ' total'
				: '') +
			(hovertext ? '\n' + hovertext : ''),
		bar: makeBar(0, max, value, value2),
		value: value2 != undefined ? value2 : value,
		description: description || '',
	}));
});
const rollStat = (label: string, value: number) => {
	const formula = new DiceFormula('1d20+' + value);
	const result = formula.roll(() => 0);
	let string = 'Roll: ' + label + ' ⇒ ' + result;
	if (result <= 1 + value) {
		string += '\n == Natural 1! ==';
	} else if (result >= 20 + value) {
		string += '\n == Natural 20! ==';
	}
	updateLog(string);
};
</script>
<template>
	<div>
		<h2 v-if="props.label">{{ props.label }}</h2>
		<table>
			<tr
				v-for="stat in stats"
				:key="stat.label"
				:title="stat.hovertext"
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
					<button @click="rollStat(stat.label, stat.value)"></button>
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
.label,
.value {
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
