<script setup lang="ts">
import { computed } from 'vue';
import { type CharacterDataSource, characterDataSources } from '@/composables/useCharacterData';
type CharacterProps = {
	characterId: string;
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
const character = computed<CharacterDataSource | undefined>(
	() => characterDataSources[props.characterId],
);
</script>

<template>
	<div class="character-overview">
		<header class="banner">
			<RouterLink :to="{ name: 'home' }"
				><img src="/src/assets/icons/slot_tricorn.png"
			/></RouterLink>
			<div class="logo">
				<h1>STARBENDER 2</h1>
				<h2>Season of Collapse</h2>
			</div>
			<div v-if="!character">
				<h1>Invalid character ID: {{ characterId }}</h1>
			</div>
			<nav
				v-else
				class="tab-container"
			>
				<!-- <h1>This is a page about {{ character.label }}</h1> -->
				<RouterLink :to="{ name: 'characterGameplay', params: { characterId } }"
					>Gameplay</RouterLink
				>
				<RouterLink :to="{ name: 'characterSkills', params: { characterId } }"
					>Skills</RouterLink
				>
				<a>Buffs</a>
				<RouterLink :to="{ name: 'characterEquipment', params: { characterId } }"
					>Loadout</RouterLink
				>
				<a>Seasonal Artifact</a>
				<RouterLink :to="{ name: 'questList', params: { characterId } }">Quests</RouterLink>
				<RouterLink :to="{ name: 'characterLore', params: { characterId } }"
					>Lore</RouterLink
				>
				<RouterLink :to="{ name: 'settings', params: { characterId } }">⚙</RouterLink>
			</nav>
		</header>
		<router-view class="content" />
	</div>
</template>
<style>
.banner {
	position: fixed;
	top: 0;
	left: 0;
	width: 100vw;
	height: 4em;
	background-image: url('https://wallpapershigh.com/wp-content/uploads/destiny-2-logo-5.webp');
	background-size: cover;
	background-color: #444;
	border-bottom: 2px solid #444;
	display: flex;
}
.banner header {
	max-height: 100vh;
	place-items: center;
	padding-bottom: 0.5em;
	margin: 0;
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
.banner .logo {
	background: none;
	padding: 0;
	margin: 0;
	width: inherit;
	place-content: center;
}

.tab-container {
	text-align: center;
	display: flex;
	/* background-color: #4448; */
	border-radius: 0.25em;
	justify-content: right;
	height: 3em;
	margin-top: 0.5em;
}
.tab-container a {
	flex: 0;
	place-content: center;
	padding: 0.5em 0.5em;
	padding-top: 0.75em;
	margin: 0 0.5em;
	text-align: center;
	text-decoration: none;
	color: #fff;
	border-bottom: 4px solid #0000;
	padding: 0 1em;
}
.tab-container .router-link-active {
	font-weight: 800;
	border-bottom: 4px solid #fff;
}
.content {
	padding-top: 4em;
}
</style>
