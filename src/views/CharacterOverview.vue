<script setup lang="ts">
import useCharacterData, { type CharacterNames } from '@/composables/useCharacterData';
import { bgColor, banner } from '@/sharedState';
import router from '@/router/index.ts';
import LoadingModal from '@/components/LoadingModal.vue';
import { computed, onBeforeUnmount } from 'vue';
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

const { character, armorLoading, buffsLoading, statsLoading, skillsLoading, weaponsLoading } =
	useCharacterData(props.characterId);
const params = { characterId: props.characterId };
let initialLoadComplete = false;
const isLoading = computed(() => {
	const done =
		armorLoading.value ||
		buffsLoading.value ||
		statsLoading.value ||
		skillsLoading.value ||
		weaponsLoading.value;
	if (done === true && initialLoadComplete === false) {
		initialLoadComplete = true;
	}
	return !initialLoadComplete;
});
const names = [
	'characterGameplay',
	'characterSkills',
	'characterBuffs',
	'characterWeapons',
	// 'characterArmor',
	// 'characterClass',
	'seasonalArtifact',
	'questList',
	'characterLore',
	'settings',
];
const routeList = names.map((name) => ({ name, params }));

const keyHandler = (e: KeyboardEvent) => {
	if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
		const currentRouteName = router.currentRoute.value.name as string;
		const currentRouteIndex = names.indexOf(currentRouteName);
		const direction = e.key === 'ArrowLeft' ? -1 : 1;
		const targetIndex = (currentRouteIndex + direction + names.length) % names.length;
		console.log(
			`key: ${e.key}`,
			{ currentRouteName, currentRouteIndex },
			JSON.parse(JSON.stringify(router.currentRoute.value)),
		);
		router.push(routeList[targetIndex]);
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
					<h1>STARBENDER 2</h1>
					<h2>Season of Reckoning</h2>
				</div>
			</RouterLink>
			<nav
				v-if="character"
				class="tab-container"
			>
				<RouterLink :to="{ name: 'characterGameplay', params: { characterId } }"
					>Gameplay</RouterLink
				>
				<RouterLink :to="{ name: 'characterSkills', params: { characterId } }"
					>Skills</RouterLink
				>
				<RouterLink :to="{ name: 'characterBuffs', params: { characterId } }"
					>Buffs</RouterLink
				>
				<RouterLink :to="{ name: 'characterWeapons', params: { characterId } }"
					>Loadout</RouterLink
				>
				<RouterLink :to="{ name: 'seasonalArtifact', params: { characterId } }"
					>Seasonal Artifact</RouterLink
				>
				<RouterLink :to="{ name: 'questList', params: { characterId } }">Quests</RouterLink>
				<RouterLink :to="{ name: 'characterLore', params: { characterId } }"
					>Lore</RouterLink
				>
				<RouterLink
					:to="{ name: 'settings', params: { characterId } }"
					class="d-glyph"
					></RouterLink
				>
			</nav>
		</header>

		<div v-if="!character">
			<h1>Invalid character ID: {{ characterId }}</h1>
		</div>
		<div v-else-if="isLoading">
			<div>Armor loading… <span v-if="armorLoading">…done!</span></div>
			<div>Buffs loading… <span v-if="buffsLoading">…done!</span></div>
			<div>Stats loading… <span v-if="statsLoading">…done!</span></div>
			<div>Skills loading… <span v-if="skillsLoading">…done!</span></div>
			<div>Weapons loading… <span v-if="weaponsLoading">…done!</span></div>
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
	border-bottom: 2px solid #444;
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
	width: inherit;
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
	border-bottom: 4px solid #0000;
	padding: 0 1em;
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
	border-bottom: 4px solid #fff;
}
.content {
	flex: 1 1 auto;
	padding: 0 0.5em;
	overflow-y: scroll;
}
</style>
