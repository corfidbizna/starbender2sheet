<script setup lang="ts">
import useCharacterData, { type CharacterNames, type Weapon } from '@/composables/useCharacterData';
import WeaponItemRow from './WeaponItemRow.vue';
import LoadingModal from './LoadingModal.vue';
import useFilter from '@/composables/useFilter';

const props = defineProps<{
	characterId: CharacterNames;
}>();
const { weapons, weaponsLoading, weaponsRefresh } = useCharacterData(props.characterId);
const { queryValue, invertFilter, filteredData } = useFilter<Weapon, string>({
	listUnfiltered: weapons,
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
.scroll-box {
	border: 2px solid #666;
	border-radius: 1em;
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

.filtered {
	opacity: 0.2;
}
</style>
