<script setup lang="ts">
import { type StatsTableItem } from '@/composables/usePlayerData';

defineProps<StatsTableItem>();
</script>
<template>
	<tr>
		<td class="bonus">{{ Bonus }}</td>
		<td>{{ Name }}</td>
		<td>{{ Score }}</td>
		<td>{{ Focused }}</td>
		<td>{{ Notes }}</td>
	</tr>
</template>
<style scoped>
.bonus {
	max-width: 1rem;
	font-weight: 800;
	text-align: right;
	padding-right: 1em;
}
</style>
