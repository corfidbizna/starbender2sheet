<script setup lang="ts">
import CapacityBar from '@/components/CapacityBar.vue';
import LoadingModal from '@/components/LoadingModal.vue';
import useCharacterData, { type ArtifactMod } from '@/composables/useCharacterData';
import { getBGString } from '@/sharedState';
import { computed } from 'vue';
type CharacterProps = {
	characterId: string;
};
const props = defineProps<CharacterProps>();
const {
	artifactMods,
	namesOfActiveArtifactMods,
	artifactLoading,
	artifactRefresh,
	getFinalStat,
	statsLoading,
	buffsLoading,
} = useCharacterData(props.characterId);

const columns = 5;
const stageQuantitiesForUnlock = [0, 3, 5, 7, 10];

const grid = computed<ArtifactMod[][]>(() => {
	const result = [];
	const rows = artifactMods.value.length / columns;
	for (let i = 0; i < rows; i++) {
		const row: ArtifactMod[] = [];
		for (let j = 0; j < columns; j++) {
			row.push(artifactMods.value[i * 5 + j]);
		}
		result.push(row);
	}
	return result;
});
</script>
<template>
	<div v-if="artifactLoading || statsLoading || buffsLoading">
		<LoadingModal />
	</div>
	<div
		v-else
		class="seasonal-artifact"
	>
		<div
			class="rotating-bg"
			:style="getBGString('./public/svgs/Lines_SeasonalArtifact.svg')"
		></div>
		<h1 class="artifact-name">Iron Decree</h1>
		<h2 class="artifact-subtitle">Artifact</h2>
		<div class="artifact-container">
			<table class="artifact">
				<caption class="artifact-availability">
					<span>Available </span
					><span class="artifact-availability-number">{{
						getFinalStat('artifact') - namesOfActiveArtifactMods.length
					}}</span>
					<button
						@click="artifactRefresh"
						style="float: right"
					>
						Refresh Artifact
					</button>
				</caption>
				<tbody>
					<tr
						v-for="column in grid"
						:key="'column' + column[0].name"
					>
						<td
							v-for="(cell, col) in column"
							:key="cell.name"
							class="artifact-cell"
							:class="
								namesOfActiveArtifactMods.length <
									(stageQuantitiesForUnlock[col + 1] || artifactMods.length) &&
								namesOfActiveArtifactMods.length >= stageQuantitiesForUnlock[col]
									? 'edge'
									: ''
							"
						>
							<label
								v-if="!cell.hidden"
								class="artifact-mod"
								:class="
									[
										'stage' + cell.stage,
										cell.active ? 'active' : '',
										namesOfActiveArtifactMods.length <
										stageQuantitiesForUnlock[col]
											? 'disallowed'
											: '',
									].join(' ')
								"
							>
								<div class="artifact-mod-name">
									<input
										type="checkbox"
										:value="cell.name"
										v-model="namesOfActiveArtifactMods"
										:disabled="
											namesOfActiveArtifactMods.length <
												stageQuantitiesForUnlock[col] ||
											(getFinalStat('artifact') -
												namesOfActiveArtifactMods.length <=
												0 &&
												!cell.active)
										"
									/>{{ cell.name }}
								</div>
								<div class="artifact-mod-description">{{ cell.description }}</div>
							</label>
							<div
								v-else
								class="artifact-mod hidden"
								:class="
									[
										'stage' + cell.stage,
										cell.active ? 'active' : '',
										namesOfActiveArtifactMods.length <
										stageQuantitiesForUnlock[col]
											? 'disallowed'
											: '',
									].join(' ')
								"
							>
								???
							</div>
						</td>
					</tr>
					<tr class="artifact-stage-capacity">
						<td
							v-for="(cell, index) in grid[0]"
							:key="cell.stage + 'active'"
						>
							<CapacityBar
								v-bind="{
									min: stageQuantitiesForUnlock[index],
									max: stageQuantitiesForUnlock[index + 1] || artifactMods.length,
									current: namesOfActiveArtifactMods.length,
									color: '#fff',
								}"
							/>
							{{ stageQuantitiesForUnlock[index] }}
						</td>
					</tr>
				</tbody>
			</table>
		</div>
	</div>
</template>
<style>
.artifact-name {
	text-transform: uppercase;
	margin-bottom: 0;
}
.artifact-subtitle {
	margin-top: 0;
	border: none;
	margin-bottom: 1em;
}
.artifact-availability {
	border-bottom: 2px solid #fff8;
	margin-bottom: 0.25em;
	padding-bottom: 0.25em;
	text-align: left;
}
.artifact-availability-number {
	font-weight: bold;
}
.artifact-container {
	display: flex;
}
.artifact {
	border-collapse: collapse;
	/* background-color: #49a8; */
	table-layout: fixed;
	/* width: 100%; */
}
.artifact tbody {
	padding-top: 0.5em;
}
.artifact-cell {
	padding: 4px;
	border-right: 2px solid #1ff6;
	box-sizing: border-box;
	font-size: 0.8em;
}
.artifact-cell.edge {
	border-color: #1ff;
}
.artifact-mod {
	display: block;
	width: 17em;
	height: 7em;
	padding: 1em;
	border-radius: 0.5em;
	border-top: 2px solid #289;
	border-bottom: 2px solid #022;
	background-image: linear-gradient(to bottom, #0008 0%, #000a 100%);
	color: #1aa;
}
.artifact-mod.active {
	color: #1ff;
	border-top-color: #7bc;
	border-bottom-color: #055;
	background-image: linear-gradient(to top, #366 0%, #388 100%);
}
.artifact-mod.disallowed {
	border-top-color: #666;
	border-bottom-color: #000;
	color: #444;
	background-image: linear-gradient(to top, #000 0%, #000 100%);
}
.artifact-mod.disallowed.active {
	border-top-color: #930;
	border-bottom-color: #000;
	color: #900;
	background-image: linear-gradient(to top, #300 0%, #100 100%);
}
.artifact-mod.hidden {
	text-align: center;
}
.artifact-mod-name input {
	width: 0;
	visibility: hidden;
}
.artifact-mod-name {
	text-align: center;
	margin-bottom: 0.5em;
	font-weight: bold;
	border-bottom: 2px solid #0004;
}
.artifact-mod-description {
	text-align: left;
}
.artifact-stage-capacity {
	text-align: right;
	font-weight: bold;
}
.artifact-stage-capacity > td {
	padding: 0 4px;
}
</style>
