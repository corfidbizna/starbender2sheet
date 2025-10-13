<script setup lang="ts">
import type { BuffInfo } from '@/business_logic/buffs';
import useCharacterData from '@/composables/useCharacterData';
import { computed } from 'vue';

const props = defineProps<BuffInfo & { characterId: string }>();
const { namesOfActivatedBuffs, buffsStackUpdate } = useCharacterData(props.characterId);

const imageSrc = computed<string>(() => {
	if (props.type === 'Buff') {
		return '/src/assets/icons/buff_up.png';
	} else if (props.type === 'Debuff') {
		return '/src/assets/icons/buff_down.png';
	}
	return '/src/assets/icons/buff_story.png';
});

const displayStyle = computed<string>(() => {
	if (!props.isStacking) {
		return 'visibility: hidden;';
	}
	return '';
});

const idName = props.name.replace(/ /g, '-').toLocaleLowerCase();

const changeStacksUpdate = (amount: Event) => {
	const value = amount as InputEvent;
	return buffsStackUpdate(props.name, parseInt(value.data || '0'));
};
</script>
<template>
	<label class="buff-label">
		<input
			:disabled="props.isPassive"
			type="checkbox"
			name="partyBuffs"
			:value="props.name"
			v-model="namesOfActivatedBuffs"
		/>
		<div class="contents">
			<div class="buff-header">
				<img
					:src="imageSrc"
					class="buff-icon"
				/>
				<span
					class="buff-name"
					:class="props.type.toLocaleLowerCase()"
					>{{ props.name }}</span
				>
				<span class="buff-category">{{ props.category || 'Misc' }}</span>
				<span
					class="duration"
					v-if="props.roundsRemaining"
					>{{ props.roundsRemaining }} rounds remaining</span
				>
				<span
					class="stacks"
					:style="displayStyle"
					>x{{ props.stacks
					}}<input
						:id="'spinbox-' + idName"
						class="stacks-input"
						type="number"
						min="0"
						onkeydown="return false"
						:max="props.stackMax || Infinity"
						:value="props.stacks"
						@input="changeStacksUpdate"
					/>
					<span v-if="props.stackMax">⁄{{ props.stackMax }}</span></span
				>
			</div>
			<div
				v-if="props.effects"
				class="buff-effects"
			>
				<span>{{ props.effects }}</span>
			</div>
			<div v-if="props.description">{{ props.description }}</div>
		</div>
	</label>
</template>
<style scoped>
.buff-label:has(input[type='checkbox']:checked),
.buff-label:has(input[type='checkbox']:disabled) {
	border-color: #fff;
	background-color: #0006;
}
.buff-label {
	text-align: left;
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
}
.buff,
.story {
	color: #b6efbd;
}
.debuff {
	color: #f99a8e;
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
	max-width: 1.5em;
	background: none;
	border: none;
	color: #fff0;
	text-align: right;
	padding: 0;
}
.buff-label > input:disabled {
	opacity: 0;
}
</style>
