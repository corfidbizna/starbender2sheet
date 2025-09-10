<script setup lang="ts">
import useCharacterData from '@/composables/useCharacterData';

type CharacterProps = {
	characterId: string;
};
const props = defineProps<CharacterProps>();

const { namesOfActivatedBuffs, activatablePartyBuffs, refreshBuffs } = useCharacterData(
	props.characterId,
);
</script>
<template>
	<div class="buff-activator">
		<div><button @click="refreshBuffs">Refresh Buffs</button></div>
		<div>
			<label
				class="buff-label"
				v-for="buff in activatablePartyBuffs"
				:key="buff.name"
			>
				<span>name: {{ buff.name }}</span>
				<input
					type="checkbox"
					name="partyBuffs"
					:value="buff.name"
					v-model="namesOfActivatedBuffs"
				/>
			</label>
		</div>
		<pre>namesOfActivatedBuffs: {{ namesOfActivatedBuffs }}</pre>
	</div>
</template>
<style scoped>
.buff-label {
	display: inline-block;
	padding: 8px;
	margin: 2px;
	border: 2px solid #333;
}
</style>
