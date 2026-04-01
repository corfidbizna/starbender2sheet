<script setup lang="ts">
import type {
	Ability,
	ActionResourceDisplayKey,
	ActionResourceKey,
	CharacterNames,
	Element,
	StatName,
} from '@/composables/useCharacterData';
import useCharacterData, { elements } from '@/composables/useCharacterData';
import CapacityBar from '@/components/CapacityBar.vue';
import { computed, ref } from 'vue';
import AbilityItemRow from '@/components/AbilityItemRow.vue';
import SpinBox from '@/components/SpinBox.vue';

type CharacterProps = {
	characterId: CharacterNames;
};
const props = defineProps<CharacterProps>();
const {
	character,
	statsBase,
	statsBuffed,
	abilities,
	abilitiesLoading,
	getFinalStat,
	actionResources,
	actionResourcesDisplay,
} = useCharacterData(props.characterId);
const mainAbilities = computed<Ability[]>(() => {
	return abilities.value.filter((ability) => ability.type !== 'Subcomponent');
});
const filteredAbilities = computed<Ability[]>(() => {
	return mainAbilities.value.filter((ability) => {
		if (ability.element === Object.keys(elements)[actionResources.value.subclassIndex]) {
			if (abilityFilter.value === 'All') {
				return true;
			}
			return ability.type === abilityFilter.value;
		}
		return false;
	});
});
const classIcon = computed<string>(() => {
	const gClass = statsBase.value.guardianClass;
	const classMap: Record<string, string> = {
		Titan: './svgs/class_titan_proportional.svg',
		Warlock: './svgs/class_warlock_proportional.svg',
		Hunter: './svgs/class_hunter_proportional.svg',
	};
	return classMap[gClass] || '/public/svgs/Tricorn.svg';
});
const energyTypes = computed<string[]>(() => {
	const list = ['Grenade', 'Melee', 'Class', 'Universal'];
	if (statsBuffed.value.energyRitual.total > 0) {
		list.splice(3, 0, 'Ritual');
	}
	return list;
});
const energyImage: Record<string, string> = {
	Super: './svgs/stat_intellect.svg',
	Grenade: './svgs/stat_discipline.svg',
	Melee: './svgs/stat_melee.svg',
	Class: classIcon.value,
	Universal: './svgs/Tricorn.svg',
	Ritual: './svgs/Tricorn.svg',
};
const subclassColor = computed<string>(() => {
	const subclass = Object.keys(elements)[actionResources.value.subclassIndex] as Element;
	return elements[subclass] || '#FFFFFF'; // Kinetic
});
const abilityFilter = ref<string>('All');
</script>
<template>
	<div
		class="ability-gameplay-block"
		v-if="character && !abilitiesLoading"
	>
		<div
			v-if="mainAbilities.length === 0"
			style="text-align: center"
		>
			<h1>Somehow, you have no abilities : /</h1>
		</div>
		<div v-else>
			<div class="ability-header">
				<button
					class="ability-button super"
					:style="'background-color: ' + subclassColor"
					@click="abilityFilter = 'Super'"
				>
					<img src="/public/svgs/stat_intellect.svg" />
				</button>
				<table
					class="ability-gameplay-table"
					style="width: 100%"
				>
					<tbody>
						<tr>
							<td
								colspan="3"
								style="width: 100%; position: relative"
							>
								<CapacityBar
									class="ability-bar"
									v-bind="{
										label: 'Super',
										stat: 'energySuperUsed',
										color: subclassColor + '88',
										colorFull: '#ff6',
										max: getFinalStat('energySuper'),
										current: actionResourcesDisplay.energySuper,
									}"
									:characterId="characterId"
								/>
								<span class="super-bar-ticks"></span>
							</td>
							<td>
								<SpinBox
									style="width: 4em"
									v-bind="{
										value: actionResources.energySuperUsed,
										max: getFinalStat('energySuper'),
										inverted: true,
									}"
									v-model="actionResources.energySuperUsed"
								/>
							</td>
							<td>⁄</td>
							<td>{{ getFinalStat('energySuper') }}</td>
							<td><button @click="actionResources.energySuperUsed = 0">⤒</button></td>
						</tr>
						<tr
							v-for="energyType in energyTypes"
							:key="energyType"
							:title="
								energyType +
								' Energy: ' +
								statsBuffed[('energy' + energyType) as StatName].total +
								'\n' +
								statsBuffed[('energy' + energyType) as StatName].summary.join('\n')
							"
						>
							<td>
								<button
									class="ability-button category"
									:style="'background-color: ' + subclassColor"
									value="energyType"
									@click="abilityFilter = energyType"
								>
									<img :src="energyImage[energyType]" />
								</button>
							</td>
							<td style="font-weight: normal">{{ energyType }}</td>
							<td style="width: 100%">
								<CapacityBar
									class="ability-bar"
									v-bind="{
										label: energyType,
										stat: 'energy' + energyType + 'Used',
										color:
											energyType === 'Universal'
												? '#eee8'
												: subclassColor + '88',
										colorFull:
											energyType === 'Universal' ? '#eee' : subclassColor,
										max: getFinalStat(('energy' + energyType) as StatName),
										current:
											actionResourcesDisplay[
												('energy' + energyType) as ActionResourceDisplayKey
											],
									}"
									:characterId="characterId"
								/>
							</td>
							<td>
								<SpinBox
									style="width: 4em"
									v-bind="{
										value: actionResources[
											('energy' + energyType + 'Used') as ActionResourceKey
										],
										max: getFinalStat(('energy' + energyType) as StatName),
										inverted: true,
									}"
									v-model="
										actionResources[
											('energy' + energyType + 'Used') as ActionResourceKey
										]
									"
								/>
							</td>
							<td>⁄</td>
							<td>
								{{ getFinalStat(('energy' + energyType) as StatName) }}
							</td>
							<td>
								<button
									@click="
										actionResources[
											('energy' + energyType + 'Used') as ActionResourceKey
										] = 0
									"
								>
									⤒
								</button>
							</td>
						</tr>
					</tbody>
				</table>
			</div>
			<h2>
				<span>{{ abilityFilter }} Abilities</span>
				<span style="float: right">
					Show:
					<select
						style="width: 10em"
						v-model="abilityFilter"
					>
						<option value="All">ALL</option>
						<option
							v-for="ability in Object.keys(energyImage)"
							:key="ability"
							:value="ability"
						>
							{{ ability }}
						</option>
					</select>
				</span>
			</h2>
			<div class="gameplay-ability-list">
				<AbilityItemRow
					v-for="ability in filteredAbilities"
					:key="ability.name"
					v-bind="ability"
					:character-id="characterId"
				/>
			</div>
		</div>
	</div>
	<div v-else><h1>Loading abilities…</h1></div>
