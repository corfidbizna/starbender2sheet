<script setup lang="ts">
import { ref } from 'vue';
import usePlayerData, { type StatsTableData } from '@/composables/usePlayerData';

const props = defineProps<{
	playerId: string;
}>();
const { getStatsTable } = usePlayerData(props.playerId);
const data = ref<StatsTableData>();
getStatsTable().then((table) => (data.value = table));
</script>
<template>
	<div class="skills-table">
		<h1>Stats for player ID: {{ playerId }}</h1>
		<pre>{{ data }}</pre>
	</div>
</template>
<style scoped></style>
