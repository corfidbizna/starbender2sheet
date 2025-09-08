<script setup lang="ts">
import WeaponTable from '@/components/WeaponTable.vue';
import { type CharacterNames } from '@/composables/useCharacterData';
type CharacterProps = {
	characterId: CharacterNames;
};
const props = defineProps<CharacterProps>();
</script>
<template>
	<div>
		<h1>Weapons for {{ props.characterId }}</h1>
	</div>
	<WeaponTable :character-id="characterId"></WeaponTable>
</template>
