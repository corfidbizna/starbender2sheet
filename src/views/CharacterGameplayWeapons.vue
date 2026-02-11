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
const { character, weapons, weaponsLoading, weaponPerksLoading, actionResources, getFinalStat } =
	useCharacterData(props.characterId);
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
	return weapons.value.filter((weapon) => weapon.isEquipped);
});
</script>
<template>
	<div
		class="weapon-gameplay-block"
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
					<div class="range-controls">
						<span style="flex-grow: 1">Target Distance</span>
						<input
							type="number"
							style="width: 5em"
							v-model="actionResources.targetRange"
							value="0"
							min="0"
						/>
						<span>ft.</span>
					</div>
				</div>
			</div>
			<div
				class="gameplay-weapons"
				v-if="!weaponsLoading && !weaponPerksLoading"
			>
				<h2>Equipped Weapons</h2>
				<div
					v-if="equippedWeapons.length === 0"
					style="text-align: center"
				>
					<h1>No weapons equipped</h1>
				</div>
				<div
					v-else
					class="gameplay-weapons-list"
				>
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
<style>
.weapons-block {
	display: flex;
}
.range-controls {
	display: flex;
	align-items: center;
}
.gameplay-weapons-list {
	height: calc(100vh - 280px);
	overflow-y: scroll;
	scrollbar-width: none;
	font-size: 0.9rem;
}
.gameplay-weapons-list :first-child {
	margin-top: 0;
}
.gameplay-weapons-list :last-child {
	margin-bottom: 0;
}
</style>
