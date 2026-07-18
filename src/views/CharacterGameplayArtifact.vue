<script setup lang="ts">
import DBox from '@/components/DBox.vue';
import type { ArtifactMod } from '@/composables/useCharacterData';
import useCharacterData from '@/composables/useCharacterData';
import { computed } from 'vue';

const { artifactMods, namesOfActiveArtifactMods, artifactLoading } = useCharacterData();
const artifactList = computed<ArtifactMod[]>(() => {
	return artifactMods.value.filter((mod) => namesOfActiveArtifactMods.value.includes(mod.name));
});
</script>
<template>
	<div
		class="artifact-gameplay-block"
		v-if="!artifactLoading"
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
			<DBox v-bind="{ title: mod.name, rarity: '', subtitle: '' }">
				<template #contents>
					<div>
						{{ mod.description }}
					</div>
				</template>
			</DBox>
		</div>
	</div>
	<div v-else><h1>Loading seasonal artifact…</h1></div>
</template>
<style>
.artifact-gameplay-block {
	height: calc(100vh - 125px);
	overflow-y: scroll;
	scrollbar-width: none;
	font-size: 0.9rem;
}
</style>
