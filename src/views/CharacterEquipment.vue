<script setup lang="ts">
import useCharacterData, { type CharacterNames } from '@/composables/useCharacterData';
import WeaponTable from '@/components/WeaponTable.vue';
// import WeaponItemRow from './WeaponItemRow.vue';
type CharacterProps = {
	characterId: CharacterNames;
};
const props = defineProps<CharacterProps>();
const { character } = useCharacterData(props.characterId);
</script>

<template>
	<div
		class="CharacterEquipment"
		v-if="character"
	>
		<h1>Equipment for {{ character.label }}</h1>
		<WeaponTable :character-id="characterId"></WeaponTable>
	</div>
</template>
