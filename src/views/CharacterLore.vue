<script setup lang="ts">
import useCharacterData, {
	type CharacterNames,
	getScoreDescription,
} from '@/composables/useCharacterData';
import BGImage from '@/components/BGImage.vue';
import { computed, ref } from 'vue';
import LoadingModal from '@/components/LoadingModal.vue';

type CharacterProps = {
	characterId: CharacterNames;
};
const props = defineProps<CharacterProps>();
const { character, statsBuffed, statsBase, subclassGet, statsLoading } = useCharacterData(
	props.characterId,
);

const characterTitle = computed<string>(() =>
	character.value && !statsLoading.value
		? character.value.label + ', the ' + subclassGet.value + ' ' + statsBase.value.guardianClass
		: 'Loading…',
);
const currentImageURL = ref<string>(
	character.value?.images
		? character.value.images[0]
		: 'https://static.wikia.nocookie.net/kingdomhearts/images/0/00/Sora_KHIII_RM.png',
);
</script>
<template>
	<div v-if="!character || statsLoading">
		<LoadingModal />
	</div>
	<div
		v-else
		class="centered"
	>
		<BGImage :bgNames="['Lore', 'Lore_a']" />
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
						<div>Character description goes here.</div>
					</td>
				</tr>
			</tbody>
		</table>
		<div class="preview">
			<h1>
				{{ characterTitle }}
			</h1>
			<select
				v-if="!!character.images"
				v-model="currentImageURL"
			>
				<option
					v-for="url in character.images"
					:key="url"
				>
					{{ url }}
				</option>
			</select>
			<img :src="currentImageURL" />
		</div>
		<div class="ability-scores">
			<h2>Ability Scores</h2>
			<div>
				<span>Strength </span><span class="score">({{ statsBuffed.strScore.total }})</span>
			</div>
			<div class="score-summary">
				{{ getScoreDescription('str', statsBuffed.strScore.total) }}
			</div>
			<div>
				<span>Dexterity </span><span class="score">({{ statsBuffed.dexScore.total }})</span>
			</div>
			<div class="score-summary">
				{{ getScoreDescription('dex', statsBuffed.dexScore.total) }}
			</div>
			<div>
				<span>Constitution </span
				><span class="score">({{ statsBuffed.conScore.total }})</span>
			</div>
			<div class="score-summary">
				{{ getScoreDescription('con', statsBuffed.conScore.total) }}
			</div>
			<div>
				<span>Intelligence </span
				><span class="score">({{ statsBuffed.intScore.total }})</span>
			</div>
			<div class="score-summary">
				{{ getScoreDescription('int', statsBuffed.intScore.total) }}
			</div>
			<div>
				<span>Wisdom </span><span class="score">({{ statsBuffed.wisScore.total }})</span>
			</div>
			<div class="score-summary">
				{{ getScoreDescription('wis', statsBuffed.wisScore.total) }}
			</div>
			<div>
				<span>Charisma </span><span class="score">({{ statsBuffed.chaScore.total }})</span>
			</div>
			<div class="score-summary">
				{{ getScoreDescription('cha', statsBuffed.chaScore.total) }}
			</div>
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
	display: inline-flex;
	flex-direction: column;
	margin: 1em;
	width: 24em;
}
.preview img {
	height: 24em;
	width: fit-content;
	align-self: center;
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
