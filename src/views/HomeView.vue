<script setup lang="ts">
import { characterDataSources } from '@/composables/useCharacterData';
</script>

<template>
	<header>
		<RouterLink :to="{ name: 'home' }"
			><img
				class="logo"
				src="/src/assets/icons/slot_tricorn.png"
		/></RouterLink>
		<h1>STARBENDER 2: Season of Collapse</h1>
	</header>
	<main>
		<h2>Select a character to view their details</h2>
		<ul>
			<li
				v-for="(character, characterId) in characterDataSources"
				:key="characterId"
			>
				<RouterLink
					:to="{
						name: 'characterOverview',
						params: {
							characterId,
						},
					}"
					>{{ character.label }}</RouterLink
				>
			</li>
		</ul>
	</main>
</template>
<style scoped>
h1 {
	margin: 0;
	padding-top: 0.2em;
	font-size: 2.2em;
	display: inline-block;
	vertical-align: middle;
}
h2 {
	width: 80vw;
	margin-left: 10vw;
}
header {
	display: block;
	place-items: center;
	width: 100%;
	text-align: center;
	padding-top: 35vh;
	padding-bottom: 3vh;
}
.logo {
	vertical-align: middle;
}
li {
	text-align: center;
	font-size: 1em;
	text-decoration: none;
	vertical-align: center;
}
</style>
