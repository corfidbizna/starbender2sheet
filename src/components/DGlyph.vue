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
	'Breech-loading Grenade Launcher': '',
	'Trace Rifle': '',
	Glaive: '',
	// Heavy
	'Rocket Launcher': '',
	'Heavy Grenade Launcher': '',
	'Linear Fusion Rifle': '',
	Sword: '',
	'Machine Gun': '',
};
export type FontEntries = keyof typeof glyphMap;
const props = defineProps<FontEntries>();
const getGlyph = (text: FontEntries): string => {
	Object.keys(glyphMap).forEach((key) => {
		if (text === key) {
			return glyphMap[key];
		}
	});
	return '';
};
</script>
<template>
	<div class="destiny-symbols">{{ getGlyph(props) }}</div>
	<div>Bow Graphic</div>
</template>
<style>
.destiny-symbols {
	font-size: 1.5em;
	font-family: 'Destiny Symbols Common';
}
</style>
