<script setup lang="ts">
const glyphMap = {
	// Kinetic
	Bow: '',
	'Auto Rifle': '',
	'Pulse Rifle': '',
	'Scout Rifle': '',
	'Hand Cannon': '',
	'Submachine Gun': '',
	Sidearm: '',
	// Energy
	Shotgun: '',
	'Sniper Rifle': '',
	'Fusion Rifle': '',
	'Breech Loading Grenade Launcher': '',
	'Trace Rifle': '',
	Glaive: '',
	Shield: '',
	// Heavy
	'Rocket Launcher': '',
	'Drum Loading Grenade Launcher': '',
	'Linear Fusion Rifle': '',
	Sword: '',
	'Machine Gun': '',
	// Elements
	Kinetic: '',
	Solar: '',
	Arc: '',
	Void: '',
	Stasis: '',
	Strand: '',
	Prismatic: '',
	Dark: '',
	Darkness: '',
	// Symbols
	Light: '',
	// Keyboard
	LeftClick: '',
};
type FontEntries = keyof typeof glyphMap;
type Glyph = {
	name: string;
};
const props = defineProps<Glyph>();
const lookupGlyph = (text: string): string[] => {
	return (glyphMap[text as FontEntries] || '').split('');
};
const superscript = props.name === 'Light';
const isMulticolor = lookupGlyph(props.name).length > 1;
const multicolorMap = {
	LeftClick: ['color: #3396DA', ''],
};
const colors: string[] = Object.keys(multicolorMap).map(
	(key, i) => multicolorMap[key as keyof typeof multicolorMap][i],
) || [''];
</script>
<template>
	<span
		v-if="isMulticolor"
		class="destiny-symbols"
		:class="{ superscript }"
	>
		<span
			v-for="(glyph, i) in lookupGlyph(props.name)"
			:key="props.name + '-' + i"
			:style="colors[i]"
			>{{ glyph }}</span
		>
	</span>
	<span
		v-else
		class="destiny-symbols"
		:class="{ superscript }"
	>
		{{ lookupGlyph(props.name)[0] }}
	</span>
	<!-- <div>{{ props.name }}</div> -->
</template>
<style>
.destiny-symbols {
	/* font-size: 1.5em; */
	font-family: 'Destiny Symbols Common', 'Destiny Symbols PC';
}
.superscript {
	font-size: 0.75em;
	translate: 0 -0.45em;
	display: inline-block;
}
</style>