</template>
<style>
.ability-gameplay-table {
	border-collapse: collapse;
	text-align: right;
}
.ability-gameplay-table td {
	padding: 0 0.25em;
	font-weight: bold;
}
.ability-header .ability-bar {
	height: 1em;
}
.ability-header {
	position: relative;
	padding-left: 2em;
	padding-top: 1em;
}
.ability-header > button * {
	filter: invert(100%);
}
.ability-header .super-bar {
	margin-bottom: 0;
	margin-left: 2.25em;
	width: calc(100% - 6.1em);
	margin-top: 1.1em;
	height: 1em;
}
.ability-button.super {
	width: 2.3em;
	height: 2.3em;
	transform: rotate(45deg);
	position: absolute;
	top: 8px;
	left: 8px;
	z-index: 1;
}
.ability-button.super img {
	width: 2.5em;
	transform: rotate(-45deg);
	top: -2px;
	position: absolute;
	left: -2px;
	filter: invert(100%);
}
.super-bar-ticks {
	position: absolute;
	left: 0;
	top: 1px;
	width: 100%;
	height: calc(1em - 2px);
	background-image: linear-gradient(
		90deg,
		#0000 calc(25% - 1px),
		#0004 calc(25% - 1px),
		calc(25% + 1px),
		#0000 calc(25% + 1px),
		#0000 calc(50% - 1px),
		#0004 calc(50% - 1px),
		calc(50% + 1px),
		#0000 calc(50% + 1px),
		#0000 calc(75% - 1px),
		#0004 calc(75% - 1px),
		calc(75% + 1px),
		#0000 calc(75% + 1px)
	);
}
.ability-button:hover,
.ability-button:hover {
	filter: brightness(110%);
}
.ability-category-list {
	margin-left: 2.5em;
}
.ability-category .ability-bar {
	height: 1em;
}
.ability-button.category {
	width: 1.6em;
	height: 1.6em;
	padding: 0;
	position: relative;
}
.ability-button.category > img {
	width: 1.5em;
	filter: invert(100%);
	position: absolute;
	top: 0;
	left: 0;
}
.ability-category {
	display: flex;
	align-items: center;
}
.ability-subtitle {
	font-size: 0.9em;
	color: #fff8;
}
.ability-subtitle::before {
	content: ' // ';
}
.gameplay-ability-list {
	height: calc(100vh - 330px);
	overflow-y: scroll;
	scrollbar-width: thin;
	font-size: 0.9rem;
}
.gameplay-ability-list > * > :first-child {
	margin-top: 0;
}
.gameplay-ability-list > * > :last-child {
	margin-bottom: 0;
}
</style>
