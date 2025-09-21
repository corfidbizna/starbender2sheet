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
				<div class="contents">
					<div class="buff-header">
						<span class="name">{{ buff.name }}</span>
						<span
							class="duration"
							v-if="buff.roundsRemaining"
							>{{ buff.roundsRemaining }} rounds remaining</span
						>
						<span
							class="stacks"
							v-if="buff.stacks"
							>{{ buff.stacks }}⁄{{ buff.stackMax }}</span
						>
					</div>
					<div>{{ buff.description }}</div>
				</div>
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
	display: flex;
	width: 80vw;
	padding: 0.25em;
	margin: 2px;
	border: 2px solid #333;
}
.buff-label input {
	margin-right: 0.5em;
	width: 1.5em;
	height: 1.5em;
	display: inline;
}
.buff-label .contents {
	display: inline;
}
.buff-header {
	display: block;
}
.buff-label .name {
	text-align: left;
	font-weight: bold;
	margin-right: auto;
}
.buff-label .duration {
	text-align: center;
	margin: 0 auto;
}
.buff-label .stacks {
	text-align: right;
	margin-left: auto;
}
</style>
