<script setup lang="ts">
import useCharacterData, {
	type BarBoxStatField,
	type SkillKey,
	type StatBoxInfo,
	type StatName,
	skillsInfoMap,
} from '@/composables/useCharacterData';
import StatBarsBox from '@/components/StatBarsBox.vue';
import { computed } from 'vue';

const { skills, skillsBuffed, stats, statsBuffed, makeSummaryForStat } = useCharacterData();

const skillsInfo = computed<StatBoxInfo>(() => {
	const fieldArray = <BarBoxStatField[]>[];
	const skillList = Object.keys(skills.value) || [];
	skillList.forEach((name: string) => {
		const key = name as SkillKey;
		fieldArray.push({
			label: skillsInfoMap[key].label,
			stat: 'str',
			hovertext: makeSummaryForStat([
				{ statName: key as StatName, description: skillsInfoMap[key].description },
				{ statName: (skillsInfoMap[key].baseStat + 'Skills') as StatName },
				{ statName: skillsInfoMap[key].baseStat as StatName },
				// '"' + skillsInfoMap[key].description + '"',
				// ...statsBuffed.value[key as StatName].summary,
				// ...statsBuffed.value[(skillsInfoMap[key].baseStat + 'Skills') as StatName].summary,
				// ...statsBuffed.value[skillsInfoMap[key].baseStat as StatName].summary,
			]),
			value: (skills.value[key] || 0) + (stats.value[key as StatName].total || 0),
			value2:
				(skillsBuffed.value[key] || 0) + (statsBuffed.value[key as StatName].total || 0),
		});
	});
	return {
		label: 'Skills',
		data: fieldArray,
	};
});
</script>
<template>
	<div class="skills-gameplay-block">
		<div class="gameplay-skills-list">
			<StatBarsBox v-bind="skillsInfo" />
		</div>
	</div>
</template>
<style>
.gameplay-skills-list {
	height: calc(100vh - 125px);
	overflow-y: scroll;
	scrollbar-width: none;
}
</style>
