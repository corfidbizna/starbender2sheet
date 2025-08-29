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
			<h1>This is an page about {{ character.label }}</h1>
			<h2>Sub pages:</h2>
			<ul>
				<li>
					<RouterLink :to="{ name: 'characterSkills', params: { characterId } }"
						>Skills</RouterLink
					>
				</li>
				<li>
					<RouterLink :to="{ name: 'characterEquipment', params: { characterId } }"
						>Equipment</RouterLink
					>
				</li>
			</ul>

			<router-view />
		</div>
	</div>
</template>
