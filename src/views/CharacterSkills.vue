<script setup lang="ts">
import useCharacterData, { type CharacterNames } from '@/composables/useCharacterData';
import SkillsTable from '@/components/SkillsTable.vue';
import BGImage from '@/components/BGImage.vue';
type CharacterProps = {
	characterId: CharacterNames;
};
const props = defineProps<CharacterProps>();
const { character } = useCharacterData(props.characterId);
</script>
<template>
	<div
		class="CharacterSkills"
		v-if="character"
	>
		<BGImage :bgName="'Skills'" />
		<SkillsTable :character-id="characterId"></SkillsTable>
	</div>
</template>
