<script setup lang="ts">
import { computed } from 'vue';
import QuestBox from '@/components/QuestBox.vue';
import useCharacterData, { type Quest } from '@/composables/useCharacterData';
import LoadingModal from '@/components/LoadingModal.vue';
type CharacterProps = {
	characterId: string;
};
const props = defineProps<CharacterProps>();
const { quests: allQuests, questsLoading, questsRefresh } = useCharacterData(props.characterId);
const quests = computed<Quest[]>(() => {
	return allQuests.value.filter((quest) => {
		return quest.isMajor;
	});
});
const bounties = computed<Quest[]>(() => {
	return allQuests.value.filter((quest) => {
		return !quest.isMajor;
	});
});
</script>
<template>
	<div v-if="questsLoading">
		<LoadingModal />
	</div>
	<div v-else>
		<h1>Quest List</h1>
		<button @click="questsRefresh()">Refresh quests</button>
		<div class="quest-list">
			<div class="column-a">
				<h2>Quests</h2>
				<QuestBox
					v-for="quest in quests"
					:key="quest.name"
					v-bind="quest"
				/>
			</div>
			<div class="column-b">
				<h2>Bounties</h2>
				<QuestBox
					v-for="quest in bounties"
					:key="quest.name"
					v-bind="quest"
				/>
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
