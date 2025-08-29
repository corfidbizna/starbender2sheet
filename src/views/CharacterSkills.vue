<script setup lang="ts">
import { computed } from 'vue';
import { type CharacterDataSource, characterDataSources } from '@/composables/useCharacterData';
import SkillsTable from '@/components/SkillsTable.vue';
type CharacterProps = {
	characterId: string;
};
const props = defineProps<CharacterProps>();
const character = computed<CharacterDataSource | undefined>(
	() => characterDataSources[props.characterId],
);
</script>

<template>
	<div class="CharacterSkills">
		<div v-if="!character">
			<h1>Invalid character ID: {{ characterId }}</h1>
		</div>
		<div v-else>
			<h1>Skills for {{ character.label }}</h1>
			<SkillsTable :character-id="characterId"></SkillsTable>
		</div>
	</div>
</template>
