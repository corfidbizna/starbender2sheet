<script setup lang="ts">
import type { ArtifactMod, CharacterNames } from '@/composables/useCharacterData';
import useCharacterData from '@/composables/useCharacterData';
import { computed } from 'vue';

type CharacterProps = {
	characterId: CharacterNames;
};
const props = defineProps<CharacterProps>();
const { character, artifactMods, namesOfActiveArtifactMods, artifactLoading } = useCharacterData(
	props.characterId,
);
const artifactList = computed<ArtifactMod[]>(() => {
	return artifactMods.value.filter((mod) => namesOfActiveArtifactMods.value.includes(mod.name));
});
</script>
<template>
	<div
		class="gameplay-artifact-list"
		v-if="character && !artifactLoading"
	>
		<div
			v-if="artifactList.length === 0"
			style="text-align: center"
		>
			<h1>No artifact mods selected</h1>
		</div>
		<div
			v-else
			v-for="mod in artifactList"
			:key="mod.name"
		>
			<h2>{{ mod.name }}</h2>
			<div>{{ mod.description }}</div>
		</div>
	</div>
	<div v-else><h1>Loading seasonal artifact…</h1></div>
</template>
<style>
.gameplay-artifact-list {
	height: calc(100vh - 125px);
	overflow-y: scroll;
	scrollbar-width: none;
}
</style>
