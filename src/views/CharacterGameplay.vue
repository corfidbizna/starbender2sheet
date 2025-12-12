<script setup lang="ts">
import { computed } from 'vue';
import useCharacterData, {
	type StatBoxInfo,
	type BarBoxStatField,
	makeComputedOfStats,
	type CapacityBoxStatField,
	sizeMap,
	type StatsCalculatedKey,
	type SkillKey,
	skillsInfoMap,
	type Weapon,
} from '@/composables/useCharacterData';
import StatBarsBox from '@/components/StatBarsBox.vue';
import LoadingModal from '@/components/LoadingModal.vue';
import StatCapacityBox from '@/components/StatCapacityBox.vue';
import CapacityBar from '@/components/CapacityBar.vue';
import WeaponItemRow from '@/components/WeaponItemRow.vue';
import { actionLog } from '@/sharedState';
type CharacterProps = {
	characterId: string;
};
const props = defineProps<CharacterProps>();

const {
	character,
	buffsTallied,
	statsBase,
	stats,
	weapons,
	weaponsLoading,
	namesOfEquippedWeapons,
	actionResources,
	getFinalStat,
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
const infoAbilityScores = computed<StatBoxInfo>(
	makeComputedOfStats(stats, buffsTallied, 'Ability Scores', [
		'str',
		'dex',
		'con',
		'int',
		'wis',
		'cha',
	]),
);
const infoDefenseMods = computed<StatBoxInfo>(
	makeComputedOfStats(
		stats,
		buffsTallied,
		'Defense Mods',
		['ac', 'acTouch', 'acFF', 'acFFTouch', 'dr', 'drFF'],
		true,
	),
);
const infoSaves = computed<StatBoxInfo>(
	makeComputedOfStats(stats, buffsTallied, 'Saving Throws', ['fort', 'ref', 'will']),
);
const incrementTurn = () => {
	const source = stats.value;
	const resource = actionResources.value;
	// Energy Regen
	['Super', 'Class', 'Melee', 'Grenade', 'Universal'].forEach((energy) => {
		const energyKey = ('energy' + energy) as StatsCalculatedKey;
		const energyRechargeKey = ('energy' + energy + 'Recharge') as StatsCalculatedKey;
		if (resource[energyKey] < getFinalStat(energyKey) || getFinalStat(energyRechargeKey) < 0) {
			resource[energyKey] += getFinalStat(energyRechargeKey);
		}
	});
	// Action Refresh
	resource.actionsMove += source.actionsMove - resource.actionsMove;
	resource.actionsAttack += source.actionsAttack - resource.actionsAttack;
	resource.actionsReaction += source.actionsReaction - resource.actionsReaction;
};
const actionsCapacity = computed<CapacityBoxStatField[]>(() => {
	return [
		{
			label: 'Moves',
			stat: 'actionsMove',
			max: getFinalStat('actionsMove'),
			current: actionResources.value.actionsMove,
		},
		{
			label: 'Attacks',
			stat: 'actionsAttack',
			max: getFinalStat('actionsAttack'),
			current: actionResources.value.actionsAttack,
		},
		{
			label: 'Reactions',
			stat: 'actionsReaction',
			max: getFinalStat('actionsReaction'),
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
			max: getFinalStat('capacityKinetic'),
			current: actionResources.value.ammoKinetic,
		},
		{
			label: 'Special',
			stat: 'ammoSpecial',
			color: '#7AF48B',
			max: getFinalStat('capacitySpecial'),
			current: actionResources.value.ammoSpecial,
		},
		{
			label: 'Heavy',
			stat: 'ammoHeavy',
			color: '#B286FF',
			max: getFinalStat('capacityHeavy'),
			current: actionResources.value.ammoHeavy,
		},
	];
});
const equippedWeapons = computed<Weapon[]>(() => {
	return weapons.value.filter((weapon) => namesOfEquippedWeapons.value.includes(weapon.name));
});
const energyCapacity = computed<CapacityBoxStatField[]>(() => {
	return [
		{
			label: 'Super',
			stat: 'energySuper',
			color: subclassColor.value,
			colorMax: '#ff6',
			max: getFinalStat('energySuper'),
			current: actionResources.value.energySuper,
		},
		{
			label: 'Class',
			stat: 'energyClass',
			color: subclassColor.value,
			max: getFinalStat('energyClass'),
			current: actionResources.value.energyClass,
		},
		{
			label: 'Melee',
			stat: 'energyMelee',
			color: subclassColor.value,
			max: getFinalStat('energyMelee'),
			current: actionResources.value.energyMelee,
		},
		{
			label: 'Grenade',
			stat: 'energyGrenade',
			color: subclassColor.value,
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
const skillsInfo = computed<StatBoxInfo>(() => {
	const fieldArray = <BarBoxStatField[]>[];
	const skillList = Object.keys(skills.value) || [];
	skillList.forEach((name: string) => {
		const key = name as SkillKey;
		fieldArray.push({
			label: skillsInfoMap[key].label,
			stat: 'str',
			value: skills.value[key] || 0,
		});
	});
	return {
		label: 'Skills',
		data: fieldArray,
	};
});
const encumberanceColor = computed<string>(() => {
	const alpha = getFinalStat('encumberance');
	const colors: Record<number, string> = {
		0: '#fff',
		1: '#ffa',
		2: '#fa6',
		3: '#e76',
	};
	return colors[alpha];
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
			<div>
				<h1>Gameplay for {{ character.label }}</h1>
				<div>
					<button
						@click="
							statsRefresh();
							skillsRefresh();
						"
					>
						Refresh Info
					</button>
					<button @click="incrementTurn">Increment Turn</button>
				</div>
			</div>
			<div class="primary-block">
				<div class="top-block">
					<div class="stat-column-a">
						<div><StatBarsBox v-bind="infoAbilityScores" /></div>
						<div><StatBarsBox v-bind="infoSaves" /></div>
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
							<tr :title="buffsTallied.actionsMoveBaseLand?.summary || 'd'">
								<td class="stat-label">Movement per move</td>
								<td class="stat-value">
									{{ getFinalStat('actionsMoveBaseLand') }} ft.
								</td>
							</tr>
							<tr>
								<td class="stat-label">Reach</td>
								<td class="stat-value">{{ getFinalStat('reach') }} ft.</td>
							</tr>
							<tr>
								<td class="stat-label">Size</td>
								<td class="stat-value">{{ sizeMap[getFinalStat('size')].name }}</td>
							</tr>
							<tr>
								<td class="stat-label">Carrying Capacity</td>
								<td class="stat-value">
									{{ getFinalStat('weightCurrent') }} ⁄
									{{ getFinalStat('capacityCarrying') }} lbs.
								</td>
							</tr>
							<tr>
								<td class="stat-label">
									<span v-if="getFinalStat('encumberance') <= 0">
										Not Encumbered
									</span>
									<span v-else-if="getFinalStat('encumberance') === 1">
										Encumbered
									</span>
									<span v-else-if="getFinalStat('encumberance') === 2">
										Heavily Encumbered
									</span>
									<span v-else-if="getFinalStat('encumberance') >= 3">
										Over Encumbered
									</span>
								</td>
								<td>
									<CapacityBar
										v-bind="{
											max: getFinalStat('capacityCarrying'),
											current: getFinalStat('weightCurrent') || 0,
											color: encumberanceColor,
										}"
										style="height: 0.8em"
									/>
								</td>
							</tr>
						</table>
					</div>
					<div class="stat-column-c">
						<StatBarsBox v-bind="infoDefenseMods" />
					</div>
				</div>
				<div class="bottom-block">
					<div class="weapon-block">
						<div style="display: flex">
							<StatCapacityBox
								v-bind="{
									label: 'Ammo',
									data: ammoCapacity,
								}"
								:characterId="characterId"
								style="width: 55%"
							/>
							<div style="width: 45%; margin-left: 1em">
								<StatCapacityBox
									v-bind="{
										label: 'Weapons',
										data: [
											{
												label: 'Equipped',
												stat: '',
												color: '#eee',
												max: getFinalStat('slotsWeapon'),
												current: getFinalStat('slotsWeaponUsed'),
											},
											{
												label: 'Hands Used',
												stat: '',
												color: '#eee',
												max: getFinalStat('hands'),
												current: getFinalStat('handsUsed'),
											},
										],
										hideRefillAll: true,
										noInteract: true,
									}"
									:characterId="characterId"
								/>
							</div>
						</div>
						<div v-if="!weaponsLoading">
							<WeaponItemRow
								v-for="weapon in equippedWeapons"
								:key="weapon.name"
								v-bind="weapon"
								:characterId="characterId"
								:activatable="true"
							/>
						</div>
					</div>
					<div class="ability-block">
						<StatCapacityBox
							v-bind="{
								label: 'Energy',
								data: energyCapacity,
							}"
							:characterId="characterId"
						/>
						<div>
							<button class="ability-button super">Super</button>
							<button class="ability-button melee">Melee</button>
							<button class="ability-button grenade">Grenade</button>
							<button class="ability-button class">Class Ability</button>
						</div>
					</div>
				</div>
			</div>
			<div class="secondary-block">
				<div>
					<h2>Action Log</h2>
					<textarea
						v-model="actionLog"
						readonly
						class="action-log"
					></textarea>
				</div>
				<StatBarsBox v-bind="skillsInfo" />
			</div>
		</div>
	</div>
</template>
<style>
.stat-label {
	text-align: right;
	white-space: nowrap;
}
.stat-value {
	text-align: left;
	padding-left: 0.25em;
	white-space: nowrap;
	font-weight: bold;
	width: 100%;
}
/* */
.primary-block {
	width: 1000px;
	display: inline-block;
	vertical-align: top;
}
.stat-column-a,
.stat-column-b,
.stat-column-c {
	width: 32%;
	display: inline-block;
	vertical-align: top;
	margin: 0.6%;
}
/* */
.secondary-block {
	width: 400px;
	display: inline-block;
	vertical-align: top;
}
.action-log {
	width: 95%;
	height: 10em;
}
/* */
.bottom-block > * {
	margin: 5px;
}
.weapon-block {
	vertical-align: top;
	display: inline-block;
	width: 53%;
}
.ability-block {
	vertical-align: top;
	display: inline-block;
	width: 44%;
}
.ability-button {
	width: 25%;
}
</style>
