<script setup lang="ts">
// Get the `StatsTableItem` type from the `useCharacterData` composable.
import { type StatsTableItem } from '@/composables/useCharacterData';

// Creates variables in this component that are named the same things as the
// properties of the imported `StatsTableItem` type.
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
