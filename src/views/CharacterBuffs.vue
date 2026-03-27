<script setup lang="ts">
import useCharacterData, { labelMap, type StatName } from '@/composables/useCharacterData';
import LoadingModal from '@/components/LoadingModal.vue';
import BuffActivator from '@/components/BuffActivator.vue';
import { computed } from 'vue';
import MakeBuffInterface from '@/components/MakeBuffInterface.vue';
import BGImage from '@/components/BGImage.vue';
import { fullListBuff } from '@/sharedState';

type CharacterProps = {
	characterId: string;
};
const props = defineProps<CharacterProps>();
const {
	character,
	stats,
	statsBuffed,
	statsLoading,
	buffs,
	activatedPartyBuffs,
	buffsLoading,
	buffsRefresh,
} = useCharacterData(props.characterId);

const buffTotals = computed<string>(() => {
	let result = '';
	const keys = Object.keys(statsBuffed.value);
	const disallowedLabels: StatName[] = [
		'armor',
		'armorNatural',
		'armorShield',
		'armorDeflection',
		'armorDodge',
		'drBase',
		'strScore',
		'dexScore',
		'conScore',
		'intScore',
		'wisScore',
		'chaScore',
		'babPerLevel',
		'bdbPerLevel',
		'fortPerLevel',
		'refPerLevel',
		'willPerLevel',
		'hpPerLevel',
	];
	const filtered = keys.filter((key) => {
		return disallowedLabels.indexOf(key as StatName) < 0;
	});
	filtered.forEach((keyy) => {
		const key = keyy as StatName;
		const diff = (statsBuffed.value[key as StatName]?.total || 0) - stats.value[key].total;
		if (diff !== 0) {
			result += labelMap[key as StatName] + (diff > 0 ? ' +' : ' ') + diff + ', ';
		}
	});
	return result;
});
const activeBuffNames = computed<string[]>(() => {
	const result = [];
	if (fullListBuff.value) {
		result.push(...activatedPartyBuffs.value.map((item) => item.name));
	} else {
		result.push(...buffs.value.filter((buff) => buff.isPassive).map((buff) => buff.name));
	}
	return result.sort();
});
</script>
<template>
	<div
		class="CharacterBuff"
		v-if="character"
	>
		<div v-if="statsLoading || buffsLoading">
			<LoadingModal />
		</div>
		<div
			v-else
			class="buff-test"
		>
			<BGImage :bgName="'Buffs'" />
			<div class="buff-list">
				<button @click="buffsRefresh">Refresh Buffs</button>
				<h2>Activated Buffs</h2>
				<div>{{ activeBuffNames.join('\n') }}</div>
				<h2>Stat Totals</h2>
				<div>{{ buffTotals.split(', ').join('\n') }}</div>
				<div
					v-if="fullListBuff"
					class="all-stats-list"
				>
					<h2>All Stats</h2>
					<div
						v-for="stat in Object.keys(statsBuffed)"
						:key="stat"
						class="all-stats-info"
					>
						<div>
							{{ statsBuffed[stat as StatName].total }} ⇒
							{{ labelMap[stat as StatName] }}
						</div>
						<div class="all-stats-info details">
							{{ statsBuffed[stat as StatName].summary.join('\n') }}
						</div>
					</div>
				</div>
			</div>
			<div style="margin-left: 17em">
				<MakeBuffInterface v-bind:character-id="characterId" />
				<BuffActivator
					:character-id="characterId"
					:condensed="false"
				/>
			</div>
		</div>
	</div>
</template>
<style>
.buff-test {
	display: flex;
}
.buff-list {
	display: flex;
	flex-direction: column;
	white-space: pre-line;
	width: 16em;
	flex: 0 0 auto;
	margin-right: 1em;
	height: var(--content-height);
	overflow-y: scroll;
	overflow-x: hidden;
	scrollbar-width: none;
	position: fixed;
}
.all-stats-list {
	font-size: 0.8em;
	white-space: pre;
}
.all-stats-info {
	margin-bottom: 0.25em;
}
.all-stats-info.details {
	margin-left: 1em;
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
