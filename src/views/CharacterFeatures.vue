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
		<BGImage :bgName="statsBase.guardianClass" />
		<div class="features-config">
			<button @click="featuresRefresh()">Reload Features</button>
			<h2>Scroll to</h2>
			<button
				v-for="feat in features"
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
