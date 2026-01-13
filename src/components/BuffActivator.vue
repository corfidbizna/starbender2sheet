<script setup lang="ts">
import type { BuffInfo } from '@/business_logic/buffs';
import useCharacterData from '@/composables/useCharacterData';
// import useFilter from '@/composables/useFilter';
import BuffItemRow from './BuffItemRow.vue';
import { computed } from 'vue';

type CharacterProps = {
	characterId: string;
	condensed: boolean;
};
const props = defineProps<CharacterProps>();

const { buffs } = useCharacterData(props.characterId);

const storyBuffs = computed<BuffInfo[]>(() => buffs.value.filter((buff) => buff.isStory));
const otherBuffs = computed<BuffInfo[]>(() =>
	buffs.value.filter((buff) => !buff.isStory && buff.type !== 'Hidden'),
);
const activeBuffs = computed<BuffInfo[]>(() => [
	...storyBuffs.value.filter((buff) => buff.active),
	...otherBuffs.value.filter((buff) => buff.active),
]);
// const activeBuffs = computed<BuffInfo[]>(() => {
// 	return otherBuffs.value.filter((buff) => buff.active);
// });
// const inactiveBuffs = computed<BuffInfo[]>(() => {
// 	return otherBuffs.value.filter((buff) => !buff.active);
// });
// const { queryValue, invertFilter, filteredData } = useFilter<BuffInfo, string>({
// 	listUnfiltered: otherBuffs,
// 	filter: { dataType: 'boolean', fieldName: 'active' },
// });
// queryValue.value = 'true';
// invertFilter.value = false;
</script>
<template>
	<div class="buff-activator">
		<div
			class="buff-table"
			v-if="storyBuffs.length > 0"
		>
			<h2>Story Buffs</h2>
			<BuffItemRow
				v-for="buff in storyBuffs"
				:key="buff.name"
				v-bind="buff"
				:characterId="characterId"
				:condensed="props.condensed"
			/>
			<h2>Active Buffs</h2>
			<BuffItemRow
				v-for="buff in activeBuffs"
				:key="buff.name"
				v-bind="buff"
				:characterId="characterId"
				:condensed="props.condensed"
			/>
		</div>
		<div class="buff-table">
			<h2>Other Buffs</h2>
			<BuffItemRow
				v-for="buff in otherBuffs"
				:key="buff.name"
				v-bind="buff"
				:characterId="characterId"
				:condensed="props.condensed"
			/>
		</div>
	</div>
</template>
<style scoped>
.buff-activator {
	display: block;
	text-align: center;
}
.buff-table {
	display: inline-block;
	vertical-align: top;
	width: 450px;
	margin: 0 0.2em;
}
</style>
