<script setup lang="ts">
import type { Rarity, Element } from '@/composables/useCharacterData';
import { ref } from 'vue';

export type DBox = {
	rarity: Rarity | Element | '';
	title: string;
	subtitle: string;
	flavortext?: string;
	lore?: string;
};

const props = defineProps<DBox>();
const showLore = ref<boolean>(false);
</script>
<template>
	<div class="d-box">
		<div
			class="header"
			:class="props.rarity.toLocaleLowerCase() || 'neutral'"
		>
			<div class="header-icon">
				<slot name="header-icon"></slot>
			</div>
			<div class="header-titles">
				<div>
					<h1>
						<slot name="header-name">{{ props.title }}</slot>
					</h1>
				</div>
				<div>
					<h2>
						<slot name="header-subtitle">{{ props.subtitle }}</slot>
					</h2>
				</div>
			</div>
			<div class="header-right">
				<slot name="header-right"></slot>
			</div>
		</div>
		<div class="contents">
			<slot name="contents"></slot>
		</div>
		<div
			class="flavortext"
			v-if="!!props.flavortext"
		>
			{{ props.flavortext }}
		</div>
		<div class="footer">
			<button
				v-if="lore"
				@click="showLore = !showLore"
				style="float: left"
			>
				Show Lore
			</button>
			<slot name="footer-text"></slot>
		</div>
		<label
			v-if="lore && showLore"
			class="lore"
			for="toggle-lore"
		>
			<button
				id="toggle-lore"
				@click="showLore = !showLore"
			>
				×
			</button>
			<h1>{{ title }}</h1>
			<div class="lore-box">
				<div class="lore-content">
					<div
						v-if="flavortext"
						class="lore-title"
					>
						{{ flavortext }}
					</div>
					<div class="lore-text">{{ lore }}</div>
				</div>
			</div>
		</label>
	</div>
</template>
<style>
.d-box {
	max-width: 576px;
	margin: 0.5em 0;
	border: 4px solid #0000;
	--line: 2px solid #fff4;
}
.d-box.active {
	border-color: #ffff;
}
.d-box.disabled {
	color: #888;
}
/* Header */
.d-box .header {
	padding: 8px;
	display: flex;
	flex-direction: row;
	align-items: center;
	color: #fff;
	height: 3em;
}
.d-box.disabled .header {
	color: #aaa;
	filter: brightness(80%);
}
.d-box .header.neutral {
	background-color: #646463;
}
.d-box .header.common {
	color: #000;
	background-color: #c2bdb4;
}
.d-box .header.uncommon {
	background-color: #356f42;
}
.d-box .header.rare {
	background-color: #5076a3;
}
.d-box .header.legendary {
	background-color: #522e65;
}
.d-box .header.exotic {
	background-color: #cdae34;
}
.d-box .header.solar {
	background-color: #b44a19;
}
.d-box .header.arc {
	background-color: #517f93;
}
.d-box .header.void {
	background-color: #6e4f73;
}
.d-box .header.stasis {
	background-color: #3153b3;
}
.d-box .header.strand {
	background-color: #2f7242;
}
.d-box .header-icon {
	margin-right: 8px;
}
.d-box .header-titles {
	flex-grow: 1;
}
.d-box .header-titles h1 {
	font-size: 1.3em;
	line-height: 1em;
	font-weight: 800;
	padding: 0;
	margin: 0;
}
.d-box .header-titles h2 {
	margin-top: 0.25em;
	margin-bottom: 0;
	font-weight: 400;
	font-size: 1em;
	display: block;
	padding: 0;
	border: none;
	opacity: 0.5;
}
.d-box .header-right {
	margin-left: 8px;
}
/* Contents */
.d-box .contents {
	display: flex;
	flex-direction: column;
}
.d-box .contents,
.d-box .flavortext {
	background-color: #0008;
}
.d-box .contents > * {
	border-bottom: var(--line);
	padding: 8px;
}
.d-box .contents > *:last-child {
	border-bottom-width: 0;
}
/* Flavortext */
.d-box .flavortext {
	padding: 10px;
	font-style: italic;
	font-weight: 100;
	color: #fffa;
	border-bottom: var(--line);
	border-top: var(--line);
}
/* Footer */
.d-box .footer {
	background-color: #000a;
	text-align: right;
	height: 1.25em;
}
.d-box.active .footer {
	background-color: #ffff;
	color: #000a;
}
.d-box.active .footer button {
	background-color: #0007;
}
/* Lore display */
.d-box .lore {
	position: absolute;
	display: flex;
	flex-direction: column;
	white-space: pre-line;
	font-size: 1rem;
	top: 0;
	left: 0;
	width: 40em;
	height: calc(100vh - 14em);
	background-color: #0026;
	border-right: 3px solid #aaa;
	padding: 6em;
	padding-top: 8em;
	backdrop-filter: blur(4px);
	z-index: 1;
}
.d-box .lore button {
	position: absolute;
	top: 1em;
	right: 1em;
	display: none;
}
.d-box .lore .lore-box {
	position: relative;
	padding: 2em 0;
	border-top: var(--line);
	border-bottom: var(--line);
	height: 0;
	flex-shrink: 1;
	flex-basis: fit-content;
}
.d-box .lore .lore-box::before {
	content: '';
	position: absolute;
	width: 2em;
	height: 2px;
	top: -4px;
	left: calc(50% - 1em);
	background-color: #fff6;
}
.d-box .lore .lore-box::after {
	content: '';
	position: absolute;
	width: 2em;
	height: 2px;
	bottom: -4px;
	left: calc(50% - 1em);
	background-color: #fff6;
}
.d-box .lore .lore-content {
	overflow-y: auto;
	scrollbar-width: thin;
	padding-right: 1em;
	max-height: 100%;
}
.d-box .lore .lore-title {
	text-transform: uppercase;
	font-weight: bold;
	margin-bottom: 1em;
}
.d-box .lore .lore-text {
	color: #ddd;
}
</style>
