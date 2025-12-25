<script setup lang="ts">
import type { CharacterNames } from '@/composables/useCharacterData';
import useCharacterData from '@/composables/useCharacterData';

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
		<h1>Gameplay buff display for {{ character.label }}</h1>
	</div>
</template>
