<script setup lang="ts">
import useCharacterData, {
	type CharacterNames,
	type Feature,
} from '@/composables/useCharacterData';
import LoadingModal from '@/components/LoadingModal.vue';
import FeatureItem from '@/components/FeatureItem.vue';
import BGImage from '@/components/BGImage.vue';
import { fullListFeature } from '@/sharedState';
import { computed } from 'vue';

type CharacterProps = {
	characterId: CharacterNames;
};
const props = defineProps<CharacterProps>();
const { statsBase, features, featuresLoading, featuresRefresh, buffsLoading } = useCharacterData(
	props.characterId,
);

const featureList = computed<Feature[]>(() => {
	if (fullListFeature.value) {
		return features.value;
	} else {
		return features.value.filter((feature) => !feature.unlisted);
	}
});
const scrollTo = (id: string) => {
	const element = document.getElementById(id);
	if (element) {
		element.scrollIntoView({ behavior: 'smooth' });
	}
};
</script>
<template>
	<div v-if="featuresLoading || buffsLoading">
		<LoadingModal />
	</div>
	<div
		v-else
		style="background-image: linear-gradient(90deg, #0004 0, transparent 15em)"
	>
		<BGImage :bgNames="[statsBase.guardianClass]" />
		<div class="features-config">
			<button @click="featuresRefresh()">Reload Features</button>
			<h2>Scroll to</h2>
			<button
				v-for="feat in featureList"
				:key="feat.name"
				@click="scrollTo(feat.name)"
				style="text-align: left"
			>
				{{ feat.name }}
			</button>
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
.features-config {
	position: absolute;
	width: 18em;
	display: flex;
	flex-direction: column;
	height: var(--content-height);
	overflow-y: scroll;
	scrollbar-width: none;
}
.features-list {
	margin-left: 19em;
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
