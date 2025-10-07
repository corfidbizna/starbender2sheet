<script setup lang="ts">
// import type { BuffInfo } from '@/business_logic/buffs';
import useCharacterData from '@/composables/useCharacterData';

type CharacterProps = {
	characterId: string;
};
const props = defineProps<CharacterProps>();

const { buffs, namesOfActivatedBuffs } = useCharacterData(props.characterId);

const imageSrc = (input: string) => {
	if (input === 'Buff') {
		return '/src/assets/icons/buff_up.png';
	} else if (input === 'Debuff') {
		return '/src/assets/icons/buff_down.png';
	}
	return '/src/assets/icons/buff_story.png';
};
// const currentStacks = ref<number>(activatablePartyBuffs.value[''].stacks || 0);
// const changeStacksUpdate = (name: string, amount: number) => {};
</script>
<template>
	<div class="buff-activator">
		<div class="buff-table">
			<label
				class="buff-label"
				v-for="buff in buffs"
				:key="buff.name"
			>
				<input
					:disabled="buff.isPassive"
					type="checkbox"
					name="partyBuffs"
					:value="buff.name"
					v-model="namesOfActivatedBuffs"
				/>
				<div class="contents">
					<div class="buff-header">
						<img
							:src="imageSrc(buff.type)"
							class="buff-icon"
						/>
						<span class="buff-name">{{ buff.name }}</span>
						<span class="buff-category">{{ buff.category || 'Misc' }}</span>
						<span
							class="duration"
							v-if="buff.roundsRemaining"
							>{{ buff.roundsRemaining }} rounds remaining</span
						>
						<span
							class="stacks"
							v-if="buff.isStacking"
							>x<input
								class="stacks-input"
								type="number"
								min="0"
								value="0"
								:max="buff.stackMax || Infinity"
							/>
							<span v-if="buff.stackMax">⁄{{ buff.stackMax }}</span></span
						>
					</div>
					<div
						v-if="buff.effects"
						class="buff-effects"
					>
						<span>{{ buff.effects }}</span>
					</div>
					<div>{{ buff.description }}</div>
				</div>
			</label>
		</div>
	</div>
</template>
<style scoped>
.buff-activator {
	display: block;
}
.buff-table {
	display: block;
	border: 2px solid #fff4;
}
.buff-label:has(input[type='checkbox']:checked),
.buff-label:has(input[type='checkbox']:disabled) {
	border-color: #fff;
	background-color: #0006;
}
.buff-label {
	display: flex;
	max-width: 530px;
	padding: 0.25em;
	margin: 0.5em;
	border: 2px solid #3330;
	transition:
		border-color 0.15s,
		background-color 0.15s;
	background-color: #0004;
}
.buff-label > input {
	margin-right: 0.5em;
	width: 1.5em;
	height: 1.5em;
	display: inline;
}
.buff-label .contents {
	display: inline;
	width: 100%;
}
.buff-label .contents > * {
	border-bottom: 1px solid #fff8;
	padding: 2px 0;
	margin: 2px 0;
}
.buff-label .contents > *:last-child {
	border-bottom: 0;
	padding-bottom: 0;
	margin-bottom: 0;
}
/*  */
.buff-header {
	display: block;
	display: flex;
	align-items: center;
}
.buff-icon {
	width: 1.2em;
	height: 1.2em;
}
.buff-name {
	font-size: 1.2em;
	text-align: left;
	font-weight: bold;
	/* margin-right: 1em; */
}
.buff-category {
	/* font-size: 0.8em; */
	color: #ccc;
	padding-top: 0.1em;
	padding-left: 0.2em;
}
.buff-category::before {
	content: '// ';
}
.buff-effects {
	opacity: 0.8;
	font-size: 0.9em;
	font-style: italic;
}
.buff-label .duration {
	text-align: center;
	margin: 0 auto;
}
.buff-label .stacks {
	text-align: right;
	margin-left: auto;
}
.stacks-input {
	max-width: fit-content;
	background: none;
	border: none;
	color: #fff;
	text-align: right;
	padding: 0;
}
.stacks-input::before {
	content: 'fcwe';
}
.stacks-input * {
	color: #f0f;
}
.buff-label > input:disabled {
	opacity: 0;
}
</style>
