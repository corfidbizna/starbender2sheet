<script setup lang="ts">
import type { CapacityBoxStatField, CharacterNames, Weapon } from '@/composables/useCharacterData';
import useCharacterData from '@/composables/useCharacterData';
import WeaponItemRow from '@/components/WeaponItemRow.vue';
import StatCapacityBox from '@/components/StatCapacityBox.vue';
import { computed } from 'vue';

type CharacterProps = {
	characterId: CharacterNames;
};
const props = defineProps<CharacterProps>();
const {
	character,
	weapons,
	weaponsLoading,
	namesOfEquippedWeapons,
	actionResources,
	getFinalStat,
} = useCharacterData(props.characterId);
const ammoCapacity = computed<CapacityBoxStatField[]>(() => {
	return [
		{
			label: 'Kinetic',
			stat: 'ammoKinetic',
			color: '#eee',
			max: getFinalStat('capacityKinetic'),
			current: actionResources.value.ammoKinetic,
		},
		{
			label: 'Special',
			stat: 'ammoSpecial',
			color: '#7AF48B',
			max: getFinalStat('capacitySpecial'),
			current: actionResources.value.ammoSpecial,
		},
		{
			label: 'Heavy',
			stat: 'ammoHeavy',
			color: '#B286FF',
			max: getFinalStat('capacityHeavy'),
			current: actionResources.value.ammoHeavy,
		},
	];
});
const equippedWeapons = computed<Weapon[]>(() => {
	return weapons.value.filter((weapon) => namesOfEquippedWeapons.value.includes(weapon.name));
});
</script>
<template>
	<div
		class="CharacterSkills"
		v-if="character"
	>
		<div class="weapon-block">
			<div style="display: flex">
				<StatCapacityBox
					v-bind="{
						label: 'Ammo',
						data: ammoCapacity,
					}"
					:characterId="characterId"
					style="width: 55%"
				/>
				<div style="width: 45%; margin-left: 1em">
					<StatCapacityBox
						v-bind="{
							label: 'Weapons',
							data: [
								{
									label: 'Equipped',
									stat: '',
									color: '#eee',
									max: getFinalStat('slotsWeapon'),
									current: getFinalStat('slotsWeaponUsed'),
								},
								{
									label: 'Hands Used',
									stat: '',
									color: '#eee',
									max: getFinalStat('hands'),
									current: getFinalStat('handsUsed'),
								},
							],
							hideRefillAll: true,
							noInteract: true,
						}"
						:characterId="characterId"
					/>
				</div>
			</div>
			<div v-if="!weaponsLoading">
				<h2>Equipped Weapons</h2>
				<div
					v-if="namesOfEquippedWeapons.length === 0"
					style="text-align: center"
				>
					<h1>No weapons equipped</h1>
				</div>
				<div v-else>
					<WeaponItemRow
						v-for="weapon in equippedWeapons"
						:key="weapon.name"
						v-bind="weapon"
						:characterId="characterId"
						:activatable="true"
					/>
				</div>
			</div>
		</div>
	</div>
</template>
