<script setup lang="ts">
import { computed } from 'vue';
import useCharacterData, { type StatBoxInfo } from '@/composables/useCharacterData';
import LoadingModal from '@/components/LoadingModal.vue';
import StatBarsBox from '@/components/StatBarsBox.vue';
// import type { BuffInfo } from '@/business_logic/buffs';

type CharacterProps = {
	characterId: string;
};
const props = defineProps<CharacterProps>();
const { character, getStats, getPartyBuffs } = useCharacterData(props.characterId);
const { data: stats, isLoading: statsLoading, refresh: refreshStats } = getStats();
const {
	data: partyBuffs,
	isLoading: partyBuffsLoading,
	refresh: refreshPartyBuffs,
} = getPartyBuffs();

// const testBuffs: BuffInfo[] = [
// 	{
// 		name: 'Base Strength',
// 		type: 'Buff',
// 		isStacking: false,
// 		stackMax: 0,
// 		stacks: 0,
// 		description: 'Increases the base value of Strength by 5.',
// 		effects: '^str +5',
// 		expectedResult:
// 			'Strength: ' +
// 			stats.value.str.value +
// 			' => ' +
// 			(stats.value.str.value + 5) +
// 			'\nSomething that uses strength: ' +
// 			(stats.value.str.value + 8) +
// 			' => ' +
// 			(stats.value.str.value + 8 + 5),
// 	},
// 	{
// 		name: 'Surface Strength',
// 		type: 'Buff',
// 		stacking: false,
// 		stackMax: 0,
// 		stacks: 0,
// 		description: 'Increases the base value of Strength by 2.',
// 		effects: 'str +2',
// 		isActive: false,
// 		expectedResult:
// 			'Strength: ' +
// 			stats.value.str.value +
// 			' => ' +
// 			(stats.value.str.value + 2) +
// 			'\nSomething that uses strength: ' +
// 			(stats.value.str.value + 8) +
// 			' => ' +
// 			(stats.value.str.value + 8),
// 	},
// 	{
// 		name: 'Multi-Buff',
// 		type: 'Debuff',
// 		stacking: false,
// 		stackMax: 0,
// 		stacks: 0,
// 		description: 'Increases AC but reduces strength.',
// 		effects: '^str -4, ^ac +4',
// 		isActive: false,
// 		expectedResult:
// 			'Strength: ' +
// 			stats.value.str.value +
// 			' => ' +
// 			(stats.value.str.value - 4) +
// 			'\nAC: ' +
// 			stats.value.ac.value +
// 			' => ' +
// 			(stats.value.ac.value + 4),
// 	},
// 	// {
// 	// 	name: 'Stacking Buff',
// 	// 	type: 'Buff',
// 	// 	stacking: true,
// 	// 	stackMax: 10,
// 	// 	stacks: 0,
// 	// 	description: 'Increases constitution by 1 per stack.',
// 	// 	effects: 'con +1*stacks',
// 	// 	isActive: false,
// 	// 	expectedResult:
// 	// 		'Constitution: ' +
// 	// 		stats.value.con.value +
// 	// 		' => ' +
// 	// 		(stats.value.con.value + 1 * stacks),
// 	// },
// ];
const buffedStatsGroup = computed<StatBoxInfo>(() => {
	const data = stats.value;
	return {
		label: 'Buffed Stats',
		data: [
			{ label: 'Strength', value: data.str },
			{ label: 'Strength-Dependent Stat', value: data.str + 8 },
			{ label: 'AC', value: data.ac },
			{ label: 'Constitution', value: data.con },
		],
	};
});
</script>
<template>
	<div
		class="CharacterBuff"
		v-if="character"
	>
		<div v-if="statsLoading || partyBuffsLoading">
			<LoadingModal />
		</div>
		<div
			v-else
			class="buff-test"
		>
			<div>Test buffs for {{ character.label }}</div>
			<h1>stats</h1>
			<pre>{{ stats }}</pre>
			<h1>partyBuffs</h1>
			<pre>{{ partyBuffs }}</pre>
			<div>
				<button
					@click="
						refreshStats();
						refreshPartyBuffs();
					"
				>
					Refresh Bufs & Stats
				</button>
			</div>
			<!-- <div
				class="buff-block"
				v-for="buff in testBuffs"
				:key="buff.name"
			>
				<div class="buff-box">
					<input type="checkbox" />
					<div class="buff-contents">
						<p>{{ buff.name }}: {{ buff.description }}</p>
						<pre>{{ buff.effects }}</pre>
						<h2></h2>
						<pre>{{ buff.expectedResult }}</pre>
					</div>
				</div>
			</div> -->
			<StatBarsBox v-bind="buffedStatsGroup" />
		</div>
	</div>
</template>
<style>
.buff-block {
	display: block;
	background-color: #4444;
	margin: 1em;
	border-radius: 0.25em;
}
.buff-box input {
	vertical-align: top;
}
.buff-contents {
	display: inline-block;
}
.buff-block pre,
.buff-block p {
	display: block;
	margin: 0.25em;
}
</style>
