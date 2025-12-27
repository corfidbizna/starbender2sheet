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
		<div class="quest-list">
			<button
				@click="questsRefresh()"
				class="refresh-data"
			>
				Refresh quests
			</button>
			<div class="column-a">
				<h2>Quests</h2>
				<div class="scrollable">
					<QuestBox
						v-for="quest in quests"
						:key="quest.name"
						v-bind="quest"
					/>
				</div>
			</div>
			<div class="column-b">
				<h2>Bounties</h2>
				<QuestBox v-bind="bounties[0]" />
				<div class="scrollable">
					<QuestBox
						v-for="quest in bounties"
						:key="quest.name"
						v-bind="quest"
					/>
				</div>
			</div>
		</div>
	</div>
</template>
<style>
.refresh-data {
	position: absolute;
	top: 76px;
	left: 8px;
}
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
	height: calc(100vh - 140px);
}
/* .column-a .box {
	height: 120px;
}
.column-a img {
	width: 117px;
	height: 117px;
}
.column-b {
	width: 448px;
}
.column-b img {
	width: 64px;
	height: 64px;
} */
.quest-list .scrollable {
	overflow-y: scroll;
	height: 100%;
}
</style>
