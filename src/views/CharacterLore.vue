<script setup lang="ts">
import { type CharacterDataSource, characterDataSources } from '@/composables/useCharacterData';
import { computed } from 'vue';

type CharacterProps = {
	characterId: string;
};
const props = defineProps<CharacterProps>();
const character = computed<CharacterDataSource | undefined>(
	() => characterDataSources[props.characterId],
);
</script>
<template>
	<div v-if="!character">
		<h1>Invalid character ID: {{ characterId }}</h1>
	</div>
	<div v-else>
		<h1>Lore for {{ character.label }}</h1>
	</div>
</template>
<style></style>
