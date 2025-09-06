<script setup lang="ts">
import { computed } from 'vue';
import useCharacterData, {
	characterDataSources,
	type CharacterDataSource,
	type StatBoxInfo,
} from '@/composables/useCharacterData';
import LoadingModal from '@/components/LoadingModal.vue';
import StatBarsBox from '@/components/StatBarsBox.vue';

type CharacterProps = {
	characterId: string;
};
const props = defineProps<CharacterProps>();
const character = computed<CharacterDataSource | undefined>(
	() => characterDataSources[props.characterId],
);
const { getStats } = useCharacterData(props.characterId);
const { data: stats, isLoading: statsLoading, refresh: refreshStats } = getStats();
type BuffInfo = {
	name: string;
	type: BuffTypes;
	stacking: boolean;
	stackMax: number;
	description: string;
	effects: string;
	isActive: boolean;
	expectedResult: string;
};
type BuffTypes = 'Buff' | 'Debuff' | 'Story Buff';
const testBuffs: BuffInfo[] = [
	{
		name: 'Base Strength',
		type: 'Buff',
		stacking: false,
		stackMax: 0,
		description: 'Increases the base value of Strength by 5.',
		effects: '^str +5',
		isActive: false,
		expectedResult:
			'Strength: ' +
			stats.value.str.value +
			' => ' +
			(stats.value.str.value + 5) +
			'\nSomething that uses strength: ' +
			(stats.value.str.value + 8) +
			' => ' +
			(stats.value.str.value + 8 + 5),
	},
	{
		name: 'Surface Strength',
		type: 'Buff',
		stacking: false,
		stackMax: 0,
		description: 'Increases the base value of Strength by 2.',
		effects: 'str +2',
		isActive: false,
		expectedResult:
			'Strength: ' +
			stats.value.str.value +
			' => ' +
			(stats.value.str.value + 2) +
			'\nSomething that uses strength: ' +
			(stats.value.str.value + 8) +
			' => ' +
			(stats.value.str.value + 8),
	},
	{
		name: 'Multi-Buff',
		type: 'Debuff',
		stacking: false,
		stackMax: 0,
		description: 'Increases AC but reduces strength.',
		effects: '^str -4, ^ac +4',
		isActive: false,
		expectedResult:
			'Strength: ' +
			stats.value.str.value +
			' => ' +
			(stats.value.str.value - 4) +
			'\nAC: ' +
			stats.value.ac.value +
			' => ' +
			(stats.value.ac.value + 4),
	},
];
const buffedStatsGroup = <StatBoxInfo>{
	label: 'Buffed Stats',
	data: [
		{ label: 'Strength', value: stats.value.str.value },
		{ label: 'Strength-Dependent Stat', value: stats.value.str.value + 8 },
		{ label: 'AC', value: stats.value.ac.value },
	],
};
</script>
<template>
	<div>
		<div v-if="!character">
			<h1>Invalid character ID: {{ characterId }}</h1>
		</div>
		<div v-else-if="statsLoading">
			<LoadingModal />
		</div>
		<div
			v-else
			class="buff-test"
		>
			<div>Test buffs for {{ character.label }}</div>
			<div><button @click="refreshStats">Refresh Stats</button></div>
			<div
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
			</div>
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
