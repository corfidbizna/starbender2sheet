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
const { character, armor } = useCharacterData(props.characterId);
const equippedArmor = computed<Armor[]>(() => armor.value.filter((armor) => armor.equipped));
</script>
<template>
	<div
		class="CharacterSkills"
		v-if="character"
	>
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
