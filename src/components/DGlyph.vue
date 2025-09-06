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
	'Breech-Loading Grenade Launcher': '',
	'Trace Rifle': '',
	Glaive: '',
	// Heavy
	'Rocket Launcher': '',
	'Drum-loading Grenade Launcher': '',
	'Linear Fusion Rifle': '',
	Sword: '',
	'Machine Gun': '',
};
type FontEntries = keyof typeof glyphMap;
type Glyph = {
	name: string;
};
const props = defineProps<Glyph>();
const lookupGlyph = (text: string): string => {
	return glyphMap[text as FontEntries] || '';
};
</script>
<template>
	<div class="destiny-symbols">{{ lookupGlyph(props.name) }}</div>
	<!-- <div>{{ props.name }}</div> -->
</template>
<style>
.destiny-symbols {
	font-size: 1.5em;
	font-family: 'Destiny Symbols Common';
}
</style>
