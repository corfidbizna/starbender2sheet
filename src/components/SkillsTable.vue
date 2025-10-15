<script setup lang="ts">
import useCharacterData, { skillsInfoMap, type SkillKey } from '@/composables/useCharacterData';
import LoadingModal from './LoadingModal.vue';
import useFilter from '@/composables/useFilter';
import { computed } from 'vue';

const props = defineProps<{
	characterId: string;
}>();
const { skills, skillsLoading, skillsRefresh } = useCharacterData(props.characterId);
const skillsList = computed<string[]>(() => Object.keys(skills.value));
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
</script>
<template>
	<div class="skills-table">
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
			<button @click="skillsRefresh">Reload Skills</button>
		</div>
		<div v-if="skillsLoading">
			<LoadingModal />
		</div>
		<div
			v-else
			class="scroll-box"
		>
			<table class="skill-table">
				<thead>
					<tr>
						<th class="name">Name</th>
						<th class="bar"></th>
						<th class="bonus">Bonus</th>
						<th class="description">Description</th>
					</tr>
				</thead>
				<tbody>
					<tr
						v-for="skill in filteredData.includes"
						:key="skill.name"
					>
						<td class="name">{{ skill.name }}</td>
						<td class="bar">🐐</td>
						<td class="bonus">{{ skill.value }}</td>
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
						<td class="bar">🐐</td>
						<td class="bonus">{{ skill.value }}</td>
						<td class="description">
							{{ skill.description }}
						</td>
					</tr>
				</tbody>
			</table>
		</div>
	</div>
</template>
<style scoped>
.search {
	padding: 0.25em;
}
.scroll-box {
	/* max-height: 100px; */
	overflow-y: scroll;
	border: 2px solid #666;
	border-radius: 0.5em;
}
.skill-table {
	width: 100%;
	table-layout: fixed;
	border-collapse: collapse;
	box-sizing: border-box;
}
tbody tr:nth-child(2n) {
	background-color: #0001;
}
.name {
	width: min-content;
}
.bar {
	width: auto;
}
.bonus {
	width: 3em;
}
.description {
	width: 50%;
	padding-left: 2em;
	text-align: left;
}
thead {
	position: sticky;
	top: 0;
	z-index: 1;
}
th {
	background-color: #333;
	border: none;
}
td {
	border: none;
	padding: 0.1em 0.25em;
}
.filtered {
	opacity: 0.2;
}
</style>
