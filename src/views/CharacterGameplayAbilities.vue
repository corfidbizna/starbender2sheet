<script setup lang="ts">
import type {
	Ability,
	AbilityClass,
	ActionResourceKey,
	CharacterNames,
	Element,
	StatsCalculatedKey,
} from '@/composables/useCharacterData';
import useCharacterData, { elements } from '@/composables/useCharacterData';
import CapacityBar from '@/components/CapacityBar.vue';
import { computed, ref } from 'vue';

type CharacterProps = {
	characterId: CharacterNames;
};
const props = defineProps<CharacterProps>();
const {
	character,
	statsBase,
	abilities,
	abilitiesLoading,
	getFinalStat,
	actionResources,
	actionResourceUpdate,
} = useCharacterData(props.characterId);
const mainAbilities = computed<Ability[]>(() => {
	return abilities.value.filter((ability) => ability.type !== 'Subcomponent');
});
const filteredAbilities = computed<Ability[]>(() => {
	return mainAbilities.value.filter((ability) => {
		if (abilityFilter.value === 'Universal') {
			return true;
		}
		return ability.type === abilityFilter.value;
	});
});
const classIcon = computed<string>(() => {
	const gClass = statsBase.value.guardianClass;
	const classMap: Record<string, string> = {
		Titan: '/public/svgs/class_titan_proportional.svg',
		Warlock: '/public/svgs/class_warlock_proportional.svg',
		Hunter: '/public/svgs/class_hunter_proportional.svg',
	};
	return classMap[gClass] || '/public/svgs/Tricorn.svg';
});
const energyList: Record<string, string> = {
	Grenade: '/public/svgs/stat_discipline.svg',
	Melee: '/public/svgs/stat_melee.svg',
	Class: classIcon.value,
	Universal: '/public/svgs/Tricorn.svg',
};
const subclassColor = computed<string>(() => {
	const subclass = statsBase.value.guardianSubclass as Element;
	return elements[subclass] || '#FFFFFF'; // Kinetic
});
const abilityFilter = ref<string>('Universal');
const updateEnergy = (energyType: AbilityClass, energyUsed: number) => {
	const key = ('energy' + energyType.split(' ')[0]) as ActionResourceKey;
	actionResourceUpdate(key, -energyUsed);
};
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
								style="width: 100%"
							>
								<CapacityBar
									class="ability-bar"
									v-bind="{
										label: 'Super',
										stat: 'energySuper',
										color: subclassColor,
										colorMax: '#ff6',
										max: getFinalStat('energySuper'),
										current: actionResources.energySuper,
									}"
									:characterId="characterId"
								/>
							</td>
							<td>
								<input
									style="width: 4em"
									type="number"
									v-model="actionResources.energySuper"
								/>
							</td>
							<td>⁄</td>
							<td>{{ getFinalStat('energySuper') }}</td>
						</tr>
						<tr
							v-for="energyType in Object.keys(energyList)"
							:key="energyType"
						>
							<td>
								<button
									class="ability-button category"
									:style="'background-color: ' + subclassColor"
									value="energyType"
									@click="abilityFilter = energyType"
								>
									<img :src="energyList[energyType]" />
								</button>
							</td>
							<td style="font-weight: normal">{{ energyType }}</td>
							<td style="width: 100%">
								<CapacityBar
									class="ability-bar"
									v-bind="{
										label: energyType,
										stat: 'energy' + energyType,
										color: energyType === 'Universal' ? '#eee' : subclassColor,
										max: getFinalStat(
											('energy' + energyType) as StatsCalculatedKey,
										),
										current: actionResources['energy' + energyType],
									}"
									:characterId="characterId"
								/>
							</td>
							<td>
								<input
									style="width: 4em"
									type="number"
									v-model="actionResources['energy' + energyType]"
								/>
							</td>
							<td>⁄</td>
							<td>
								{{ getFinalStat(('energy' + energyType) as StatsCalculatedKey) }}
							</td>
						</tr>
					</tbody>
				</table>
			</div>
			<h2>{{ abilityFilter === 'Universal' ? 'All' : abilityFilter }} Abilities</h2>
			<div class="gameplay-ability-list">
				<div
					v-for="ability in filteredAbilities"
					:key="ability.name"
					class="ability-box"
				>
					<h2>
						{{ ability.name }}<span class="ability-subtitle">{{ ability.type }}</span>
					</h2>
					<div
						v-if="ability.flavortext"
						class="ability-flavortext"
						style="font-style: italic"
					>
						{{ ability.flavortext }}
					</div>
					<button
						class="cast-ability-button"
						@click="updateEnergy(ability.type, ability.energyMax)"
						:disabled="
							ability.energyMax >
							actionResources['energy' + ability.type.split(' ')[0]]
						"
					>
						Use
					</button>
					<div>{{ ability.description }}</div>
				</div>
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
.ability-header button * {
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
	top: -3px;
	position: relative;
	left: -6px;
	filter: invert(100%);
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
	height: calc(100vh - 310px);
	overflow-y: scroll;
	scrollbar-width: none;
	font-size: 0.9rem;
}
.ability-box {
	margin: 0.5em;
	background-color: #0004;
}
.cast-ability-button {
	height: 3em;
	width: 3em;
	background-color: #0004;
}
.cast-ability-button:disabled {
	color: #888;
}
</style>
