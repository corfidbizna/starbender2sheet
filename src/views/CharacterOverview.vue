<script setup lang="ts">
import { computed, onBeforeUnmount, provide } from 'vue';
import router from '@/router/index.ts';
import useCharacterData, {
	characterDataSources,
	type CharacterNames,
} from '@/composables/useCharacterData';
import {
	bgColor,
	banner,
	subtabNameGameplay,
	subtabNameLoadout,
	characterName,
} from '@/sharedState';
import LoadingModal from '@/components/LoadingModal.vue';
type CharacterProps = {
	characterId: CharacterNames;
};
const props = defineProps<CharacterProps>();
/*
^^ You always need to do this step if you're using the props as an input.
Equivalent to this in Typescript:
defineProps<{
	characterId: string;
}>();
Also equivelant to the JS flavor:
defineProps({
	characterId: String, // <- note that this is the JS string class
})
*/
provide('character', props.characterId);
characterName.value = props.characterId;
console.log(props.characterId);
const characterLabel = computed<string>(() => characterDataSources[props.characterId].label);
const { armorLoading, buffsLoading, statsLoading, weaponsLoading } = useCharacterData();
const isLoading = computed(() => {
	return armorLoading.value || buffsLoading.value || statsLoading.value || weaponsLoading.value;
});

const names = computed<string[]>(() => [
	subtabNameGameplay.value,
	// 'characterSkills',
	'characterBuffs',
	subtabNameLoadout.value,
	'characterFeatures',
	'seasonalArtifact',
	'questList',
	'characterLore',
	'settings',
]);
const routeList = computed(() => names.value.map((name) => ({ name })));
const keyHandler = (e: KeyboardEvent) => {
	if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
		const currentRouteName = router.currentRoute.value.name as string;
		const currentRouteIndex = names.value.indexOf(currentRouteName);
		// const direction = e.key === 'ArrowLeft' ? -1 : 1;
		const direction = 0;
		const targetIndex =
			(currentRouteIndex + direction + names.value.length) % names.value.length;
		// console.log(
		// 	`key: ${e.key}`,
		// 	{ currentRouteName, currentRouteIndex },
		// 	JSON.parse(JSON.stringify(router.currentRoute.value)),
		// );
		router.push(routeList.value[targetIndex]);
	}
};
window.addEventListener('keydown', keyHandler);

onBeforeUnmount(() => {
	window.removeEventListener('keydown', keyHandler);
});
</script>

<template>
	<div
		class="character-overview"
		:style="'--bg-color: ' + bgColor"
	>
		<header
			class="banner"
			:style="'background-image: url(' + banner + ')'"
		>
			<RouterLink
				:to="{ name: 'home' }"
				class="logo"
			>
				<div class="icon">
					<img src="/src/assets/icons/slot_tricorn.png" />
				</div>
				<div class="icon">
					<h1>{{ characterLabel }}</h1>
					<h2 style="text-transform: none">Season of Reckoning</h2>
				</div>
			</RouterLink>
			<nav class="tab-container">
				<RouterLink :to="{ name: subtabNameGameplay }">Gameplay</RouterLink>
				<!-- <RouterLink :to="{ name: 'characterSkills', params: { characterId } }"
					>Skills</RouterLink
				> -->
				<RouterLink :to="{ name: 'characterBuffs' }">Buffs</RouterLink>
				<RouterLink :to="{ name: subtabNameLoadout }">Loadout</RouterLink>
				<RouterLink :to="{ name: 'characterFeatures' }">Features</RouterLink>
				<RouterLink :to="{ name: 'seasonalArtifact' }">Seasonal Artifact</RouterLink>
				<RouterLink :to="{ name: 'questList' }">Quests</RouterLink>
				<RouterLink :to="{ name: 'characterLore' }">Lore</RouterLink>
				<RouterLink
					:to="{ name: 'settings' }"
					class="d-glyph"
					></RouterLink
				>
			</nav>
		</header>

		<div v-if="!characterLabel">
			<h1>Invalid character ID: {{ characterId }}</h1>
		</div>
		<div v-else-if="isLoading">
			<div>Armor loading… <span v-if="!armorLoading">…done!</span></div>
			<div>Buffs loading… <span v-if="!buffsLoading">…done!</span></div>
			<div>Stats loading… <span v-if="!statsLoading">…done!</span></div>
			<div>Weapons loading… <span v-if="!weaponsLoading">…done!</span></div>
			<LoadingModal />
		</div>
		<router-view
			v-else
			class="content"
		/>
		<!-- <div class="background"></div> -->
	</div>
</template>
<style>
.character-overview {
	display: flex;
	flex-flow: column;
	height: 100vh;
}
.character-overview::after {
	content: '';
	width: 100vw;
	height: 100vh;
	position: absolute;
	background-color: var(--bg-color);
	z-index: -1;
	mix-blend-mode: multiply;
}
.banner {
	width: 100vw;
	height: 4em;
	/* background-image: url('https://wallpapershigh.com/wp-content/uploads/destiny-2-logo-5.webp'); */
	background-size: cover;
	background-color: #444;
	/* border-bottom: 2px solid #444; */
	display: flex;
	flex: 0 0 auto;
}
.banner h1 {
	font-size: 1.4em;
	margin: 0;
}
.banner h2 {
	font-size: 1em;
	font-weight: 100;
	margin: 0;
	text-align: left;
	border: none;
}
.logo {
	background: none;
	padding: 0;
	margin: 0;
	margin-right: auto;
}
.icon {
	display: inline-block;
	vertical-align: middle;
	color: #fff;
}

.tab-container {
	text-align: right;
	display: flex;
	border-radius: 0.25em;
	height: 3em;
	margin-top: 0.5em;
	padding-right: 0.75em;
	text-transform: uppercase;
	text-shadow: 0 0 #0008;
	width: min-content;
}
.tab-container a {
	flex: 0;
	place-content: center;
	padding: 0.5em 0.5em;
	padding-top: 0.75em;
	margin: 0 0.25em;
	text-align: center;
	text-decoration: none;
	transition: color 0.3s;
	color: #fffa;
	padding: 0 1em;
	position: relative;
}
.tab-container a::after {
	transition:
		background-color 0.2s ease-out,
		width 0.2s ease-out,
		margin-left 0.2s ease-out;
	content: ' ';
	position: absolute;
	height: 4px;
	background-color: #fff;
	width: 0;
	left: 0;
	bottom: -12px;
	margin-left: 50%;
	text-align: center;
}
.tab-container a:hover {
	transition: color 0.3s;
	color: #fff;
}
.visible-text {
	position: absolute;
	font-weight: 100;
	color: #ffff;
	transform: translateX(-100%);
}
.tab-container .router-link-active {
	color: #fff;
}
.tab-container .router-link-active::after {
	width: 100%;
	margin-left: 0;
}
.content {
	flex: 1 1 auto;
	padding: 0.5em;
	overflow-y: auto;
	overflow-x: hidden;
}
</style>
