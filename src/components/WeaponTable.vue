<script setup lang="ts">
import { ref } from 'vue';
import useCharacterData, { type Weapon } from '@/composables/useCharacterData';
import WeaponItemRow from './WeaponItemRow.vue';
import useFilter from '@/composables/useFilter';

const props = defineProps<{
	characterId: string;
}>();
const { getWeaponsTable } = useCharacterData(props.characterId);
const defaultWeapon = {
	Aurora: false,
	Kara: true,
	Mark: false,
	Lewis: false,
	Name: 'Test Gun',
	Flavortext: '"Flavortext goes here."',
	Rarity: 'Common',
	Element: 'Kinetic',
	WeaponClass: 'Sidearm',
	AttackType: 'Bullet',
	HitType: 'AC',
	HitBonus: 0,
	CritRange: 2,
	CritMult: 2,
	Damage: '12d6+(8*STR)',
	DamageType: 'Kinetic',
	RangeType: 'Melee',
	Range: 1,
	Shape: '',
	Duration: 0,
	Handed: 2,
	Ammo: 1,
	AmmoCapacity: 20,
	AmmoType: 'kinetic ammo',
	IsMagic: false,
	Perks: '',
};
const data = ref<Weapon[]>([defaultWeapon]);
getWeaponsTable().then((table) => (data.value = table));
const { queryValue, filteredData } = useFilter<Weapon, string>({
	listUnfiltered: data,
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
		</div>
		<div class="scroll-box">
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
