<script setup lang="ts">
import type { CharacterNames } from '@/composables/useCharacterData';

type CharacterProps = {
	characterId: CharacterNames;
};
const props = defineProps<CharacterProps>();
</script>
<template>
	<div>
		<h1>Armor for {{ props.characterId }}</h1>
	</div>
</template>
