<script setup lang="ts">
import { bgColor, banner, storeVisuals, resetVisuals } from '@/sharedState';
const identifyUnicodeSymbols = (start: number, length: number) => {
	const strings = [];
	for (let i = start; i < start + length; i++) {
		strings.push(String.fromCharCode(i) + ' :: ' + i);
	}
	return strings.join('\n');
};
const clearLocalStorage = () => {
	localStorage.clear();
};
</script>
<template>
	<div class="settings-box">
		<table>
			<tr class="header">
				<td colspan="2"><h2>General</h2></td>
			</tr>
			<tr title="Whether or not to show distances in feet or tiles.">
				<td class="setting-label">
					<label for="setting-distance-display">Use Tiles for Distance</label>
				</td>
				<td class="setting-content">
					<input
						id="setting-distance-display"
						type="checkbox"
					/>
				</td>
			</tr>
			<tr
				title="Whether or not to show the group in the buffs section that collects all currently active buffs together."
			>
				<td class="setting-label">
					<label for="setting-active-buffs">Show Active Buffs Group</label>
				</td>
				<td class="setting-content">
					<input
						id="setting-active-buffs"
						type="checkbox"
					/>
				</td>
			</tr>
			<tr class="header">
				<td colspan="2"><h2>Visuals</h2></td>
			</tr>
			<tr title="The primary color the background will use.">
				<td class="setting-label">
					<label for="setting-background-color">Background Color</label>
				</td>
				<td class="setting-content">
					<input
						id="setting-background-color"
						type="color"
						format="hex"
						alpha
						v-model="bgColor"
						style="height: 24px"
					/>
				</td>
			</tr>
			<tr title="What image the banner at the top should use as its background.">
				<td class="setting-label">
					<label for="setting-banner-image">Banner Image URL</label>
				</td>
				<td class="setting-content">
					<input
						id="setting-banner-image"
						type="url"
						v-model="banner"
						style="width: 4em"
					/>
				</td>
			</tr>
			<tr title="Reset all visual configuration to default settings.">
				<td class="setting-label">
					<label>Reset Visuals</label>
				</td>
				<td class="setting-content">
					<button
						id="reset-visuals"
						@click="resetVisuals()"
					>
						Reset
					</button>
				</td>
			</tr>
			<tr
				title="Save the current specified visual settings to local storage so they'll persist if the tab closes."
			>
				<td class="setting-label">
					<label>Write Visuals to Local Storage</label>
				</td>
				<td class="setting-content">
					<button
						id="save-visuals"
						@click="storeVisuals()"
					>
						Save
					</button>
				</td>
			</tr>
			<tr class="header">
				<td colspan="2"><h2>Debug</h2></td>
			</tr>
			<tr title="Whether or not to display the buff name list on the Buffs page.">
				<td class="setting-label">
					<label for="setting-buff-names">Show Buff Names & Effects</label>
				</td>
				<td class="setting-content">
					<input
						id="setting-buff-names"
						type="checkbox"
					/>
				</td>
			</tr>
			<tr
				title="Removes all saved state from local storage. Does not affect the current state of things."
			>
				<td class="setting-label">
					<label>Clear Local Storage</label>
				</td>
				<td class="setting-content">
					<button @click="clearLocalStorage()">Clear</button>
				</td>
			</tr>
		</table>
		<div class="settings-list">
			<h2>Destiny 2 Available Glyphs</h2>
			<div class="scrollable-box">
				<pre class="d-glyph">{{ identifyUnicodeSymbols(57344, 500) }}</pre>
				<pre class="d-glyph">{{ identifyUnicodeSymbols(61000, 500) }}</pre>
			</div>
		</div>
	</div>
</template>
<style scoped>
.settings-box {
	display: flex;
}
.settings-list {
	width: 18em;
	height: var(--content-height);
	display: inline;
	flex: 0 1 auto;
	margin: 0 1em;
}
table {
	flex: 0 1 auto;
	border-spacing: 0 4px;
	height: fit-content;
}
.header {
	background: none;
	margin: 0;
}
.header td {
	padding: 0;
}
tr {
	background-color: #0002;
}
td {
	padding: 1em;
}
.setting-content {
	text-align: center;
}
.scrollable-box {
	overflow-y: scroll;
	height: calc(100% - 40px);
	scrollbar-width: none;
}
</style>
