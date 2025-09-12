<script setup lang="ts">
import type { BuffInfo } from '@/business_logic/buffs';
import { computed } from 'vue';

const props = defineProps<BuffInfo>();
const imageSrc = computed<string>(() => {
	if (props.type === 'Buff') {
		return 'buff_up.png';
	} else if (props.type === 'Debuff') {
		return 'buff_down.png';
	}
	return 'buff_story.png';
});
</script>
<template>
	<div class="buff-block">
		<label>
			<input type="checkbox" />
			<span>
				<image :src="imageSrc"></image>
				<h1>{{ props.name }}</h1>
				<h2>{{ props.type }}</h2>
			</span>
		</label>
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
	display: inline;
}
</style>
