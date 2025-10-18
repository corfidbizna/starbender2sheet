<script setup lang="ts">
import ArmorItem from '@/components/ArmorItem.vue';
import LoadingModal from '@/components/LoadingModal.vue';
import type { CharacterNames } from '@/composables/useCharacterData';
import useCharacterData from '@/composables/useCharacterData';

const props = defineProps<{
	characterId: CharacterNames;
}>();
const { armor: armorList, armorLoading, armorRefresh } = useCharacterData(props.characterId);
</script>
<template>
	<h1>Armor for {{ props.characterId }}</h1>
	<button @click="armorRefresh">Refresh Armor</button>
	<div v-if="armorLoading">
		<LoadingModal />
	</div>
	<div v-else>
		<div class="armor-slots-active">
			<div class="armor-slot helmet"><h2>Full: 0/1</h2></div>
			<div class="armor-slot helmet"><h2>Helmet: 0/3</h2></div>
			<div class="armor-slot arm"><h2>Arm: 0/3</h2></div>
			<div class="armor-slot torso"><h2>Torso: 0/3</h2></div>
			<div class="armor-slot legs"><h2>Legs: 0/3</h2></div>
			<div class="armor-slot legs"><h2>Class: 0/1</h2></div>
			<div class="armor-slot legs"><h2>Exotic: 0/1</h2></div>
		</div>
		<div>
			<ArmorItem
				v-for="armor in armorList"
				:key="armor.name"
				v-bind="armor"
				:characterId="characterId"
			/>
		</div>
		<!-- <pre>{{ armor }}</pre> -->
	</div>
</template>
<style>
.armor-slots-active {
	display: flex;
	flex-direction: row;
	width: 100%;
}
.armor-slot {
	flex: 1 1 auto;
	margin: 1em;
	border: 2px solid #fff8;
	padding: 2em;
}
</style>
