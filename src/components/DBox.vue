<script setup lang="ts">
import type { Rarity } from '@/composables/useCharacterData';

export type DBox = {
	rarity: Rarity;
	title: string;
	subtitle: string;
	flavortext?: string;
};

const props = defineProps<DBox>();
</script>
<template>
	<div class="d-box">
		<div
			class="header"
			:class="props.rarity.toLocaleLowerCase() || 'legendary'"
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
			<slot name="footer-text"></slot>
		</div>
	</div>
</template>
<style>
.d-box {
	max-width: 576px;
	margin: 0.5em 0;
	border: 4px solid #0000;
}
.d-box.active {
	border-color: #ffff;
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
	border-bottom: 2px solid #fff4;
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
	border-bottom: 2px solid #fff4;
	border-top: 2px solid #fff4;
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
</style>
