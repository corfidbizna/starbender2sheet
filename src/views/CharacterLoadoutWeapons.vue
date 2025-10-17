<script setup lang="ts">
import WeaponTable from '@/components/WeaponTable.vue';
import { type CharacterNames } from '@/composables/useCharacterData';
type CharacterProps = {
	characterId: CharacterNames;
};
const props = defineProps<CharacterProps>();
</script>
<template>
	<WeaponTable :character-id="props.characterId"></WeaponTable>
</template>
