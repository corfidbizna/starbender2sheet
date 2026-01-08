<script setup lang="ts">
// todo: dynamically generate this icon array with every icon combination
const icons = ['Element_Arc_Buff.svg', 'Element_Arc_Debuff.svg', 'Element_Solar_Debuff.svg'];
</script>
<template>
	<div>
		<img
			v-for="icon in icons"
			:key="icon"
			:src="'./buff_icons/' + icon"
			style="width: 100px"
		/>
	</div>
</template>
