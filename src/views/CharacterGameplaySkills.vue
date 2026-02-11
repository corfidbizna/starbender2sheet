<script setup lang="ts">
import useCharacterData, {
	type BarBoxStatField,
	type CharacterNames,
	type SkillKey,
	type StatBoxInfo,
	skillsInfoMap,
} from '@/composables/useCharacterData';
import StatBarsBox from '@/components/StatBarsBox.vue';
import { computed } from 'vue';

type CharacterProps = {
	characterId: CharacterNames;
};
const props = defineProps<CharacterProps>();
const { character, skills } = useCharacterData(props.characterId);

const skillsInfo = computed<StatBoxInfo>(() => {
	const fieldArray = <BarBoxStatField[]>[];
	const skillList = Object.keys(skills.value) || [];
	skillList.forEach((name: string) => {
		const key = name as SkillKey;
		fieldArray.push({
			label: skillsInfoMap[key].label,
			stat: 'str',
			value: skills.value[key] || 0,
		});
	});
	return {
		label: 'Skills',
		data: fieldArray,
	};
});
</script>
<template>
	<div
		class="skills-gameplay-block"
		v-if="character"
	>
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
