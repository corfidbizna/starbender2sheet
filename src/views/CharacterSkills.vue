<script setup lang="ts">
import SkillsTable from '@/components/SkillsTable.vue';
import BGImage from '@/components/BGImage.vue';
</script>
<template>
	<div class="CharacterSkills">
		<BGImage :bgNames="['Skills']" />
		<SkillsTable></SkillsTable>
	</div>
</template>
