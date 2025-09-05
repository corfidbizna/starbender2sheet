<script setup lang="ts">
import QuestBox from '@/components/QuestBox.vue';
</script>
<template>
	<div>
		<h1>Quest List</h1>
		<div class="quest-list">
			<div class="column-a">
				<h2>Quests</h2>
				<QuestBox />
				<QuestBox />
			</div>
			<div class="column-b">
				<h2>Bounties</h2>
				<QuestBox />
			</div>
		</div>
	</div>
</template>
<style>
.quest-list {
	justify-content: center;
	display: block;
	text-align: center;
}
.column-a,
.column-b {
	width: 548px;
	display: inline-block;
	vertical-align: top;
	margin: 1em;
}
</style>
