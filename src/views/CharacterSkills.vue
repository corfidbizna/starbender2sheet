<script setup lang="ts">
import useCharacterData, { type CharacterNames } from '@/composables/useCharacterData';
import SkillsTable from '@/components/SkillsTable.vue';
import { getBGData } from '@/sharedState';
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
		<div class="rotating-bg">
			<object
				:data="getBGData('Lines_Skills')"
				type="image/svg+xml"
				style="position: absolute; top: -20vw"
			/>
		</div>
		<SkillsTable :character-id="characterId"></SkillsTable>
	</div>
</template>
