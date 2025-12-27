<script setup lang="ts">
import type { CharacterNames, Armor } from '@/composables/useCharacterData';
import useCharacterData from '@/composables/useCharacterData';
import ArmorItem from '@/components/ArmorItem.vue';
import StatCapacityBox from '@/components/StatCapacityBox.vue';
import { computed } from 'vue';

type CharacterProps = {
	characterId: CharacterNames;
};
const props = defineProps<CharacterProps>();
const { character, armor, actionResources, getFinalStat } = useCharacterData(props.characterId);
const equippedArmor = computed<Armor[]>(() => armor.value.filter((armor) => armor.equipped));
</script>
<template>
	<div
		class="CharacterSkills"
		v-if="character"
	>
		<StatCapacityBox
			v-bind="{
				label: 'Armor Charges',
				data: [
					{
						label: 'Charges',
						stat: 'armorCharges',
						color: '#8df',
						max: getFinalStat('capacityArmorCharge'),
						current: actionResources.armorCharges,
					},
				],
				hideRefillAll: true,
			}"
			:characterId="characterId"
		/>
		<h2>Equipped Armor</h2>
		<div v-if="equippedArmor.length === 0">
			<h1 style="text-align: center">No armor equipped</h1>
		</div>
		<div v-else>
			<div>
				Note: unequipping armor from here will remove the armor entirely. Be careful where
				you click!
			</div>
			<ArmorItem
				v-for="armor in equippedArmor"
				:key="armor.name"
				v-bind="armor"
				:characterId="characterId"
			/>
		</div>
	</div>
</template>
