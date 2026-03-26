<script setup lang="ts">
import useCharacterData from '@/composables/useCharacterData';
import type {
	ActionResourceKey,
	CapacityBoxInfo,
	CapacityBoxStatField,
} from '@/composables/useCharacterData';
import CapacityBar from './CapacityBar.vue';
import SpinBox from './SpinBox.vue';

const props = defineProps<CapacityBoxInfo & { characterId: string }>();
const { actionResources, actionResourceUpdate } = useCharacterData(props.characterId);

const refillStat = (stat: CapacityBoxStatField) => {
	const diff = stat.inverted ? -stat.current : stat.max - stat.current;
	actionResourceUpdate(stat.stat as ActionResourceKey, diff);
};
const refillAll = () => {
	props.data.forEach((stat) => {
		refillStat(stat);
	});
};
// const setCurrentToNew = (value: number, stat: string) => {
// 	const foundStat = props.data.find((item) => item.stat === stat);
// 	if (foundStat) {
// 		const diff = foundStat.current - value;
// 		console.log(diff);
// 		actionResourceUpdate(foundStat.stat as keyof ActionResource, diff);
// 	}
// };
</script>
<template>
	<table class="stat-box-table">
		<caption v-if="label !== ''">
			<h2>
				<span
					v-if="props.label"
					class="table-label"
					>{{ props.label }}</span
				><button
					v-if="!hideRefillAll"
					@click="refillAll"
				>
					Refill All
				</button>
			</h2>
		</caption>
		<tbody>
			<tr
				v-for="stat in props.data"
				:key="stat.label"
				:title="stat.hovertext"
				:class="{ underlined: stat.underlined }"
			>
				<td class="label">{{ stat.label }}</td>
				<td class="capacity-bar">
					<CapacityBar
						v-bind="{
							max: stat.max,
							current: stat.inverted ? stat.max - stat.current : stat.current || 0,
							color: stat.color || '#eee',
							colorFull: stat.colorMax,
						}"
					/>
				</td>
				<td
					v-if="!noInteract"
					class="increment-container"
				>
					<SpinBox
						v-bind="{
							value: stat.current,
							max: stat.max,
							inverted: stat.inverted,
						}"
						v-model="actionResources[stat.stat]"
					/>
					<!-- <input
						type="number"
						id="current"
						v-model="actionResources[stat.stat]"
					/> -->
				</td>
				<td
					v-else
					class="capacity"
				>
					{{ stat.current || 0 }}
				</td>
				<td class="divider">⁄</td>
				<td class="capacity">{{ stat.max }}</td>
				<!-- <td
					v-if="!noInteract"
					class="increment-container"
				>
					<button
						class="increment-button"
						@click="actionResourceUpdate(stat.stat, -1)"
					>
						<span> - </span>
					</button>
					<button
						class="increment-button"
						@click="actionResourceUpdate(stat.stat, 1)"
					>
						<span> + </span>
					</button>
				</td> -->
				<td v-if="!noInteract">
					<button @click="refillStat(stat)">⤒</button>
				</td>
			</tr>
		</tbody>
	</table>
</template>
<style>
.stat-box-table {
	width: 100%;
	border-collapse: collapse;
}
.stat-box-table .table-label {
	width: 100%;
	margin-right: auto;
}
.stat-box-table h2 > button {
	margin-left: auto;
	float: right;
	padding: 3px;
}
.stat-box-table tr {
	padding: 0;
	margin: 0;
	white-space: nowrap;
}
.stat-box-table tr.underlined {
	border-bottom: var(--line);
}
.stat-box-table .label {
	text-align: right;
	padding: 0 0.5em;
}
.stat-box-table .capacity-bar {
	font-size: 0.8em;
	width: 100%;
	margin: 0;
	padding: 0;
}
.stat-box-table input {
	width: 3em;
}
.stat-box-table .capacity {
	padding: 0 0.5em;
	font-weight: bold;
	text-align: right;
}
.stat-box-table .divider {
	padding: 0;
	margin: 0;
	font-weight: bold;
}
.stat-box-table button {
	line-height: 0.8em;
	color: #fff;
	text-decoration: none;
	border: 1px solid #fff8;
	background: #0001;
	transition: background 0.1s;
}
.stat-box-table td button {
	width: 1em;
	padding: 2px 0;
}
.increment-container {
	display: inline-block;
	margin: 0 0.25em;
}
.increment-container :last-child {
	border-left: 0;
}
.stat-box-table button:hover {
	background: #fff1;
	transition: background 0.1s;
}
.stat-box-table button:active {
	background: #fff8;
}
</style>
