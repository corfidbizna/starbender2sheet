<script setup lang="ts">
import type { CharacterNames } from '@/composables/useCharacterData';
import useCharacterData from '@/composables/useCharacterData';
import BuffActivator from '@/components/BuffActivator.vue';

type CharacterProps = {
	characterId: CharacterNames;
};
const props = defineProps<CharacterProps>();
const { character } = useCharacterData(props.characterId);
</script>
<template>
	<div
		class="CharacterSkills"
		v-if="character"
	>
		<BuffActivator
			:character-id="characterId"
			:condensed="true"
			class="gameplay-buffs-list"
		/>
	</div>
</template>
<style>
.gameplay-buffs-list {
	height: calc(100vh - 125px);
	overflow-y: scroll;
	scrollbar-width: none;
}
</style>
