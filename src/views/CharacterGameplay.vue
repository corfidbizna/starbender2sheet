<script setup lang="ts">
import { computed } from 'vue';
import useCharacterData, {
	type StatBoxInfo,
	type BarBoxStatField,
	makeComputedOfStats,
	type CapacityBoxStatField,
	sizeMap,
} from '@/composables/useCharacterData';
import StatBarsBox from '@/components/StatBarsBox.vue';
import LoadingModal from '@/components/LoadingModal.vue';
import StatCapacityBox from '@/components/StatCapacityBox.vue';
type CharacterProps = {
	characterId: string;
};
const props = defineProps<CharacterProps>();

const {
	character,
	statsBase,
	stats,
	actionResources,
	buffsTallied,
	statsLoading,
	statsRefresh,
	skills,
	skillsLoading,
	skillsRefresh,
} = useCharacterData(props.characterId);

const subclassColor = computed<string>(() => {
	const subclass = statsBase.value.guardianSubclass;
	if (subclass === 'Solar') {
		return '#F16F27';
	}
	if (subclass === 'Void') {
		return '#B283CC';
	}
	if (subclass === 'Arc') {
		return '#7AECF3';
	}
	if (subclass === 'Stasis') {
		return '#4D87FF';
	}
	if (subclass === 'Strand') {
		return '#35E366';
	}
	return '#FFFFFF'; // Kinetic
});
const statInfo = computed<StatBoxInfo>(
	makeComputedOfStats(stats, buffsTallied, 'Ability Scores', [
		'str',
		'dex',
		'con',
		'int',
		'wis',
		'cha',
	]),
);
const savesInfo = computed<StatBoxInfo>(
	makeComputedOfStats(stats, buffsTallied, 'Saving Throws', ['fort', 'ref', 'will']),
);
const actionsCapacity = computed<CapacityBoxStatField[]>(() => {
	return [
		{
			label: 'Moves',
			stat: 'actionsMove',
			max: stats.value.actionsMove,
			current: actionResources.value.actionsMove,
		},
		{
			label: 'Attacks',
			stat: 'actionsAttack',
			max: stats.value.actionsAttack,
			current: actionResources.value.actionsAttack,
		},
		{
			label: 'Reactions',
			stat: 'actionsReaction',
			max: stats.value.actionsReaction,
			current: actionResources.value.actionsReaction,
		},
	];
});
const ammoCapacity = computed<CapacityBoxStatField[]>(() => {
	return [
		{
			label: 'Kinetic',
			stat: 'ammoKinetic',
			color: '#eee',
			max: stats.value.capacityKinetic,
			current: actionResources.value.ammoKinetic,
		},
		{
			label: 'Special',
			stat: 'ammoSpecial',
			color: '#7AF48B',
			max: stats.value.capacitySpecial,
			current: actionResources.value.ammoSpecial,
		},
		{
			label: 'Heavy',
			stat: 'ammoHeavy',
			color: '#B286FF',
			max: stats.value.capacityHeavy,
			current: actionResources.value.ammoHeavy,
		},
	];
});
const energyCapacity = computed<CapacityBoxStatField[]>(() => {
	return [
		{
			label: 'Super',
			stat: 'energySuper',
			color: subclassColor.value,
			max: stats.value.energySuper,
			current: actionResources.value.energySuper,
		},
		{
			label: 'Class',
			stat: 'energyClass',
			color: subclassColor.value,
			max: stats.value.energyClass,
			current: actionResources.value.energyClass,
		},
		{
			label: 'Melee',
			stat: 'energyMelee',
			color: subclassColor.value,
			max: stats.value.energyMelee,
			current: actionResources.value.energyMelee,
		},
		{
			label: 'Grenade',
			stat: 'energyGrenade',
			color: subclassColor.value,
			max: stats.value.energyGrenade,
			current: actionResources.value.energyGrenade,
		},
		{
			label: 'Universal',
			stat: 'energyUniversal',
			color: '#eee',
			max: stats.value.energyUniversal,
			current: actionResources.value.energyUniversal,
		},
	];
});
const skillsInfo = computed<StatBoxInfo>(() => {
	const fieldArray = <BarBoxStatField[]>[];
	skills.value.forEach((skill) => {
		fieldArray.push({ label: skill.Name, stat: skill.Name, value: skill.Bonus });
	});
	return {
		label: 'Skills',
		data: fieldArray,
	};
});
</script>
<template>
	<div
		class="CharacterGameplay"
		v-if="character"
	>
		<div v-if="statsLoading || skillsLoading">
			<LoadingModal />
		</div>
		<div v-else>
			<h1>Gameplay for {{ character.label }}</h1>
			<p>
				<button
					@click="
						statsRefresh();
						skillsRefresh();
					"
				>
					Refresh Info
				</button>
			</p>
			<div class="stat-column-a">
				<div><StatBarsBox v-bind="statInfo" /></div>
				<div><StatBarsBox v-bind="savesInfo" /></div>
			</div>
			<div class="stat-column-b">
				<StatCapacityBox
					v-bind="{
						label: 'Actions',
						data: actionsCapacity,
					}"
					:characterId="characterId"
				/>
				<table>
					<caption>
						<h2>Derived Information</h2>
					</caption>
					<tr>
						<td class="stat-label">Movement per move</td>
						<td class="stat-value">{{ stats.actionsMoveBaseLand }} ft.</td>
					</tr>
					<tr>
						<td class="stat-label">Reach</td>
						<td class="stat-value">{{ stats.reach }} ft.</td>
					</tr>
					<tr>
						<td class="stat-label">Size</td>
						<td class="stat-value">{{ sizeMap[stats.size].name }}</td>
					</tr>
					<tr>
						<td class="stat-label">Carrying Capacity</td>
						<td class="stat-value">{{ stats.capacityCarrying }} lbs.</td>
					</tr>
				</table>
			</div>
			<div class="stat-column-c">
				<div>
					<StatCapacityBox
						v-bind="{
							label: 'Ammo',
							data: ammoCapacity,
						}"
						:characterId="characterId"
					/>
				</div>
				<div>
					<StatCapacityBox
						v-bind="{
							label: 'Energy',
							data: energyCapacity,
						}"
						:characterId="characterId"
					/>
				</div>
			</div>
			<div style="height: 10em; width: 30em"><StatBarsBox v-bind="skillsInfo" /></div>
		</div>
	</div>
</template>
<style>
.stat-column-a,
.stat-column-b,
.stat-column-c {
	width: 20%;
	display: inline-block;
	vertical-align: top;
}
.stat-column-c {
	width: 25%;
}
.stat-label {
	text-align: right;
	white-space: nowrap;
}
.stat-value {
	text-align: right;
	white-space: nowrap;
	font-weight: bold;
	width: 100%;
}
</style>
