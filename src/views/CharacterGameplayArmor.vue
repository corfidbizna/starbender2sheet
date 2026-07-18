<script setup lang="ts">
import type { Armor } from '@/composables/useCharacterData';
import useCharacterData from '@/composables/useCharacterData';
import ArmorItem from '@/components/ArmorItem.vue';
// import StatCapacityBox from '@/components/StatCapacityBox.vue';
import { computed } from 'vue';

const { armor } = useCharacterData();
const equippedArmor = computed<Armor[]>(() => armor.value.filter((armor) => armor.equipped));
</script>
<template>
	<div class="armor-gameplay-block">
		<h2>Equipped Armor</h2>
		<div v-if="equippedArmor.length === 0">
			<h1 style="text-align: center">No armor equipped</h1>
		</div>
		<div
			v-else
			class="gameplay-armor-list"
		>
			<ArmorItem
				class="armor-equipped"
				v-for="armor in equippedArmor"
				:key="armor.name"
				v-bind="armor"
			/>
		</div>
	</div>
</template>
<style>
.gameplay-armor-list {
	height: calc(100vh - 173px);
	overflow-y: scroll;
	scrollbar-width: thin;
	font-size: 0.9rem;
}
</style>
