<script setup lang="ts">
import { actionLog } from '@/sharedState.ts';
import useCharacterData, {
	elements,
	rarities,
	type CharacterNames,
	type Weapon,
} from '@/composables/useCharacterData';
import WeaponItemRow from './WeaponItemRow.vue';
// import TEMPActiveWeapon from './TEMPActiveWeapon.vue';
import LoadingModal from './LoadingModal.vue';
import useFilter from '@/composables/useFilter';
import { computed, ref } from 'vue';
import CapacityBar from './CapacityBar.vue';

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
const { weapons, weaponsLoading, weaponsRefresh, getFinalStat } = useCharacterData(
	props.characterId,
);
const sortedWeapons = computed<Weapon[]>(() => {
	const weaponsForSort = weapons.value.slice();
	// if (!(sortBy as weaponKeys)) {
	// 	throw new Error(`The sort key (${sortBy}) was not a valid key of Weapon!`)
	// }
	const sortKey = sortBy.value as weaponKeys;
	return weaponsForSort.sort((a, b) => {
		const aSortKey = a[sortKey] || '';
		const bSortKey = b[sortKey] || '';
		if (sortKey === 'rarity') {
			const diff = rarities[a.rarity] - rarities[b.rarity];
			return diff * (sortAscending.value ? 1 : -1);
		} else if (sortKey === 'element') {
			const diff = elements[a.element] - elements[b.element];
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
	filter: { dataType: 'string', fieldName: 'name' },
});
</script>
<template>
	<div class="weapon-tab-container">
		<span class="weapon-infos">
			<button @click="weaponsRefresh">Reload Weapons</button>
			<h2>Weapon Slots</h2>
			<span
				style="display: flex; align-items: center"
				:style="
					getFinalStat('slotsWeaponUsed') > getFinalStat('slotsWeapon')
						? 'color: #f66'
						: ''
				"
			>
				<span>Used </span>
				<span style="flex-grow: 1; display: inline-block">
					<CapacityBar
						v-bind="{
							max: getFinalStat('slotsWeapon'),
							current: getFinalStat('slotsWeaponUsed'),
							color: '#fff',
						}"
					/>
				</span>
				<span
					> {{ getFinalStat('slotsWeaponUsed') }} ⁄ {{
						getFinalStat('slotsWeapon')
					}}</span
				>
			</span>
			<h2>Filter</h2>
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
				<h2>Sort By</h2>
				<div class="sort-div">
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
			</div>
			<h2>Action Log</h2>
			<textarea
				v-model="actionLog"
				readonly
				class="action-log"
			></textarea>
		</span>
		<span v-if="weaponsLoading"><LoadingModal /></span>
		<span
			v-else
			class="weapon-list"
		>
			<WeaponItemRow
				v-for="weapon in filteredData.includes"
				:key="weapon.name"
				v-bind="weapon"
				:characterId="characterId"
			/>
			<WeaponItemRow
				v-for="weapon in filteredData.excludes"
				:key="weapon.name"
				v-bind="weapon"
				:characterId="characterId"
				class="filtered"
			/>
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
	padding: 10px;
	position: fixed;
	height: calc(100vh - 85px);
}
.search {
	padding: 0.25em;
}
.sort-div {
	width: 100%;
}
#sort-by {
	width: calc(100% - 25px);
	margin-right: auto;
}
.action-log {
	flex: 1;
}
.weapon-list {
	margin-left: 20em;
	display: inline;
	width: auto;
	flex: 1;
}
.scroll-box {
	height: 100%;
	overflow-y: scroll;
	padding: 0 10px;
}
.filtered {
	opacity: 0.2;
}
</style>
