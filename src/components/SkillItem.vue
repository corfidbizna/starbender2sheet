<script setup lang="ts">
import { type StatsTableItem } from '@/composables/usePlayerData';

const props = defineProps<StatsTableItem>();
</script>
<template>
	<div class="skill">
		<pre>{{ props }}</pre>
	</div>
</template>
<style scoped></style>
