<script setup lang="ts">
import AbilityItemRow from '@/components/AbilityItemRow.vue';
import DGlyph from '@/components/DGlyph.vue';
import StatCapacityBox from '@/components/StatCapacityBox.vue';
import LoadingModal from '@/components/LoadingModal.vue';
import type {
	Ability,
	AbilityClass,
	CapacityBoxStatField,
	CharacterNames,
} from '@/composables/useCharacterData';
import useCharacterData, { elements } from '@/composables/useCharacterData';
import { actionLog } from '@/sharedState';
import { computed, ref } from 'vue';

type CharacterProps = {
	characterId: CharacterNames;
};
const props = defineProps<CharacterProps>();
const {
	character,
	statsLoading,
	getFinalStat,
	actionResources,
	abilities,
	abilitiesLoading,
	subclassGet,
	subclassSet,
} = useCharacterData(props.characterId);
const subclassBackground = computed<string>(() => {
	return 'background-color: var(--color-' + subclassGet.value.toLocaleLowerCase() + ')';
});
const subclassAllowed = (subclass: string) => {
	return (
		abilities.value.findIndex(
			(ability) => ability.element === subclass && ability.type !== 'Subcomponent',
		) >= 0
	);
};
const shouldOverrideSubclass = ref<boolean>(false);
const subclassOverride = ref<string>('');
const abilityTypes = computed<AbilityClass[]>(() => [
	'Super' as AbilityClass,
	'Grenade' as AbilityClass,
	'Melee' as AbilityClass,
	'Class' as AbilityClass,
	'Universal' as AbilityClass,
]);
const listKey = ref<string>('');
const list = computed<Ability[]>(() =>
	abilities.value.filter(
		(ability) => ability.type.includes(listKey.value) && ability.type !== 'Subcomponent',
	),
);
const listIncludes = computed<Ability[]>(() =>
	list.value.filter(
		(ability) =>
			ability.element === subclassGet.value &&
			(shouldOverrideSubclass.value
				? ability.element.includes(subclassOverride.value)
				: true),
	),
);
const listExcludes = computed<Ability[]>(() =>
	list.value.filter(
		(ability) =>
			ability.element !== subclassGet.value &&
			(shouldOverrideSubclass.value
				? ability.element.includes(subclassOverride.value)
				: true),
	),
);
const energyCapacity = computed<CapacityBoxStatField[]>(() => {
	return [
		{
			label: 'Super',
			stat: 'energySuper',
			color: elements[subclassGet.value],
			colorMax: '#ff6',
			max: getFinalStat('energySuper'),
			current: actionResources.value.energySuper,
		},
		{
			label: 'Class',
			stat: 'energyClass',
			color: elements[subclassGet.value],
			max: getFinalStat('energyClass'),
			current: actionResources.value.energyClass,
		},
		{
			label: 'Melee',
			stat: 'energyMelee',
			color: elements[subclassGet.value],
			max: getFinalStat('energyMelee'),
			current: actionResources.value.energyMelee,
		},
		{
			label: 'Grenade',
			stat: 'energyGrenade',
			color: elements[subclassGet.value],
			max: getFinalStat('energyGrenade'),
			current: actionResources.value.energyGrenade,
		},
		{
			label: 'Universal',
			stat: 'energyUniversal',
			color: '#eee',
			max: getFinalStat('energyUniversal'),
			current: actionResources.value.energyUniversal,
		},
	];
});
</script>
<template>
	<div v-if="!character || abilitiesLoading || statsLoading"><LoadingModal /></div>
	<div
		class="CharacterSkills"
		v-else
	>
		<!-- <h1>Class Ability configuration for {{ character.label }}</h1> -->
		<div class="subclass-infos">
			<h1 class="subclass">{{ subclassGet }}</h1>
			<table class="subclass-elements">
				<tbody>
					<tr>
						<td>
							<button
								class="solar"
								:disabled="!subclassAllowed('Solar')"
								@click="subclassSet('Solar')"
							>
								<div class="subclass-symbol"></div>
							</button>
						</td>
						<td>
							<button
								class="arc"
								:disabled="!subclassAllowed('Arc')"
								@click="subclassSet('Arc')"
							>
								<div class="subclass-symbol"></div>
							</button>
						</td>
					</tr>
					<tr>
						<td>
							<button
								class="void"
								:disabled="!subclassAllowed('Void')"
								@click="subclassSet('Void')"
							>
								<div class="subclass-symbol"></div>
							</button>
						</td>
						<td></td>
					</tr>
				</tbody>
			</table>
			<div>
				<div
					class="subclass-box"
					:style="subclassBackground"
				>
					<DGlyph
						class="subclass-symbol"
						v-bind="{ name: subclassGet }"
					/>
				</div>
			</div>

			<StatCapacityBox
				v-bind="{
					label: 'Energy',
					data: energyCapacity,
				}"
				:characterId="characterId"
			/>
			<h2>Show Abilities</h2>
			<select v-model="listKey">
				<option value="">ALL</option>
				<option
					v-for="ability in abilityTypes"
					:key="ability"
					:value="ability"
				>
					{{ ability }}
				</option>
			</select>
			<h2>Override Listed Subclass</h2>
			<div class="subclass-override">
				<label
					><input
						type="checkbox"
						v-model="shouldOverrideSubclass"
					/>Override to</label
				><select
					:disabled="!shouldOverrideSubclass"
					v-model="subclassOverride"
				>
					<option value="">ALL</option>
					<option
						v-for="element in Object.keys(elements).filter((element) =>
							subclassAllowed(element),
						)"
						:key="element"
						:value="element"
					>
						{{ element }}
					</option>
				</select>
			</div>
			<h2>Action Log</h2>
			<textarea
				v-model="actionLog"
				readonly
				class="action-log"
			></textarea>
		</div>
		<div class="subclass-contents">
			<div class="subclass-ability-category">
				<div class="subclass-ability-list">
					<div
						v-for="ability in listIncludes"
						:key="ability.name"
					>
						<AbilityItemRow
							v-bind="ability"
							:character-id="characterId"
						/>
					</div>
					<div
						v-for="ability in listExcludes"
						:key="ability.name"
						class="disabled"
					>
						<AbilityItemRow
							v-bind="ability"
							:character-id="characterId"
						/>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>
