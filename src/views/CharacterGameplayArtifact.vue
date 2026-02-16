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
		class="artifact-gameplay-block"
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
			<details class="gameplay-mod">
				<summary>
					{{ mod.name }}
				</summary>
				<div>{{ mod.description }}</div>
			</details>
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
.gameplay-mod summary {
	text-transform: uppercase;
	border-bottom: 2px solid #fff8;
	padding: 0.25em 0;
	margin: 0.25em;
}
</style>
