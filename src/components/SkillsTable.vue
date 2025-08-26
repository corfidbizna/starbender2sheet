<script setup lang="ts">
import { ref } from 'vue';
import usePlayerData, { type StatsTableItem } from '@/composables/usePlayerData';
import SkillItem from './SkillItem.vue';

const props = defineProps<{
	playerId: string;
}>();
const { getStatsTable } = usePlayerData(props.playerId);
const data = ref<StatsTableItem[]>([]);
getStatsTable().then((table) => (data.value = table));
</script>
<template>
	<div class="skills-table">
		<h1>Stats for player ID: {{ playerId }}</h1>
		<div class="scroll-box">
			<p>One skill:</p>
			<SkillItem
				v-if="data[0]"
				v-bind="data[0]"
			/>
			<p>All skills</p>
			<pre>{{ data }}</pre>
		</div>
	</div>
</template>
<style scoped>
.scroll-box {
	max-height: 200px;
	width: 100%;
	overflow-y: scroll;
}
</style>