<style>
.CharacterSkills {
	position: relative;
	display: flex;
}
.subclass-infos {
	position: fixed;
	display: flex;
	flex-direction: column;
	width: 18em;
	padding: 10px;
	padding-top: 8em;
	height: calc(100vh - 205px);
}
.subclass {
	position: absolute;
	left: 5.5em;
	top: 0;
	margin: 0.5em 0;
}
.subclass-elements {
	border-collapse: collapse;
	position: absolute;
	top: 1em;
	left: 1em;
	transition:
		transform 0.1s,
		opacity 0.1s;
	transform: rotate(-45deg) scale(75%);
	opacity: 0.75;
}
.subclass-elements:hover {
	transition:
		transform 0.1s,
		opacity 0.1;
	transform: rotate(-45deg) scale(100%);
	opacity: 1;
}
.subclass-elements td {
	padding: 0;
}
.subclass-elements button {
	font-family: 'Destiny Symbols Common';
	width: 4em;
	height: 4em;
	margin: 0;
}
.subclass-elements button.solar {
	background-color: var(--color-solar);
}
.subclass-elements button:disabled.solar {
	background-color: color-mix(in srgb, var(--color-solar) 50%, #8888);
}
.subclass-elements button.arc {
	background-color: var(--color-arc);
}
.subclass-elements button:disabled.arc {
	background-color: color-mix(in srgb, var(--color-arc) 50%, #8888);
}
.subclass-elements button.void {
	background-color: var(--color-void);
}
.subclass-elements button:disabled.void {
	background-color: color-mix(in srgb, var(--color-void) 50%, #8888);
}
.subclass-elements button:hover:enabled {
	filter: brightness(110%);
}

.subclass-box {
	width: 5em;
	height: 5em;
	transform: rotate(-45deg);
	border: 2px solid #fff8;
	align-content: space-evenly;
	position: absolute;
	left: 5.75em;
	top: 1.75em;
}
.subclass-symbol {
	transform: rotate(45deg);
	text-align: center;
	font-size: 1.5em;
}
.subclass-box .subclass-symbol {
	font-size: 3em;
}

.subclass-override {
	display: flex;
}
.subclass-override select {
	margin-left: 0.5em;
	flex-grow: 1;
}

.action-log {
	flex: 1;
	width: auto;
}
.subclass-contents {
	margin-left: 20em;
	display: flex;
	flex-direction: row;
	height: 100%;
}
.subclass-ability-category {
	margin: 0 4px;
}
.subclass-ability-list {
}
</style>
