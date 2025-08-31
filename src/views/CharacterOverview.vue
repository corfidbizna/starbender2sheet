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
	<div class="CharacterOverview">
		<div v-if="!character">
			<h1>Invalid character ID: {{ characterId }}</h1>
		</div>
		<div v-else>
			<h1>This is a page about {{ character.label }}</h1>
			<div class="tab-container">
				<a>Gameplay</a>
				<RouterLink :to="{ name: 'characterSkills', params: { characterId } }"
					>Skills</RouterLink
				>
				<a>Buffs</a>
				<RouterLink :to="{ name: 'characterEquipment', params: { characterId } }"
					>Loadout</RouterLink
				>
				<a>Seasonal Artifact</a>
				<a>Lore</a>
				<a>Settings</a>
			</div>

			<router-view />
		</div>
	</div>
</template>
<style scoped>
.tab-container {
	text-align: center;
}
a {
	display: inline-block;
	padding: 0.5em 0.75em;
	width: 140px;
	text-align: center;
	text-decoration: none;
	color: #000;
	background-image: linear-gradient(to bottom, #bbb 0%, #ccc 30%, #bbb 70%, #aaa 100%);
	border: 0.5px solid #eee;
	border-top: 2px solid #eee;
	border-bottom: 2px solid #eee;
}
.router-link-active {
	font-weight: 800;
	background-image: none;
	background-color: white;
}
.tab-container a:first-child {
	border-left: 2px solid #eee;
	border-bottom-left-radius: 0.25em;
	border-top-left-radius: 0.25em;
}
.tab-container a:last-child {
	border-right: 2px solid #eee;
	border-bottom-right-radius: 0.25em;
	border-top-right-radius: 0.25em;
}
</style>
