<script setup lang="ts">
import useCharacterData, { type SkillsTableItem } from '@/composables/useCharacterData';
import SkillItemRow from './SkillItemRow.vue';
import LoadingModal from './LoadingModal.vue';
import useFilter from '@/composables/useFilter';

const props = defineProps<{
	characterId: string;
}>();
const { skills, skillsLoading, skillsRefresh } = useCharacterData(props.characterId);
const { queryValue, invertFilter, filteredData } = useFilter<SkillsTableItem, string>({
	listUnfiltered: skills,
	filter: { dataType: 'string', fieldName: 'Name' },
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
			<table>
				<thead>
					<tr>
						<th class="bonus">Bonus</th>
						<th>Name</th>
						<th class="score">Score</th>
						<th>Focused</th>
						<th>Notes</th>
					</tr>
				</thead>
				<tbody>
					<SkillItemRow
						v-for="skill in filteredData.includes"
						:key="skill.Name"
						v-bind="skill"
					/>
					<SkillItemRow
						v-for="skill in filteredData.excludes"
						:key="skill.Name"
						v-bind="skill"
						class="filtered"
					/>
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
table {
	width: 100%;
	/* border-collapse: collapse; */
}
thead {
	position: sticky;
	top: 0;
	z-index: 1;
}
th {
	background-color: #333;
}
th,
td {
	border: 1px solid #666;
	padding: 1px 4px;
}
.bonus,
.score {
	max-width: 1rem;
}
.filtered {
	opacity: 0.2;
}
</style>
