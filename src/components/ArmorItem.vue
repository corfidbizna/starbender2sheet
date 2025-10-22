<script setup lang="ts">
import type { Armor } from '@/composables/useCharacterData';
import useCharacterData from '@/composables/useCharacterData';

const props = defineProps<Armor & { characterId: string }>();
const { namesOfEquippedArmor, namesOfActiveArmor } = useCharacterData(props.characterId);
</script>
<template>
	<label
		class="armor-item"
		:class="equipped ? 'equipped' : ''"
		:for="name + '-equip'"
	>
		<div
			class="header"
			:class="rarity.toLocaleLowerCase()"
		>
			<input
				:id="name + '-equip'"
				type="checkbox"
				:value="name"
				v-model="namesOfEquippedArmor"
			/>
			<div class="armor-titles">
				<div class="name">{{ name }}</div>
				<div class="coverage">{{ coverage || '' }} Equipment</div>
			</div>
			<label
				v-if="isActivatable"
				class="activate"
				:class="active ? 'activated' : ''"
				:for="name + '-active'"
				>Activate<input
					:id="name + '-active'"
					type="checkbox"
					:value="name"
					v-model="namesOfActiveArmor"
			/></label>
		</div>
		<div class="armor-content">
			<div
				v-if="buffs"
				class="effects passive"
			>
				<span>Equipped Stats</span>
				<span>{{ buffs }}</span>
			</div>
			<div
				v-if="buffsCharged"
				class="effects active"
			>
				{{ buffsCharged }}
			</div>
			<div class="description">{{ description }}</div>
			<div
				v-if="props.flavortext"
				class="flavortext"
			>
				{{ flavortext }}
			</div>
			<div class="footer">
				<span
					v-if="equipped"
					class="is-equipped"
					>CURRENTLY EQUIPPED</span
				>
			</div>
		</div>
	</label>
</template>
<style>
.armor-item {
	display: block;
	width: 576px;
	margin: 6px;
	border: 2px solid #fff0;
}
.armor-item.equipped {
	border-color: #ffff;
}
.armor-item .header {
	background-color: #c2bdb4;
	color: #000;
	padding: 0.5em;
	display: flex;
	align-items: flex-start;
}
.armor-item .header input {
	display: inline;
	vertical-align: top;
}
.armor-titles {
	display: inline-block;
	flex: 1;
}
.header .activate {
	padding: 0.25em;
	background: #0004;
	border: 2px solid #fff8;
}
.header .activate.activated {
	background: #fff4;
	border-color: #ffff;
}
.header .activate input {
	visibility: hidden;
	width: 0;
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
	height: 1em;
	background: #000a;
	border: none;
	padding: 0.2em;
	padding-bottom: 0;
	text-align: right;
	color: #000a;
}
.equipped .armor-content .footer {
	background: #fff;
}
.armor-content .is-equipped {
	display: block;
}
</style>
