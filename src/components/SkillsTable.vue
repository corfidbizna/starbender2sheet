<script setup lang="ts">
import { actionLog, updateLog } from '@/sharedState.ts';
import useCharacterData, { skillsInfoMap, type SkillKey } from '@/composables/useCharacterData';
import LoadingModal from './LoadingModal.vue';
import useFilter from '@/composables/useFilter';
import { computed } from 'vue';
import { DiceFormula } from '@/business_logic/diceFormula';

const props = defineProps<{
	characterId: string;
}>();
const { skills, skillsLoading, skillsRefresh } = useCharacterData(props.characterId);
const skillsList = computed<string[]>(() => Object.keys(skills.value));
const rangeMax = computed<number>((): number => {
	let max = -Infinity;
	Object.keys(skills.value).forEach((item) => {
		const key = item as SkillKey;
		max = Math.max(max, skills.value[key] || -Infinity);
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
type SkillShape = {
	name: string;
	value: number;
	description: string;
};
const skillShapes = computed<SkillShape[]>(() => {
	return skillsList.value.map((name: string) => {
		const key = name as SkillKey;
		return {
			name: skillsInfoMap[key].label,
			value: skills.value[key] || 0,
			description: skillsInfoMap[key].description,
		};
	});
});
const { queryValue, invertFilter, filteredData } = useFilter<SkillShape, string>({
	listUnfiltered: skillShapes,
	filter: { dataType: 'string', fieldName: 'name' },
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
	<div class="skills">
		<span class="skills-infos">
			<button @click="skillsRefresh">Reload Skills</button>
			<h2>Filter</h2>
			<div class="search">
				<label>
					<span class="label">Filter by name: </span>
					<input
						type="text"
						v-model="queryValue"
					/>
				</label>
				<label>
					<span class="label">Invert: </span>
					<input
						type="checkbox"
						v-model="invertFilter"
					/>
				</label>
			</div>
			<h2>Action Log</h2>
			<textarea
				v-model="actionLog"
				readonly
				class="action-log"
			></textarea>
		</span>
		<span v-if="skillsLoading">
			<LoadingModal />
		</span>
		<span
			v-else
			class="skills-content"
		>
			<h2>Skills</h2>
			<div class="scroll-box">
				<table class="skill-table">
					<tbody>
						<tr
							v-for="skill in filteredData.includes"
							:key="skill.name"
						>
							<td class="name">{{ skill.name }}</td>
							<td class="bar">
								<span
									class="bar-bg"
									:style="makeBar(0, rangeMax, skill.value)"
								></span>
							</td>
							<td class="bonus">{{ skill.value }}</td>
							<td><button @click="rollStat(skill.name, skill.value)"></button></td>
							<td class="description">
								{{ skill.description }}
							</td>
						</tr>
						<tr
							v-for="skill in filteredData.excludes"
							:key="skill.name"
							class="filtered"
						>
							<td class="name">{{ skill.name }}</td>
							<td class="bar">
								<span
									class="bar-bg"
									:style="makeBar(0, rangeMax, skill.value)"
								></span>
							</td>
							<td class="bonus">{{ skill.value }}</td>
							<td><button @click="rollStat(skill.name, skill.value)"></button></td>
							<td class="description">
								{{ skill.description }}
							</td>
						</tr>
					</tbody>
				</table>
			</div>
		</span>
	</div>
</template>
<style scoped>
.skills {
	height: calc(100vh - 154px);
	display: flex;
	flex-direction: row;
	border-spacing: 1px;
	text-align: right;
}
.skills-infos {
	display: flex;
	flex-direction: column;
	width: 18em;
	margin-right: 20px;
}
.search {
	padding: 0.25em;
	text-align: left;
}
.action-log {
	height: 100%;
}
.skills-content {
	max-width: 800px;
	flex: 1;
}
.scroll-box {
	/* max-height: 100px; */
	height: fit-content;
	max-height: calc(100% - 3em);
	overflow-y: scroll;
}
.skill-table {
	padding-top: 0.25em;
	width: 100%;
	border-collapse: collapse;
	box-sizing: border-box;
}
tbody tr:nth-child(2n) {
	background-color: #00000004;
}
.name {
	max-width: fit-content;
	padding-left: 1em;
	white-space: nowrap;
}
tbody .bar {
	width: 10em;
}
tbody .bar-bg {
	display: inline-block;
	width: 100%;
	height: 1em;
	vertical-align: middle;
}
.bonus {
	width: fit-content;
	font-weight: bold;
}
table button {
	margin: 0;
	height: 1.25em;
	color: #fff;
	text-decoration: none;
	border: 1px solid #fff8;
	background: #0001;
	transition: background 0.1s;
	font-family: 'Destiny Symbols Common';
}
table button:hover {
	background: #fff1;
	transition: background 0.1s;
}
table button:active {
	background: #fff8;
}
.description {
	padding-left: 1em;
	text-align: left;
}
td {
	border: none;
	padding: 0.1em 0.25em;
}
.filtered {
	opacity: 0.2;
}
</style>
