<script setup lang="ts">
import useCharacterData, { type StatBoxInfo } from '@/composables/useCharacterData';
import LoadingModal from '@/components/LoadingModal.vue';
import BuffItemRow from '@/components/BuffItemRow.vue';
import BuffActivator from '@/components/BuffActivator.vue';

type CharacterProps = {
	characterId: string;
};
const props = defineProps<CharacterProps>();
const { character, statsLoading, activatedPartyBuffs, buffsLoading } = useCharacterData(
	props.characterId,
);
</script>
<template>
	<div
		class="CharacterBuff"
		v-if="character"
	>
		<div v-if="statsLoading || buffsLoading">
			<LoadingModal />
		</div>
		<div
			v-else
			class="buff-test"
		>
			<BuffItemRow v-bind="activatedPartyBuffs[0]" />
			<pre>activatedPartyBuffs: {{ activatedPartyBuffs }}</pre>
			<BuffActivator :character-id="characterId" />
		</div>
	</div>
</template>
<style>
.buff-box input {
	vertical-align: top;
}
.buff-contents {
	display: inline-block;
}
.buff-block pre,
.buff-block p {
	display: block;
	margin: 0.25em;
}
</style>
