<script setup lang="ts">
import { type StatsTableItem } from '@/composables/usePlayerData';

defineProps<StatsTableItem>();
</script>
<template>
	<tr>
		<td>{{ Bonus }}</td>
		<td>{{ Name }}</td>
		<td>{{ Score }}</td>
		<td>{{ Focused }}</td>
		<td>{{ Notes }}</td>
	</tr>
</template>
<style scoped></style>
