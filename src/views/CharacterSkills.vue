<script setup lang="ts">
import useCharacterData, { type CharacterNames } from '@/composables/useCharacterData';
import SkillsTable from '@/components/SkillsTable.vue';
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
		<SkillsTable :character-id="characterId"></SkillsTable>
	</div>
</template>
