<script setup lang="ts">
import useCharacterData from '@/composables/useCharacterData';
// import { computed } from 'vue';

type CharacterProps = {
	characterId: string;
};
const props = defineProps<CharacterProps>();

const { namesOfActivatedBuffs, activatablePartyBuffs, buffsTallied, buffsRefresh } =
	useCharacterData(props.characterId);
// const imageSrc = computed<string>(() => {
// 	if (props.type === 'Buff') {
// 		return 'buff_up.png';
// 	} else if (props.type === 'Deuff') {
// 		return 'buff_down.png';
// 	}
// 	return 'buff_story.png';
// });
</script>
<template>
	<div class="buff-activator">
		<div><button @click="buffsRefresh">Refresh Buffs</button></div>
		<div class="buff-table">
			<label
				class="buff-label"
				v-for="buff in activatablePartyBuffs"
				:key="buff.name"
			>
				<input
					type="checkbox"
					name="partyBuffs"
					:value="buff.name"
					v-model="namesOfActivatedBuffs"
				/>
				<div>
					<span>{{ buff.name }}</span>
					<span>{{ buff.stacks }}{{ buff.stackMax }}</span>
				</div>
				<div>{{ buff.description }}</div>
			</label>
		</div>
		<pre>namesOfActivatedBuffs: {{ namesOfActivatedBuffs }}</pre>
		<pre>buffsTallied: {{ buffsTallied }}</pre>
	</div>
</template>
<style scoped>
.buff-activator {
	display: block;
}
.buff-table {
	display: block;
	background-color: #0004;
}
.buff-label {
	display: block;
	width: 80vw;
	padding: 8px;
	margin: 2px;
	border: 2px solid #333;
}
</style>
