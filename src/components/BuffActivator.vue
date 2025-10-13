<script setup lang="ts">
// import type { BuffInfo } from '@/business_logic/buffs';
import useCharacterData from '@/composables/useCharacterData';
import useFilter from '@/composables/useFilter';
import type { BuffInfo } from '@/business_logic/buffs';
import BuffItemRow from './BuffItemRow.vue';

type CharacterProps = {
	characterId: string;
};
const props = defineProps<CharacterProps>();

const { buffs } = useCharacterData(props.characterId);

const { queryValue, invertFilter, filteredData } = useFilter<BuffInfo, string>({
	listUnfiltered: buffs,
	filter: { dataType: 'string', fieldName: 'type' },
});
queryValue.value = 'Story';
invertFilter.value = false;
</script>
<template>
	<div class="buff-activator">
		<div class="buff-table">
			<h2>Story Buffs</h2>
			<BuffItemRow
				v-for="buff in filteredData.includes"
				:key="buff.name"
				v-bind="buff"
				:characterId="characterId"
			/>
		</div>
		<div class="buff-table">
			<h2>Other Buffs</h2>
			<BuffItemRow
				v-for="buff in filteredData.excludes"
				:key="buff.name"
				v-bind="buff"
				:characterId="characterId"
			/>
		</div>
	</div>
</template>
<style scoped>
.buff-activator {
	display: block;
	justify-content: center;
	display: block;
	text-align: center;
}
.buff-table {
	display: inline-block;
	vertical-align: top;
	margin: 1em;
}
</style>
