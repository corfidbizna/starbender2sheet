<script setup lang="ts">
import type { BuffInfo } from '@/business_logic/buffs';

const props = defineProps<BuffInfo>();
</script>
<template>
	<div class="buff-block">
		<h1>{{ props.name }}</h1>
		<h2>{{ props.type }}</h2>
		<div>{{ props.description }}</div>
	</div>
</template>
<style scoped>
.buff-block {
	display: block;
	padding: 0.5em;
	background-color: #4444;
	margin: 1em;
	border-radius: 0.25em;
}
h1 {
	font-size: 1.5em;
	margin: 0;
}
</style>
