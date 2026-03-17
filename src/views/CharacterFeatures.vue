<script setup lang="ts">
import useCharacterData, { type CharacterNames } from '@/composables/useCharacterData';
import LoadingModal from '@/components/LoadingModal.vue';
import FeatureItem from '@/components/FeatureItem.vue';
import BGImage from '@/components/BGImage.vue';

type CharacterProps = {
	characterId: CharacterNames;
};
const props = defineProps<CharacterProps>();
const { statsBase, features, featuresLoading, featuresRefresh, buffsLoading } = useCharacterData(
	props.characterId,
);
</script>
<template>
	<div v-if="featuresLoading || buffsLoading">
		<LoadingModal />
	</div>
	<div v-else>
		<BGImage :bgName="statsBase.guardianClass" />
		<div>
			<button @click="featuresRefresh()">Reload Features</button>
		</div>
		<div class="features-list">
			<FeatureItem
				v-for="feature in features"
				:key="feature.name"
				v-bind="feature"
				:character-id="characterId"
			/>
		</div>
	</div>
</template>
<style>
.features-list {
	display: flex;
	flex-wrap: wrap;
}
.feature-effects {
	font-style: italic;
	padding: 0 1em;
	text-transform: capitalize;
}
.feature-group-label {
	text-transform: uppercase;
	padding-bottom: 0.5em;
}
</style>
