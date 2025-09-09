<script setup lang="ts">
import useCharacterData, { type CharacterNames } from '@/composables/useCharacterData';
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

const { character } = useCharacterData(props.characterId);
</script>

<template>
	<div class="character-overview">
		<header class="banner">
			<RouterLink
				:to="{ name: 'home' }"
				class="logo"
			>
				<div class="icon">
					<img src="/src/assets/icons/slot_tricorn.png" />
				</div>
				<div class="icon">
					<h1>STARBENDER 2</h1>
					<h2>Season of Collapse</h2>
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
				<RouterLink :to="{ name: 'characterLoadout', params: { characterId } }"
					>Loadout</RouterLink
				>
				<a>Seasonal Artifact</a>
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
		<router-view
			v-else
			class="content"
		/>
	</div>
</template>
<style>
.character-overview {
	display: flex;
	flex-flow: column;
	height: 100vh;
}
.banner {
	width: 100vw;
	height: 4em;
	background-image: url('https://wallpapershigh.com/wp-content/uploads/destiny-2-logo-5.webp');
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
}
.tab-container a {
	flex: 0;
	place-content: center;
	padding: 0.5em 0.5em;
	padding-top: 0.75em;
	margin: 0 0.25em;
	text-align: center;
	text-decoration: none;
	color: #fffa;
	border-bottom: 4px solid #0000;
	padding: 0 1em;
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
