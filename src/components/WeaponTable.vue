<script setup lang="ts">
import useCharacterData, { type CharacterNames, type Weapon } from '@/composables/useCharacterData';
import WeaponItemRow from './WeaponItemRow.vue';
import LoadingModal from './LoadingModal.vue';
import useFilter from '@/composables/useFilter';
import { computed, ref } from 'vue';

const sortList: Record<string, string> = {
	Name: 'Name',
	Rarity: 'Rarity',
	Element: 'Element',
};
type weaponKeys = keyof Weapon;
const sortBy = ref<string>('Name');
const props = defineProps<{
	characterId: CharacterNames;
}>();
const { weapons, weaponsLoading, weaponsRefresh } = useCharacterData(props.characterId);
const sortedWeapons = computed<Weapon[]>(() => {
	const weaponsForSort = weapons.value.slice();
	// if (!(sortBy as weaponKeys)) {
	// 	throw new Error(`The sort key (${sortBy}) was not a valid key of Weapon!`)
	// }
	const sortKey = sortBy.value as weaponKeys;
	return weaponsForSort.sort((a, b) => {
		const aSortKey = a[sortKey];
		const bSortKey = b[sortKey];
		if (aSortKey === undefined || bSortKey === undefined) {
			return 0;
		}
		if (aSortKey > bSortKey) {
			return 1;
		}
		if (aSortKey < bSortKey) {
			return -1;
		}
		return 0;
	});
});
const { queryValue, invertFilter, filteredData } = useFilter<Weapon, string>({
	listUnfiltered: sortedWeapons,
	filter: { dataType: 'string', fieldName: 'Name' },
});
</script>
<template>
	<div class="weapon-table">
		<div class="search">
			<label>
				<span class="label">Filter by name: </span>
				<input
					type="text"
					v-model="queryValue"
				/>
			</label>
			<label>
				<span class="label">Invert: </span>
				<input
					type="checkbox"
					v-model="invertFilter"
				/>
			</label>
			<button @click="weaponsRefresh">Reload Weapons</button>
			<label for="sort-by"> Sort by:</label>
			<select
				name="sort"
				id="sort-by"
				v-model="sortBy"
			>
				<option
					v-for="item in Object.keys(sortList)"
					:key="item"
					:value="item"
				>
					{{ item }}
				</option>
			</select>
		</div>
		<div v-if="weaponsLoading"><LoadingModal /></div>
		<div
			v-else
			class="scroll-box"
		>
			<table>
				<tbody>
					<WeaponItemRow
						v-for="weapon in filteredData.includes"
						:key="weapon.Name"
						v-bind="weapon"
					/>
					<WeaponItemRow
						v-for="weapon in filteredData.excludes"
						:key="weapon.Name"
						v-bind="weapon"
						class="filtered"
					/>
				</tbody>
			</table>
		</div>
	</div>
</template>
<style scoped>
.search {
	padding: 0.25em;
}
/* .scroll-box {
	border: 4px solid #0008;
} */
table {
	width: 100%;
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

.filtered {
	opacity: 0.2;
}
</style>
