<script setup lang="ts">
import { ref } from 'vue';
import usePlayerData, { type StatsTableItem } from '@/composables/usePlayerData';
import SkillItemRow from './SkillItemRow.vue';
import useFilter from '@/composables/useFilter';

const props = defineProps<{
	playerId: string;
}>();
const { getStatsTable } = usePlayerData(props.playerId);
const data = ref<StatsTableItem[]>([]);
getStatsTable().then((table) => (data.value = table));
const { queryValue, filteredData } = useFilter<StatsTableItem, string>({
	listUnfiltered: data,
	filter: { dataType: 'string', fieldName: 'Name' },
});
</script>
<template>
	<div class="skills-table">
		<h1>Stats for player ID: {{ playerId }}</h1>
		<p>One skill:</p>
		<p>All skills</p>
		<div>
			<label>
				<span class="label">Filter by name</span>
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
						<th>Bonus</th>
						<th>Name</th>
						<th>Score</th>
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
	max-height: 200px;
	overflow-y: scroll;
}
table {
	width: 100%;
	border-collapse: collapse;
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
	padding: 2px 4px;
}
</style>
