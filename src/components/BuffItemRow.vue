<script setup lang="ts">
import type { BuffInfo } from '@/business_logic/buffs';
import useCharacterData from '@/composables/useCharacterData';
import { computed } from 'vue';

const props = defineProps<BuffInfo & { characterId: string; condensed: boolean }>();
const { namesOfActivatedBuffs, buffsStackUpdate } = useCharacterData(props.characterId);

const imageSrc = computed<string>(() => {
	return (
		'./buff_icons/' + (props.icon ? props.icon : 'General_Arrow') + '_' + props.type + '.svg'
	);
});

const idName = props.name.replace(/ /g, '-').toLocaleLowerCase();

const changeStacksUpdate = (amount: Event) => {
	const value = amount as InputEvent;
	return buffsStackUpdate(props.name, parseInt(value.data || '0'));
};
</script>
<template>
	<label
		:title="props.description"
		class="buff-label"
		:class="condensed ? 'condensed' : ''"
	>
		<div class="contents">
			<div class="buff-header">
				<input
					:disabled="props.isPassive"
					type="checkbox"
					name="partyBuffs"
					:value="props.name"
					v-model="namesOfActivatedBuffs"
				/>
				<img
					:src="imageSrc"
					class="buff-icon"
				/>
				<span
					class="buff-name"
					:class="props.type.toLocaleLowerCase()"
					>{{ props.name }}</span
				>
				<span
					v-if="!condensed"
					class="buff-category"
					>{{ props.category || 'Misc' }}</span
				>
				<span
					class="duration"
					v-if="props.roundsRemaining"
					>{{ props.roundsRemaining }} rounds remaining</span
				>
				<span
					v-if="props.isStacking"
					class="stacks"
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
				v-if="props.effects && !condensed"
				class="buff-text effects"
			>
				<span>{{ props.effects }}</span>
			</div>
			<div
				v-if="props.description && !condensed"
				class="buff-text description"
			>
				{{ props.description }}
			</div>
		</div>
	</label>
</template>
<style scoped>
.condensed {
	font-size: 0.8em;
}
.buff-label:has(input[type='checkbox']:checked),
.buff-label:has(input[type='checkbox']:disabled) {
	border-color: #fff;
	background-color: #0006;
}
.buff-label {
	text-align: left;
	display: flex;
	width: auto;
	max-width: 530px;
	padding: 0.25em;
	margin: 0.5em;
	border: 2px solid #3330;
	transition:
		border-color 0.15s,
		background-color 0.15s;
	background-color: #0004;
}
.buff-label.condensed {
	border: none;
	background-color: #0000;
}
.buff-header > input {
	width: 1.4em;
	height: 1.3em;
	align-self: baseline;
}
.buff-header > input:disabled {
	visibility: hidden;
}
.buff-label .contents {
	display: inline;
	width: 100%;
}
/*  */
.buff-header {
	display: block;
	display: flex;
	align-items: center;
}
.buff-icon {
	width: 2em;
	position: relative;
	top: -2px;
}
.buff-name {
	font-size: 1.2em;
	text-align: left;
	font-weight: bold;
}
.buff,
.story {
	color: var(--color-buff);
}
.debuff {
	color: var(--color-debuff);
}
.warning {
	color: var(--color-masterwork);
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
.buff-text {
	margin-top: 2px;
	margin-left: 1.5em;
	padding-top: 4px;
	border-top: 2px solid #fff8;
}
.buff-text.effects {
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
.buff-text.description {
	white-space: pre-line;
}
</style>
