<script setup lang="ts">
import useCharacterData, { type CharacterNames } from '@/composables/useCharacterData';

type CharacterProps = {
	characterId: CharacterNames;
};
const props = defineProps<CharacterProps>();
const { character, stats, statsBase } = useCharacterData(props.characterId);
</script>
<template>
	<div
		v-if="character"
		class="centered"
	>
		<!-- <h1>{{ character.label }}, the Void Hunter</h1> -->
		<table class="summary">
			<tbody>
				<tr>
					<td colspan="2"><h2>Character</h2></td>
				</tr>
				<tr>
					<td>Name:</td>
					<td>{{ character.label }}</td>
				</tr>
				<tr>
					<td>Race:</td>
					<td>{{ statsBase.race }}</td>
				</tr>
				<tr>
					<td>Class:</td>
					<td>{{ statsBase.class }}</td>
				</tr>
				<tr>
					<td>Level:</td>
					<td>{{ statsBase.cpl }}</td>
				</tr>
				<tr>
					<td colspan="2"><h2>Appearance</h2></td>
				</tr>
				<tr>
					<td>Hair Color:</td>
					<td>{{ statsBase.colorHair }}</td>
				</tr>
				<tr>
					<td>Eye Color:</td>
					<td>{{ statsBase.colorEye }}</td>
				</tr>
				<tr>
					<td>Height:</td>
					<td>{{ statsBase.height }}</td>
				</tr>
				<tr>
					<td>Weight:</td>
					<td>{{ statsBase.weight }}</td>
				</tr>
				<tr>
					<td colspan="2"><h2>Guardian Stats</h2></td>
				</tr>
				<tr>
					<td>Guardian Class:</td>
					<td>{{ statsBase.guardianClass }}</td>
				</tr>
				<tr>
					<td>Subclass:</td>
					<td>{{ statsBase.guardianSubclass }}</td>
				</tr>
				<tr>
					<td>Ghost:</td>
					<td>{{ statsBase.nameGhost }}</td>
				</tr>
				<tr>
					<td colspan="2"><h2>Description</h2></td>
				</tr>
				<tr>
					<td colspan="2">
						<div>
							Short for a teen, Kara has a boisterous personality. There's not much
							margin between him knowing your name and being your friend. He's not the
							sharpest bulb in the drawer—he left his brain cell behind in his
							original reality—but he's keen in ways that you might not expect.
						</div>
					</td>
				</tr>
			</tbody>
		</table>
		<div class="preview">
			<h1>
				{{ character.label }}, the {{ statsBase.guardianSubclass }}
				{{ statsBase.guardianClass }}
			</h1>
			<img
				src="https://static.wikia.nocookie.net/kingdomhearts/images/0/00/Sora_KHIII_RM.png"
			/>
		</div>
		<div class="ability-scores">
			<h2>Ability Scores</h2>
			<div>
				<span>Strength </span><span class="score">({{ stats.strScore }})</span>
			</div>
			<div class="score-summary">
				He will challenge you to an arm wrestle and be <i>fairly</i> confident about it.
			</div>
			<div>
				<span>Dexterity </span><span class="score">({{ stats.dexScore }})</span>
			</div>
			<div class="score-summary">
				I mean, are you trying to say you <i>can't</i> just parkor up the side of a
				skyscraper?
			</div>
			<div>
				<span>Constitution </span><span class="score">({{ stats.conScore }})</span>
			</div>
			<div class="score-summary">
				Fairly solidly built. There is quite a lot he can bounce back from.
			</div>
			<div>
				<span>Intelligence </span><span class="score">({{ stats.intScore }})</span>
			</div>
			<div class="score-summary">He's not the sharpest bulb in the shed.</div>
			<div>
				<span>Wisdom </span><span class="score">({{ stats.wisScore }})</span>
			</div>
			<div class="score-summary">He left his brain cell in his original reality.</div>
			<div>
				<span>Charisma </span><span class="score">({{ stats.chaScore }})</span>
			</div>
			<div class="score-summary">Fairly easy to get along with.</div>
		</div>
		<div class="notes">
			<h2>Notes</h2>
			<textarea rows="25"></textarea>
		</div>
	</div>
</template>
<style scoped>
.centered {
	text-align: center;
}
.preview {
	display: inline-block;
	margin: 1em;
	width: 24em;
}
.summary {
	display: inline-block;
	vertical-align: top;
	text-align: left;
	max-width: 24em;
	/* background-color: #0008;
	padding-right: 2px solid #fff; */
}
.ability-scores {
	display: inline-block;
	text-align: left;
	width: 24em;
	vertical-align: top;
}
.ability-scores div {
	margin: 0.25em;
}
.notes {
	display: block;
	vertical-align: top;
}
.notes textarea {
	/* min-width: 32em; */
	width: 100%;
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
.score-summary {
	/* font-style: italic;
	padding-left: 1em; */
	padding-bottom: 0.5em;
}
.score {
	font-weight: 100;
	text-align: right;
	opacity: 80%;
}
</style>
