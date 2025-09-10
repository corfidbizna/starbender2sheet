<script setup lang="ts">
import { computed } from 'vue';
import useCharacterData, { type StatBoxInfo } from '@/composables/useCharacterData';
import LoadingModal from '@/components/LoadingModal.vue';
import StatBarsBox from '@/components/StatBarsBox.vue';
import useBuffs from '@/composables/useBuffs';
import BuffItemRow from '@/components/BuffItemRow.vue';

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
const { flatBuffArray, talliedBuffs } = useBuffs(stats, partyBuffs);

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
// const talliedBuffs2 = computed(() => {
// 	return tallyBuffs(flatBuffArray.value);
// });
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
			<BuffItemRow v-bind="partyBuffs[0]" />
			<div>Test buffs for {{ character.label }}</div>
			<h1>partyBuffs</h1>
			<pre>{{ partyBuffs }}</pre>
			<h1>flatBuffArray</h1>
			<pre>{{ flatBuffArray }}</pre>
			<h1>talliedBuffs</h1>
			<pre>{{ talliedBuffs }}</pre>
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
			<StatBarsBox v-bind="buffedStatsGroup" />
		</div>
	</div>
</template>
<style>
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
