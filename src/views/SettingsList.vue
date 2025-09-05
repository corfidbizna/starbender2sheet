<script setup lang="ts"></script>
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
	</div>
</template>
<style scoped>
.settings-box {
	display: flex;
	align-items: center;
}
h2 {
	text-align: left;
	text-transform: uppercase;
	font-weight: 100;
	margin-top: 1em;
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
