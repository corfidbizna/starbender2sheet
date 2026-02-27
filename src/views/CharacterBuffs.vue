<script setup lang="ts">
import useCharacterData, { labelMap, type StatName } from '@/composables/useCharacterData';
import LoadingModal from '@/components/LoadingModal.vue';
import BuffActivator from '@/components/BuffActivator.vue';
import { computed } from 'vue';

type CharacterProps = {
	characterId: string;
};
const props = defineProps<CharacterProps>();
const {
	character,
	stats,
	statsBuffed,
	statsLoading,
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
const activeBuffNames = computed<string>(() => {
	const passiveBuffNames = activatedPartyBuffs.value.map((item) => {
		return item.name;
	});
	const allNames = [...passiveBuffNames];
	return allNames.sort().join(', ');
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
			<div class="buff-list">
				<div><button @click="buffsRefresh">Refresh Buffs</button></div>
				<h2>Activated Buffs</h2>
				<div>{{ activeBuffNames.split(', ').join('\n') }}</div>
				<h2>Stat Totals</h2>
				<div>{{ buffTotals.split(', ').join('\n') }}</div>
				<h2>Buffable Stat List</h2>
				<div>{{ Object.values(labelMap).join('\n') }}</div>
			</div>
			<!-- <table>
				<tbody>
					<tr>
						<td>Names of Activated Buffs:</td>
						<td>{{ activeBuffNames }}</td>
					</tr>
					<tr>
						<td>Active Buff Effects (all):</td>
						<td>{{ buffTotals }}</td>
					</tr>
				</tbody>
			</table> -->
			<BuffActivator
				:character-id="characterId"
				:condensed="false"
			/>
			<!-- <pre>activatedPartyBuffs: {{ activatedPartyBuffs }}</pre> -->
		</div>
	</div>
</template>
<style>
.buff-test {
	display: flex;
}
.buff-list {
	white-space: pre-line;
	width: 16em;
	flex: 0 0 auto;
	margin-right: 1em;
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
