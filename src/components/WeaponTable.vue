<script setup lang="ts">
import { computed } from 'vue';
import useCharacterData, { type CharacterNames, type Weapon } from '@/composables/useCharacterData';
import WeaponItemRow from './WeaponItemRow.vue';
import useFilter from '@/composables/useFilter';

const props = defineProps<{
	characterId: CharacterNames;
}>();
const { getWeaponsTable } = useCharacterData(props.characterId);
// const weapons = ref<Weapon[]>([defaultWeapon]);
// getWeaponsTable().then((table) => (weapons.value = table));
const { data: weapons, isLoading: weaponsLoading, refresh: refreshWeapons } = getWeaponsTable();
const weaponsFilteredByCharacter = computed<Weapon[]>(() => {
	return weapons.value.filter((item) => item[props.characterId]);
});
const { queryValue, filteredData } = useFilter<Weapon, string>({
	listUnfiltered: weaponsFilteredByCharacter,
	filter: { dataType: 'string', fieldName: 'Name' },
	shouldExclude: false,
});
</script>
<template>
	<div class="weapon-table">
		<div>
			<label>
				<span class="label">Filter by name: </span>
				<input
					type="text"
					v-model="queryValue"
				/>
			</label>
			<button @click="refreshWeapons">Reload Weapons</button>
		</div>
		<div v-if="weaponsLoading"><h1>Weapons are loading</h1></div>
		<div
			v-else
			class="scroll-box"
		>
			<table>
				<tbody>
					<WeaponItemRow
						v-for="weapon in filteredData"
						:key="weapon.Name"
						v-bind="weapon"
					/>
				</tbody>
			</table>
		</div>
	</div>
</template>
<style scoped>
.scroll-box {
	overflow-y: scroll;
	border: 2px solid #666;
	border-radius: 0.5em;
}
table {
	width: 100%;
	/* border-collapse: collapse; */
}
thead {
	position: sticky;
	top: 0;
	z-index: 1;
}
th {
	background-color: #333;
}
th,
td {
	border: 1px solid #666;
	padding: 1px 4px;
}
.bonus,
.score {
	max-width: 1rem;
}
</style>
