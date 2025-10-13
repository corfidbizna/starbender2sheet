<script setup lang="ts">
import useCharacterData, {
	labelMap,
	type StatsCalculatedKey,
} from '@/composables/useCharacterData';
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
	statsLoading,
	activatedPartyBuffs,
	buffsTallied,
	buffsLoading,
	buffsRefresh,
} = useCharacterData(props.characterId);

const buffTotals = computed<string>(() => {
	let result = '';
	const keys = Object.keys(buffsTallied.value);
	const disallowedLabels: StatsCalculatedKey[] = [
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
		return disallowedLabels.indexOf(key as StatsCalculatedKey) < 0;
	});
	filtered.forEach((keyy) => {
		const key = keyy as StatsCalculatedKey;
		const diff = (buffsTallied.value[key as StatsCalculatedKey]?.total || 0) - stats.value[key];
		if (diff !== 0) {
			result += labelMap[key as StatsCalculatedKey] + (diff > 0 ? ' +' : ' ') + diff + ', ';
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
			<div><button @click="buffsRefresh">Refresh Buffs</button></div>
			<table>
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
			</table>
			<BuffActivator :character-id="characterId" />
			<!-- <pre>activatedPartyBuffs: {{ activatedPartyBuffs }}</pre> -->
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
