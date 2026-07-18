<script setup lang="ts">
import BuffActivator from '@/components/BuffActivator.vue';
</script>
<template>
	<div class="buff-gameplay-block">
		<BuffActivator
			:condensed="true"
			class="gameplay-buffs-list"
		/>
	</div>
</template>
<style>
.gameplay-buffs-list {
	height: calc(100vh - 125px);
	overflow-y: scroll;
	scrollbar-width: none;
}
</style>
