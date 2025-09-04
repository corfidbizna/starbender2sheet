<script setup lang="ts">
import { computed } from 'vue';
import useCharacterData, {
	type CharacterDataSource,
	type CharacterStat,
	type CharacterStatKey,
	characterDataSources,
} from '@/composables/useCharacterData';
import StatBarsBox, { type StatBoxInfo } from '@/components/StatBarsBox.vue';
type CharacterProps = {
	characterId: string;
};
const props = defineProps<CharacterProps>();
const character = computed<CharacterDataSource | undefined>(
	() => characterDataSources[props.characterId],
);
const { getStats } = useCharacterData(props.characterId);
const { data: stats, isLoading: statsLoading, refresh: refreshStats } = getStats();

const makeComputedOfStats = (label: string, keys: CharacterStatKey[]): (() => StatBoxInfo) => {
	return (): StatBoxInfo => {
		const statsValue = stats.value;
		return {
			label,
			data: keys.map((key) => statsValue[key] as CharacterStat<number>),
		};
	};
};
const statInfo = computed<StatBoxInfo>(
	makeComputedOfStats('Ability Scores', ['str', 'dex', 'con', 'int', 'wil', 'cha']),
);
const savesInfo = computed<StatBoxInfo>(
	makeComputedOfStats('Saving Throws', ['fort', 'ref', 'wil']),
);
const actionsInfo = computed<StatBoxInfo>(
	makeComputedOfStats('Action', ['actionMoves', 'actionAttacks', 'actionReactions']),
);
const energyInfo = computed<StatBoxInfo>(
	makeComputedOfStats('Energy', ['eSuper', 'eClass', 'eMelee', 'eGrenade', 'eUniversal']),
);
const testAmmoInfo = <StatBoxInfo>{
	label: 'Ammo',
	data: [
		{ label: 'Kinetic Ammo', value: 0 },
		{ label: 'Energy Ammo', value: 19 },
		{ label: 'Heavy Ammo', value: 8 },
	],
};
</script>
<template>
	<div>
		<div v-if="!character">
			<h1>Invalid character ID: {{ characterId }}</h1>
		</div>
		<div v-else-if="statsLoading">
			<h1>Loafing</h1>
		</div>
		<div v-else>
			<h1>Gameplay for {{ character.label }}</h1>
			<p><button @click="refreshStats">Refresh Stats</button></p>
			<div class="stat-column-a">
				<div><StatBarsBox v-bind="statInfo" /></div>
				<div><StatBarsBox v-bind="savesInfo" /></div>
			</div>
			<div class="stat-column-b">
				<div><StatBarsBox v-bind="actionsInfo" /></div>
				<h2>Derived Information</h2>
				<div>Movement per move: 30ft.</div>
				<div>Reach: 5ft.</div>
				<div>Size: Medium</div>
				<div>Carrying Capacity: 660lbs.</div>
			</div>
			<div class="stat-column-c">
				<div><StatBarsBox v-bind="testAmmoInfo" /></div>
				<div><StatBarsBox v-bind="energyInfo" /></div>
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
