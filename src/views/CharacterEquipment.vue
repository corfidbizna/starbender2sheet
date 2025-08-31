<script setup lang="ts">
import { computed, ref } from 'vue';
import useCharacterData, {
	type CharacterDataSource,
	characterDataSources,
	type Weapon,
} from '@/composables/useCharacterData';
import WeaponTable from '@/components/WeaponTable.vue';
// import WeaponItemRow from './WeaponItemRow.vue';
type CharacterProps = {
	characterId: string;
};
const props = defineProps<CharacterProps>();
const character = computed<CharacterDataSource>(() => characterDataSources[props.characterId]);

const { getWeaponsTable } = useCharacterData(props.characterId);
const weapons = ref<Weapon[]>([]);
getWeaponsTable().then((table) => (weapons.value = table));
</script>

<template>
	<div class="CharacterEquipment">
		<div>
			<h1>Equipment for {{ character.label }}</h1>
			<WeaponTable :character-id="characterId"></WeaponTable>
			<pre>{{ weapons }}</pre>
		</div>
	</div>
</template>
