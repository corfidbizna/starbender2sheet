<script setup lang="ts">
import { characterDataSources } from '@/composables/useCharacterData';
</script>

<template>
	<main>
		<h1>Select a character to view their details</h1>
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
