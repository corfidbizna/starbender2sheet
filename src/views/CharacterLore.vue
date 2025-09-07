<script setup lang="ts">
import useCharacterData from '@/composables/useCharacterData';

type CharacterProps = {
	characterId: string;
};
const props = defineProps<CharacterProps>();
const { character } = useCharacterData(props.characterId);
</script>
<template>
	<div
		v-if="character"
		class="centered"
	>
		<h1>{{ character.label }}, the Void Hunter</h1>
		<table class="summary">
			<tr>
				<td colspan="2"><h2>Character</h2></td>
			</tr>
			<tr>
				<td>Name:</td>
				<td>{{ character.label }}</td>
			</tr>
			<tr>
				<td>Race:</td>
				<td>Human</td>
			</tr>
			<tr>
				<td>Class:</td>
				<td>Risen</td>
			</tr>
			<tr>
				<td>Level:</td>
				<td>7</td>
			</tr>
			<tr>
				<td colspan="2"><h2>Appearance</h2></td>
			</tr>
			<tr>
				<td>Hair Color:</td>
				<td>Brown</td>
			</tr>
			<tr>
				<td>Eye Color:</td>
				<td>Blue</td>
			</tr>
			<tr>
				<td>Height:</td>
				<td>5'2"</td>
			</tr>
			<tr>
				<td>Weight:</td>
				<td>130 lbs.</td>
			</tr>
			<tr>
				<td colspan="2"><h2>Guardian Stats</h2></td>
			</tr>
			<tr>
				<td>Guardian Class:</td>
				<td>Hunter (Mostly)</td>
			</tr>
			<tr>
				<td>Subclass:</td>
				<td>Void</td>
			</tr>
			<tr>
				<td>Ghost:</td>
				<td>Roas</td>
			</tr>
			<tr>
				<td colspan="2"><h2>Description</h2></td>
			</tr>
			<tr>
				<td colspan="2">
					<div>
						Short for a teen, Kara has a boisterous personality. There's not much margin
						between him knowing your name and being your friend. He's not the sharpest
						bulb in the drawer—he left his brain cell behind in his original reality—but
						he's keen in ways that you might not expect.
					</div>
				</td>
			</tr>
		</table>
		<div class="preview">
			<img
				src="https://static.wikia.nocookie.net/kingdomhearts/images/0/00/Sora_KHIII_RM.png"
			/>
		</div>
		<div class="notes">
			<h2>Notes</h2>
			<textarea rows="25"></textarea>
		</div>
	</div>
</template>
<style>
.centered {
	text-align: center;
}
.preview {
	display: inline-block;
	margin: 2em;
	width: 20em;
}
.summary {
	display: inline-block;
	vertical-align: top;
	text-align: left;
	max-width: 20em;
}
.notes {
	display: inline-block;
	vertical-align: top;
}
.notes textarea {
	min-width: 40em;
	color: #fff;
	height: 100%;
	overflow-y: scroll;
	background-color: #4442;
	border: none;
	resize: vertical;
}
td {
	padding-right: 1em;
}
</style>
