<script setup lang="ts">
import { computed } from 'vue';
import { type CharacterDataSource, characterDataSources } from '@/composables/useCharacterData';
type CharacterProps = {
	characterId: string;
};
const props = defineProps<CharacterProps>();
const character = computed<CharacterDataSource>(() => characterDataSources[props.characterId]);
</script>

<template>
	<div class="CharacterEquipment">
		<div>
			<h1>TODO Equipment for {{ character.label }}</h1>
		</div>
	</div>
</template>
