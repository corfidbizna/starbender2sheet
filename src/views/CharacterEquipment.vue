<script setup lang="ts">
import { computed } from 'vue';
import {
	type CharacterDataSource,
	characterDataSources,
	type CharacterNames,
} from '@/composables/useCharacterData';
import WeaponTable from '@/components/WeaponTable.vue';
// import WeaponItemRow from './WeaponItemRow.vue';
type CharacterProps = {
	characterId: CharacterNames;
};
const props = defineProps<CharacterProps>();
const character = computed<CharacterDataSource>(() => characterDataSources[props.characterId]);
</script>

<template>
	<div class="CharacterEquipment">
		<div>
			<h1>Equipment for {{ character.label }}</h1>
			<WeaponTable :character-id="characterId"></WeaponTable>
		</div>
	</div>
</template>
