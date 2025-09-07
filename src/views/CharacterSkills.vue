<script setup lang="ts">
import useCharacterData from '@/composables/useCharacterData';
import SkillsTable from '@/components/SkillsTable.vue';
type CharacterProps = {
	characterId: string;
};
const props = defineProps<CharacterProps>();
const { character } = useCharacterData(props.characterId);
</script>

<template>
	<div
		class="CharacterSkills"
		v-if="character"
	>
		<h1>Skills for {{ character.label }}</h1>
		<SkillsTable :character-id="characterId"></SkillsTable>
	</div>
</template>
