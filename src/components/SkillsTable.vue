<script setup lang="ts">
import { ref } from 'vue';
import useCharacterData, { type StatsTableItem } from '@/composables/useCharacterData';
import SkillItemRow from './SkillItemRow.vue';
import useFilter from '@/composables/useFilter';

const props = defineProps<{
	characterId: string;
}>();
const { getStatsTable } = useCharacterData(props.characterId);
const data = ref<StatsTableItem[]>([]);
getStatsTable().then((table) => (data.value = table));
const { queryValue, filteredData } = useFilter<StatsTableItem, string>({
	listUnfiltered: data,
	filter: { dataType: 'string', fieldName: 'Name' },
	shouldExclude: false,
});
</script>
<template>
	<div class="skills-table">
		<h1>Stats for Character ID: {{ characterId }}</h1>
		<div>
			<label>
				<span class="label">Filter by name: </span>
				<input
					type="text"
					v-model="queryValue"
				/>
			</label>
		</div>
		<div class="scroll-box">
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
						v-for="skill in filteredData"
						:key="skill.Name"
						v-bind="skill"
					/>
				</tbody>
			</table>
		</div>
	</div>
</template>
<style scoped>
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
</style>
