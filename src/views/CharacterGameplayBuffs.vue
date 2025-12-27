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
		<BuffActivator :character-id="characterId" />
	</div>
</template>
