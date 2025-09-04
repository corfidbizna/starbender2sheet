<script setup lang="ts">
import { computed } from 'vue';
import { type CharacterDataSource, characterDataSources } from '@/composables/useCharacterData';
import StatBarsBox, { type StatBoxInfo } from '@/components/StatBarsBox.vue';
type CharacterProps = {
	characterId: string;
};
const props = defineProps<CharacterProps>();
const character = computed<CharacterDataSource | undefined>(
	() => characterDataSources[props.characterId],
);
const testStatInfo = <StatBoxInfo>{
	label: 'Ability Scores',
	data: [
		{ label: 'Strength', value: 6 },
		{ label: 'Dexterity', value: 10 },
		{ label: 'Constitution', value: 7 },
		{ label: 'Intelligence', value: 1 },
		{ label: 'Will', value: 0 },
		{ label: 'Charisma', value: 4 },
	],
};
const testSavesInfo = <StatBoxInfo>{
	label: 'Saving Throws',
	data: [
		{ label: 'Fortitude', value: 10 },
		{ label: 'Reflex', value: 13 },
		{ label: 'Will', value: 2 },
	],
};
const testActionsInfo = <StatBoxInfo>{
	label: 'Actions',
	data: [
		{ label: 'Movement', value: 2 },
		{ label: 'Attack', value: 2 },
		{ label: 'Reflex', value: 1 },
	],
};
const testAmmoInfo = <StatBoxInfo>{
	label: 'Ammo',
	data: [
		{ label: 'Kinetic Ammo', value: 0 },
		{ label: 'Energy Ammo', value: 19 },
		{ label: 'Heavy Ammo', value: 8 },
	],
};
const testEnergyInfo = <StatBoxInfo>{
	label: 'Energy',
	data: [
		{ label: 'Super Energy', value: 45 },
		{ label: 'Class Energy', value: 7 },
		{ label: 'Melee Energy', value: 14 },
		{ label: 'Grenade Energy', value: 14 },
		{ label: 'Universal Energy', value: 42 },
		{ label: 'Rerolls', value: 3 },
	],
};
</script>
<template>
	<div>
		<div v-if="!character">
			<h1>Invalid character ID: {{ characterId }}</h1>
		</div>
		<div v-else>
			<h1>Gameplay for {{ character.label }}</h1>
			<div class="stat-column-a">
				<div><StatBarsBox v-bind="testStatInfo" /></div>
				<div><StatBarsBox v-bind="testSavesInfo" /></div>
			</div>
			<div class="stat-column-b">
				<div><StatBarsBox v-bind="testActionsInfo" /></div>
				<h2>Derived Information</h2>
				<div>Movement per move: 30ft.</div>
				<div>Reach: 5ft.</div>
				<div>Size: Medium</div>
				<div>Carrying Capacity: 660lbs.</div>
			</div>
			<div class="stat-column-c">
				<div><StatBarsBox v-bind="testAmmoInfo" /></div>
				<div><StatBarsBox v-bind="testEnergyInfo" /></div>
			</div>
		</div>
	</div>
</template>
<style>
.stat-column-a,
.stat-column-b,
.stat-column-c {
	width: 20%;
	display: inline-block;
	vertical-align: top;
}
.stat-column-c {
	width: 25%;
}
</style>
