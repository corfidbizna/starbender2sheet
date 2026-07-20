<script setup lang="ts">
import type { BuffInfo } from '@/business_logic/buffs';
import useCharacterData from '@/composables/useCharacterData';
import DGlyph from '@/components/DGlyph.vue';
import { computed, ref } from 'vue';
import DBox from './DBox.vue';

const props = defineProps<BuffInfo & { condensed: boolean }>();
const { buffs, customBuffs, namesOfActivatedBuffs } = useCharacterData();

const hovering = ref<boolean>(false);
const cursorPosX = ref<number>(0);
const cursorPosY = ref<number>(0);
document.addEventListener('mousemove', (event) => {
	cursorPosX.value = event.clientX;
	cursorPosY.value = event.clientY;
});
const cursorPosStyle = computed<string>(() => {
	const width = 1000;
	const crossoverX = cursorPosX.value - window.innerWidth / 2 > 0 ? -100 : 0;
	const crossoverY = cursorPosY.value - window.innerHeight / 2 > 0 ? -100 : 0;
	return (
		'left: ' +
		cursorPosX.value +
		'px; top: ' +
		cursorPosY.value +
		'px; width: ' +
		width +
		'px;' +
		'transform: translateX(' +
		crossoverX +
		'%) translateY(' +
		crossoverY +
		'%);'
	);
});
const buffIsActive = computed<boolean>(
	() => namesOfActivatedBuffs.value.includes(props.name) || props.isPassive,
);

const imageSrc = computed<string>(() => {
	return (
		'./buff_icons/' + (props.icon ? props.icon : 'General_Arrow') + '_' + props.type + '.svg'
	);
});

const idName = props.name.replace(/ /g, '-').toLocaleLowerCase();
const ogBuff = computed<BuffInfo>(
	() =>
		buffs.value.find((buff) => buff.name === props.name) ||
		customBuffs.value[props.name] ||
		<BuffInfo>{ stacks: props.stacks },
);
const removeBuff = () => {
	const nameIndex = namesOfActivatedBuffs.value.indexOf(props.name);
	namesOfActivatedBuffs.value.splice(nameIndex, 1);
	delete customBuffs.value[props.name];
};
</script>
<template>
	<DBox
		v-if="hovering && props.condensed"
		v-bind="{
			rarity: '',
			title: props.name,
			subtitle: [props.category || 'Misc', props.type || ''].join(' '),
		}"
		:class="{ active: buffIsActive }"
		style="
			position: absolute;
			pointer-events: none;
			text-align: left;
			overflow: clip;
			z-index: 2;
		"
		:style="cursorPosStyle"
	>
		<template #header-icon
			><img
				:src="imageSrc"
				style="width: 3em"
		/></template>
		<template #contents>
			<div v-if="props.effects">
				{{ props.effects }}
			</div>
			<div v-if="props.description">
				{{ props.description }}
			</div>
		</template>
		<template
			#footer
			v-if="!props.isPassive"
		>
			<span v-if="buffIsActive"><DGlyph v-bind="{ name: 'LeftClick' }" /> Deactivate</span>
			<span v-else><DGlyph v-bind="{ name: 'LeftClick' }" /> Activate</span>
		</template>
	</DBox>
	<label
		class="buff-label"
		:class="{ condensed, passive: props.isPassive }"
		@mouseover="hovering = true"
		@mouseout="hovering = false"
	>
		<div class="buff-contents">
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
					><DGlyph
						v-if="props.isMagic"
						v-bind="{ name: 'Light' }"
					/>{{ props.name }}</span
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
				<span class="stacks">
					<span
						v-if="props.isStacking"
						class="stacks"
						><input
							:name="'spinbox-' + idName"
							class="stacks-input"
							type="number"
							min="0"
							:max="props.stackMax || Infinity"
							v-model="ogBuff.stacks"
						/>
						<span v-if="props.stackMax">⁄{{ props.stackMax }}</span></span
					>
					<span
						v-if="props.isCustom"
						title="Remove this buff"
						> <button @click="removeBuff">×</button></span
					>
				</span>
			</div>
			<div
				v-if="props.effects && !condensed"
				class="buff-text effects"
			>
				<span>{{ props.effects }}</span>
			</div>
			<details
				v-if="props.description && !condensed"
				class="buff-text description"
			>
				<summary>Description</summary>
				{{ props.description }}
			</details>
		</div>
	</label>
</template>
<style scoped>
.condensed {
	font-size: 0.7em;
}
.condensed input[type='checkbox'] {
	display: none;
}
.buff-label.condensed.passive {
	background-color: #0003;
}
.buff-label.condensed {
	border: none;
	background-color: #0000;
	padding: 0px;
	padding-right: 2px;
	margin: 2px;
	width: 235px;
}
.buff-label:has(input[type='checkbox']:checked),
.buff-label:has(input[type='checkbox']:disabled) {
	border-color: #fff;
	background-color: #0006;
}
.buff-label {
	text-align: left;
	display: flex;
	width: 450px;
	max-width: 530px;
	padding: 0.25em;
	margin: 0.5em;
	border: 2px solid #3330;
	transition:
		border-color 0.15s,
		background-color 0.15s;
	background-color: #0004;
}
.buff-header > input {
	height: 1em;
	align-self: center;
}
.buff-header > input:disabled {
	visibility: hidden;
}
.buff-label .buff-contents {
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
	/* position: relative;
	top: -2px; */
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
	max-width: 4em;
}
.buff-label > input:disabled {
	opacity: 0;
}
.buff-text.description {
	white-space: pre-line;
}
</style>
