<script setup lang="ts">
import { actionLog } from '@/sharedState.ts';
import useCharacterData, {
	elements,
	rarities,
	type CharacterNames,
	type Weapon,
} from '@/composables/useCharacterData';
import WeaponItemRow from './WeaponItemRow.vue';
import LoadingModal from './LoadingModal.vue';
import useFilter from '@/composables/useFilter';
import { computed, ref } from 'vue';

const sortList: Record<string, string> = {
	// Dropdown Option: statKey,
	Name: 'Name',
	'Weapon Class': 'WeaponClass',
	Rarity: 'Rarity',
	Element: 'Element',
	Handedness: 'Handed',
	'Average Damage': 'DmgAvg',
};
type weaponKeys = keyof Weapon;
const sortBy = ref<string>('Name');
const sortAscending = ref<boolean>(true);
const toggleSortAscending = () => {
	sortAscending.value = !sortAscending.value;
};
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
		const aSortKey = a[sortKey] || '';
		const bSortKey = b[sortKey] || '';
		if (sortKey === 'Rarity') {
			const diff = rarities[a.Rarity] - rarities[b.Rarity];
			return diff * (sortAscending.value ? 1 : -1);
		} else if (sortKey === 'Element') {
			const diff = elements[a.Element] - elements[b.Element];
			return diff * (sortAscending.value ? 1 : -1);
		} else {
			if (aSortKey === undefined || bSortKey === undefined) {
				return 0;
			}
			if (aSortKey > bSortKey) {
				return sortAscending.value ? 1 : -1;
			}
			if (aSortKey < bSortKey) {
				return sortAscending.value ? -1 : 1;
			}
			return 0;
		}
	});
});
const { queryValue, invertFilter, filteredData } = useFilter<Weapon, string>({
	listUnfiltered: sortedWeapons,
	filter: { dataType: 'string', fieldName: 'Name' },
});
</script>
<template>
	<div class="weapon-tab-container">
		<span class="weapon-infos">
			<button @click="weaponsRefresh">Reload Weapons</button>
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
			</div>
			<div class="sort">
				<label for="sort-by"> Sort by:</label>
				<select
					name="sort"
					id="sort-by"
					v-model="sortBy"
				>
					<option
						v-for="item in Object.keys(sortList)"
						:key="item"
						:value="sortList[item]"
					>
						{{ item }}
					</option>
				</select>
				<button @click="toggleSortAscending">
					<span v-if="sortAscending">↓</span><span v-else>↑</span>
				</button>
			</div>
			<textarea
				v-model="actionLog"
				readonly
				class="action-log"
			></textarea>
		</span>
		<span class="weapon-table">
			<div v-if="weaponsLoading"><LoadingModal /></div>
			<div
				v-else
				class="scroll-box"
			>
				<WeaponItemRow
					v-for="weapon in filteredData.includes"
					:key="weapon.Name"
					v-bind="weapon"
					:characterId="characterId"
				/>
				<WeaponItemRow
					v-for="weapon in filteredData.excludes"
					:key="weapon.Name"
					v-bind="weapon"
					:characterId="characterId"
					class="filtered"
				/>
			</div>
		</span>
	</div>
</template>
<style scoped>
.weapon-tab-container {
	display: flex;
}
.weapon-infos {
	display: flex;
	flex-direction: column;
	width: 18em;
	margin-right: 20px;
}
.search {
	padding: 0.25em;
}
.action-log {
	color: #fff;
	font-size: 0.8em;
	resize: none;
	border-color: #fff8;
	background-color: #0004;
	height: 100%;
}
.weapon-table {
	display: inline;
	width: auto;
}
.scroll-box {
	overflow-y: scroll;
	height: calc(100vh - 150px);
	padding: 0 10px;
}
.filtered {
	opacity: 0.2;
}
</style>
