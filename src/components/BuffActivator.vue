<script setup lang="ts">
// import type { BuffInfo } from '@/business_logic/buffs';
import useCharacterData from '@/composables/useCharacterData';
import BuffItemRow from './BuffItemRow.vue';

type CharacterProps = {
	characterId: string;
};
const props = defineProps<CharacterProps>();

const { buffs } = useCharacterData(props.characterId);
</script>
<template>
	<div class="buff-activator">
		<div class="buff-table">
			<BuffItemRow
				v-for="buff in buffs"
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
}
.buff-table {
	display: block;
	border: 2px solid #fff4;
}
</style>
