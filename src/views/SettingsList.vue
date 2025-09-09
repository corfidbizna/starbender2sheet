<script setup lang="ts">
const identifyUnicodeSymbols = (start: number, length: number) => {
	const strings = [];
	for (let i = start; i < start + length; i++) {
		strings.push(String.fromCharCode(i) + ' :: ' + i);
	}
	return strings.join('\n');
};
</script>
<template>
	<div>
		<div>
			<h1>Settings Panel</h1>
			<button>Save Changes</button>
			<button>Reset to Defaults</button>
		</div>
		<table class="settings-box">
			<tr class="header">
				<td colspan="2"><h2>General</h2></td>
			</tr>
			<tr>
				<td>Use Tiles for Distance</td>
				<td><input type="checkbox" /></td>
			</tr>
			<tr>
				<td>Auto-Subtract Actions</td>
				<td><input type="checkbox" /></td>
			</tr>
			<tr>
				<td>Auto-Roll Hit with Attack</td>
				<td><input type="checkbox" /></td>
			</tr>
			<tr class="header">
				<td colspan="2"><h2>Visuals</h2></td>
			</tr>
			<tr>
				<td>Auto-Roll Hit with Attack</td>
				<td><input type="checkbox" /></td>
			</tr>
		</table>
		<pre class="d-glyph">{{ identifyUnicodeSymbols(57344, 500) }}</pre>
		<pre class="d-glyph">{{ identifyUnicodeSymbols(61000, 500) }}</pre>
	</div>
</template>
<style scoped>
.settings-box {
	display: flex;
	align-items: center;
}
table {
	border-spacing: 0 4px;
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
</style>
