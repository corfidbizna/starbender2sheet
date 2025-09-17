<script setup lang="ts">
import { computed } from 'vue';
import useCharacterData, {
	type StatBoxInfo,
	type StatBoxField,
	makeComputedOfStats,
} from '@/composables/useCharacterData';
import StatBarsBox from '@/components/StatBarsBox.vue';
import LoadingModal from '@/components/LoadingModal.vue';
type CharacterProps = {
	characterId: string;
};
const props = defineProps<CharacterProps>();

const {
	character,
	stats,
	buffsTallied,
	statsLoading,
	statsRefresh,
	skills,
	skillsLoading,
	skillsRefresh,
} = useCharacterData(props.characterId);

const statInfo = computed<StatBoxInfo>(
	makeComputedOfStats(stats, buffsTallied, 'Ability Scores', [
		'str',
		'dex',
		'con',
		'int',
		'wis',
		'cha',
	]),
);
// const statInfo = computed<StatBoxInfo>(

// );
const savesInfo = computed<StatBoxInfo>(
	makeComputedOfStats(stats, buffsTallied, 'Saving Throws', ['fort', 'ref', 'wil']),
);
const actionsInfo = computed<StatBoxInfo>(
	makeComputedOfStats(stats, buffsTallied, 'Action', [
		'actionMoves',
		'actionAttacks',
		'actionReactions',
	]),
);
const energyInfo = computed<StatBoxInfo>(
	makeComputedOfStats(stats, buffsTallied, 'Energy', [
		'eSuper',
		'eClass',
		'eMelee',
		'eGrenade',
		'eUniversal',
	]),
);
const skillsInfo = computed<StatBoxInfo>(() => {
	const fieldArray = <StatBoxField[]>[];
	skills.value.forEach((skill) => {
		fieldArray.push({ label: skill.Name, value: skill.Bonus });
	});
	return {
		label: 'Skills',
		data: fieldArray,
	};
});
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
	<div
		class="CharacterGameplay"
		v-if="character"
	>
		<div v-if="statsLoading || skillsLoading">
			<LoadingModal />
		</div>
		<div v-else>
			<h1>Gameplay for {{ character.label }}</h1>
			<p>
				<button
					@click="
						statsRefresh();
						skillsRefresh();
					"
				>
					Refresh Info
				</button>
			</p>
			<div class="stat-column-a">
				<div><StatBarsBox v-bind="statInfo" /></div>
				<div><StatBarsBox v-bind="savesInfo" /></div>
			</div>
			<div class="stat-column-b">
				<div><StatBarsBox v-bind="actionsInfo" /></div>
				<h2>Derived Information</h2>
				<div>Movement per move: {{ stats.moveDist }} ft.</div>
				<div>Reach: {{ stats.reach }} ft.</div>
				<div>Size: Medium</div>
				<div>Carrying Capacity: {{ stats.weightCapacity }} lbs.</div>
			</div>
			<div class="stat-column-c">
				<div><StatBarsBox v-bind="testAmmoInfo" /></div>
				<div><StatBarsBox v-bind="energyInfo" /></div>
			</div>
			<div style="height: 10em; width: 30em"><StatBarsBox v-bind="skillsInfo" /></div>
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
