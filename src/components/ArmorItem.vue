<script setup lang="ts">
import type { Armor } from '@/composables/useCharacterData';
import useCharacterData from '@/composables/useCharacterData';

const props = defineProps<Armor & { characterId: string }>();
const { namesOfEquippedArmor } = useCharacterData(props.characterId);
</script>
<template>
	<label class="armor-item">
		<div
			class="header"
			:class="rarity.toLocaleLowerCase()"
		>
			<input
				type="checkbox"
				:value="name"
				v-model="namesOfEquippedArmor"
			/>
			<div class="armor-titles">
				<div class="name">{{ name }}</div>
				<div class="coverage">{{ coverage || '' }} Equipment</div>
			</div>
		</div>
		<div class="armor-content">
			<div
				v-if="buffs"
				class="effects"
			>
				{{ buffs }}
			</div>
			<div class="description">{{ description }}</div>
			<div
				v-if="props.flavortext"
				class="flavortext"
			>
				{{ flavortext }}
			</div>
			<div class="footer"></div>
		</div>
	</label>
</template>
<style>
.armor-item {
	display: block;
	width: 576px;
	margin: 10px;
}
.armor-item .header {
	background-color: #c2bdb4;
	color: #000;
	padding: 0.5em;
}
.armor-item .header input {
	display: inline;
	vertical-align: top;
}
.armor-titles {
	display: inline-block;
}
.armor-item .name {
	font-weight: bold;
	font-size: 1.3em;
}
.armor-item .coverage {
	text-transform: uppercase;
	padding-top: 0.25em;
	opacity: 0.5;
}
.armor-item .uncommon {
	background-color: #356f42;
	color: #fff;
}
.armor-item .rare {
	background-color: #5076a3;
	color: #fff;
}
.armor-item .legendary {
	background-color: #522e65;
	color: #fff;
}
.armor-item .exotic {
	background-color: #cdae34;
	color: #fff;
}

.armor-item .armor-content {
	background-color: #0008;
}
.armor-content div {
	padding: 8px;
	border-bottom: 2px solid #fff4;
}
.effects {
	font-size: 0.9em;
	font-style: italic;
}
.description {
	white-space: pre-line;
}
.flavortext {
	font-style: italic;
	font-weight: 100;
	color: #fffa;
	padding: 0.75em;
}
.armor-content .footer {
	height: 0.5em;
	background: #000a;
	border: none;
	padding: 0;
}
</style>
