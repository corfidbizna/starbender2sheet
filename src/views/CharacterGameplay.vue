<script setup lang="ts">
import { computed, ref } from 'vue';
import useCharacterData, {
	type StatBoxInfo,
	makeComputedOfStats,
	type CapacityBoxStatField,
	sizeMap,
	type StatName,
	elements,
	type Element,
	type ActionResourceKey,
	type SkillKey,
} from '@/composables/useCharacterData';
import StatBarsBox from '@/components/StatBarsBox.vue';
import LoadingModal from '@/components/LoadingModal.vue';
import StatCapacityBox from '@/components/StatCapacityBox.vue';
import CapacityBar from '@/components/CapacityBar.vue';
import DGlyph from '@/components/DGlyph.vue';
import { actionLog, subtabNameGameplay, updateLog } from '@/sharedState';
import BGImage from '@/components/BGImage.vue';
import SpinBox from '@/components/SpinBox.vue';
// import { DiceFormula, getStatByCharacter } from '@/business_logic/diceFormula';
type CharacterProps = {
	characterId: string;
};
const props = defineProps<CharacterProps>();

const {
	character,
	buffsTallied,
	stats,
	statsBuffed,
	actionResources,
	actionResourcesDisplay,
	statsLoading,
	statsRefresh,
	getStat,
	lightLevel,
	skills,
	weapons,
	weaponAmmoUpdate,
	subclassGet,
} = useCharacterData(props.characterId);

const activeShieldType = computed<Element>(() => {
	const shieldTotals = [
		{ e: 'Kinetic', n: statsBuffed.value.hpShieldKinetic.total },
		{ e: 'Solar', n: statsBuffed.value.hpShieldSolar.total },
		{ e: 'Arc', n: statsBuffed.value.hpShieldArc.total },
		{ e: 'Void', n: statsBuffed.value.hpShieldVoid.total },
		{ e: 'Stasis', n: statsBuffed.value.hpShieldStasis.total },
		{ e: 'Strand', n: statsBuffed.value.hpShieldStrand.total },
		{ e: 'Prismatic', n: statsBuffed.value.hpShieldPrismatic.total },
	].sort((a, b) => b.n - a.n);
	return (shieldTotals[0].e as Element) || 'Kinetic';
});
const shieldColor = computed<string>(() => {
	return elements[activeShieldType.value] || '#FeFFFd';
});
const subclassColor = computed<string>(() => {
	return (
		'background: linear-gradient(90deg, var(--color-' +
		subclassGet.value.toLocaleLowerCase() +
		') -50%, #ddd0 80%'
	);
});
const lightLevelColor = computed<string>(() => {
	return lightLevel.value + statsBuffed.value.lightLevel.total >= 20 ? '#fe8' : '#fff';
});
const infoAbilityScores = computed<StatBoxInfo>(() => {
	const keys = ['str', 'dex', 'con', 'int', 'wis', 'cha'];
	const descriptions = [
		'"Physical might"',
		'"Agility, reflexes, and balance"',
		'"Health and stamina"',
		'"Reasoning and memory"',
		'"Perceptiveness and mental fortitude"',
		'"Confidence, poise, and charm"',
	];
	return {
		label: 'Ability Scores',
		data: keys.map((key, i) => ({
			key,
			label:
				keys[i].toLocaleUpperCase() +
				' ' +
				statsBuffed.value[(keys[i] + 'Score') as StatName].total,
			stat: key,
			hovertext:
				descriptions[i] + '\n' + statsBuffed.value[key as StatName].summary.join('\n'),
			value: stats.value[key as StatName].total,
			value2: statsBuffed.value[key as StatName].total,
		})),
		noRoll: false,
	};
});
const infoDefenseMods = computed<StatBoxInfo>(
	makeComputedOfStats(
		stats,
		statsBuffed,
		'Defense Mods',
		['ac', 'acTouch', 'acFF', 'acFFTouch', 'dr', 'drFF'],
		true,
	),
);
const expendables = computed<CapacityBoxStatField[]>(() => {
	return [
		{
			label: 'Rerolls',
			stat: 'rerollsUsed',
			max: statsBuffed.value.rerolls.total,
			current: actionResources.value.rerollsUsed,
			color: '#fff',
			inverted: true,
		},
		{
			label: 'Charges',
			stat: 'armorChargesUsed',
			color: '#8df',
			max: statsBuffed.value.capacityArmorCharge.total,
			current: actionResources.value.armorChargesUsed,
			inverted: true,
		},
	];
});
const infoSaves = computed<StatBoxInfo>(
	makeComputedOfStats(stats, statsBuffed, 'Saving Throws', ['fort', 'ref', 'will']),
);
const changeSubtab = (name: string) => {
	subtabNameGameplay.value = name;
};
const incrementTurn = () => {
	const source = stats.value;
	const resource = actionResources.value;
	// Turn Counter
	resource.turns++;
	// Update Log
	updateLog('—— Turn ' + resource.turns + ' Started ——');
	// Energy Regen
	['Super', 'Class', 'Melee', 'Grenade', 'Universal'].forEach((energy) => {
		const energyKey = ('energy' + energy) as StatName;
		const energyRechargeKey = ('energy' + energy + 'Recharge') as StatName;
		if (
			resource[(energyKey + 'Used') as ActionResourceKey] > 0 ||
			source[energyRechargeKey].total < 0
		) {
			resource[(energyKey + 'Used') as ActionResourceKey] -=
				statsBuffed.value[energyRechargeKey].total;
		}
	});
	// Action Refresh
	resource.actionsMajorUsed = 0;
	resource.actionsAttackUsed = 0;
	resource.actionsTacticalUsed = 0;
	resource.actionsMoveUsed = 0;
	resource.actionsInteractionUsed = 0;
	resource.actionsReactionUsed = 0;
	resource.actionsOtherUsed = 0;
	// Healths Regen
	if (resource.damage > 0) {
		resource.damage -= statsBuffed.value.hpRecharge.total;
	}
	if (resource.damageShields > 0) {
		resource.damageShields -= statsBuffed.value.hpShieldRecharge.total;
	}
};
const rallyBanner = () => {
	const resource = actionResources.value;
	// Update Log
	updateLog('    Rallying to a banner!\nAll energies and health refilled');
	// Energy Regen
	['Super', 'Class', 'Melee', 'Grenade', 'Universal'].forEach((energy) => {
		const energyKey = ('energy' + energy) as StatName;
		resource[(energyKey + 'Used') as ActionResourceKey] = 0;
	});
	// Action Refresh
	resource.actionsMajorUsed = 0;
	resource.actionsAttackUsed = 0;
	resource.actionsTacticalUsed = 0;
	resource.actionsMoveUsed = 0;
	resource.actionsInteractionUsed = 0;
	resource.actionsReactionUsed = 0;
	resource.actionsOtherUsed = 0;
	// Ammo Refresh
	// resource.ammoKinetic += source.capacityKinetic - resource.ammoKinetic;
	// resource.ammoSpecial += source.capacitySpecial - resource.ammoSpecial;
	// resource.ammoHeavy += source.capacityHeavy - resource.ammoHeavy;
	weapons.value
		.filter((weapon) => weapon.isEquipped)
		.forEach((weapon) => {
			weaponAmmoUpdate(weapon.name, weapon.ammoCapacity - weapon.ammoCurrent);
		});
	// Healths Refresh
	resource.damage = 0;
	resource.damageShields = 0;
};
// const customDiceConfirm = () => {
// 	if (!!customDice.value) {
// 		customDiceFormula.value = new DiceFormula(customDice.value);
// 	}
// };
// const customDice = ref<string>('');
// const customDiceFormula = ref<DiceFormula>();
const revive = () => {
	actionResources.value.damage = 0;
	actionResources.value.damageShields = 0;
	updateLog('== Revived! ==');
};
const healthColor = computed<string>(() =>
	previewDamage.value.health > statsBuffed.value.hpMax.total / 4
		? '#ffff'
		: 'var(--color-debuff)',
);

const dmg = ref(0);
const dmgMult = ref(1);
const dmgCount = ref(1);
const dmgType = ref('Kinetic');
const dmgDRType = ref('DR');
const currentDR = computed<number>(() => {
	if (dmgDRType.value === 'None') {
		return 0;
	}
	const stringMid = dmgDRType.value.includes('FF') ? 'FF' : '';
	const drString = 'dr' + stringMid;
	const elementString: Record<string, string> = {
		Solar: 'Solar',
		Arc: 'Arc',
		Void: 'Void',
		Stasis: 'Stasis',
		Strand: 'Strand',
		Prismatic: 'Prismatic',
		Dark: 'Dark',
		Darkness: 'Dark',
	};
	const totalDR: number = getStat(drString);
	return totalDR + getStat(drString + elementString[dmgType.value]);
});
const currentResistance = computed<number>(() => {
	// if (dmgType.value === 'Kinetic') return 1;
	const key = ('resist' + dmgType.value) as StatName;
	return 0.01 * (100 - getStat(key));
});
const currentDamage = computed<number>(() => {
	return Math.max(
		0,
		Math.trunc(
			(dmg.value * dmgMult.value - currentDR.value) *
				currentResistance.value *
				dmgCount.value,
		),
	);
});
const previewDamage = computed<Record<string, number>>(() => {
	const result = {
		health: statsBuffed.value.hpMax.total - actionResources.value.damage,
		shields: statsBuffed.value.hpShieldMax.total - actionResources.value.damageShields,
	};
	if (result.shields <= 0) {
		// If there are no shields, just subtract the damage from the health and be done.
		result.health -= Math.floor(currentDamage.value);
	} else {
		const isWeak = dmgType.value === activeShieldType.value;
		let damage = currentDamage.value;
		damage = isWeak ? damage * 2 : damage / 2;
		result.shields -= damage;
		if (result.shields < 0) {
			// If the shields couldn't completely take the hit….
			damage = result.shields;
			result.health = Math.floor(result.health + (isWeak ? damage / 2 : damage * 2));
		}
		result.shields = Math.max(0, Math.floor(result.shields));
	}
	return result;
});
const healthBarPercentage = computed<number>(() => {
	return (
		100 *
		(statsBuffed.value.hpMax.total /
			(statsBuffed.value.hpMax.total + statsBuffed.value.hpShieldMax.total))
	);
});
const glyphMap: Record<string, string> = {
	Kinetic: '',
	Solar: '',
	Arc: '',
	Void: '',
	Stasis: '',
	Strand: '',
	Prismatic: '',
	Dark: '',
	Darkness: '',
};
const applyDamage = () => {
	const startingHealth = statsBuffed.value.hpMax.total - actionResources.value.damage;
	const startingShields =
		statsBuffed.value.hpShieldMax.total - actionResources.value.damageShields;
	//
	const diffHealth = -1 * (startingHealth - previewDamage.value.health);
	const diffShields = -1 * (startingShields - previewDamage.value.shields);
	const stringStart = 'Took ' + glyphMap[dmgType.value] + dmg.value + ' damage,\n  ';
	const stringShield =
		'Shields: ' +
		startingShields +
		' → ' +
		previewDamage.value.shields +
		' (' +
		diffShields +
		')\n  ';
	const stringHealth =
		'Health:  ' + startingHealth + ' → ' + previewDamage.value.health + ' (' + diffHealth + ')';
	updateLog(stringStart + (startingShields > 0 ? stringShield : '') + stringHealth);
	if (previewDamage.value.health <= 0) {
		updateLog('== Guardian down! ==');
		// The following code would reset all actions to zero once your health reaches zero.
		// Object.keys(actionResources.value).forEach((key) => {
		// 	const statKey = key.slice(0, -4) as StatName;
		// 	if (key.slice(0, 7) === 'actions' && statsBuffed.value[statKey] !== undefined) {
		// 		actionResources.value[key as ActionResourceKey] =
		// 			statsBuffed.value[statKey]?.total || 0;
		// 	}
		// });
	}
	//
	actionResources.value.damage -= diffHealth;
	actionResources.value.damageShields -= diffShields;
	dmg.value = 0;
};

type ActionInfo = {
	gridStyle: string;
	max: number;
	remaining: number;
	isAllowed: boolean;
	hovertext: string;
};
const actionsInfo = computed<Record<string, ActionInfo>>(() => {
	return {
		Major: {
			gridStyle: 'grid-row: 1; grid-column: 1/4',
			max: statsBuffed.value.actionsMajor.total,
			remaining: actionResourcesDisplay.value.actionsMajor,
			isAllowed: actionResourcesDisplay.value.actionsMajor > 0,
			hovertext: '',
		},
		Attack: {
			gridStyle: 'grid-row: 2/4; grid-column: 1',
			max: statsBuffed.value.actionsAttack.total,
			remaining: actionResourcesDisplay.value.actionsAttack,
			isAllowed: actionResourcesDisplay.value.actionsAttack > 0,
			hovertext: '',
		},
		Tactical: {
			gridStyle: 'grid-row: 2; grid-column: 2/4',
			max: statsBuffed.value.actionsTactical.total,
			remaining: actionResourcesDisplay.value.actionsTactical,
			isAllowed: actionResourcesDisplay.value.actionsTactical > 0,
			hovertext: '',
		},
		Move: {
			gridStyle: 'grid-row: 3; grid-column: 2',
			max: statsBuffed.value.actionsMove.total,
			remaining: actionResourcesDisplay.value.actionsMove,
			isAllowed: actionResourcesDisplay.value.actionsMove > 0,
			hovertext: '',
		},
		Interaction: {
			gridStyle: 'grid-row: 3; grid-column: 3',
			max: statsBuffed.value.actionsInteraction.total,
			remaining: actionResourcesDisplay.value.actionsInteraction,
			isAllowed: actionResourcesDisplay.value.actionsInteraction > 0,
			hovertext: '',
		},
		Reaction: {
			gridStyle: 'grid-row: 4; grid-column: 1/4; margin-top: 0.25em',
			max: statsBuffed.value.actionsReaction.total,
			remaining: actionResourcesDisplay.value.actionsReaction,
			isAllowed: actionResourcesDisplay.value.actionsReaction > 0,
			hovertext: '',
		},
	};
});
const spendAction = (actionName: string, event: MouseEvent) => {
	if (event.shiftKey) {
		actionResources.value[('actions' + actionName + 'Used') as ActionResourceKey] -= 1;
	} else {
		actionResources.value[('actions' + actionName + 'Used') as ActionResourceKey] += 1;
	}
};

const moveShowTiles = ref<boolean>(false);
const assembleSpeed = (name: string, baseSpeed: number) => {
	const replaceKey = ('actionsMoveReplace' + name) as StatName;
	const supplementKey = ('actionsMove' + name) as StatName;
	return (
		(!!statsBuffed.value[replaceKey].summary[0] || !!getStat(replaceKey)
			? getStat(replaceKey)
			: baseSpeed) + getStat(supplementKey)
	);
};
const moveInfo = computed(() => {
	const listSkill = ['acrobatics', 'climb', 'swim', 'fly'];
	const listStat = ['', 'Climb', 'Swim', 'Fly'];
	const listRatios = [1, 2, 4, 1];
	const result: Record<string, number> = {};
	for (const i in listSkill) {
		const skillTotal =
			(skills.value[listSkill[i] as SkillKey] || 0) +
			(statsBuffed.value[listSkill[i] as StatName].total || 0);
		const baseTotal = getStat('actionsMoveBase' + listStat[i]);
		const replaceTotal = getStat('actionsMoveReplace' + listStat[i]);
		const bothTotal = getStat('actionsMove' + listStat[i]);
		const ratio = listRatios[i];
		const baseSpeed =
			(skillTotal + baseTotal + statsBuffed.value.actionsMoveBaseLand.total) / ratio;
		const replaceSpeed = replaceTotal;
		result[listSkill[i]] = Math.trunc(
			((!!statsBuffed.value[('actionsMoveReplace' + listStat[i]) as StatName]?.summary[0]
				? replaceSpeed
				: baseSpeed) +
				bothTotal) *
				statsBuffed.value.actionsMoveMult.total,
		);
	}
	// return result;
	const moveMult = statsBuffed.value.actionsMoveMult.total;
	const jumpAmount =
		10 +
		Math.trunc(
			(skills.value.acrobatics || 0) +
				getStat('acrobatics') +
				assembleSpeed('Land', getStat('actionsMoveBaseLand')) / 4,
		);
	const speedClimb =
		Math.trunc(((skills.value.climb || 0) + getStat('climb')) / 2) +
		statsBuffed.value.actionsMoveClimb.total;
	const speedSwim =
		Math.trunc(
			((skills.value.swim || 0) + (statsBuffed.value['swim' as StatName].total + 10)) / 2,
		) + statsBuffed.value.actionsMoveSwim.total;
	const speedFly =
		Math.trunc(
			((skills.value.fly || 0) + (statsBuffed.value['fly' as StatName].total + 10)) / 2,
		) + statsBuffed.value.actionsMoveFly.total;
	return {
		jump: jumpAmount * moveMult,
		climb: assembleSpeed('Climb', speedClimb) * moveMult,
		swim: assembleSpeed('Swim', speedSwim) * moveMult,
		fly: assembleSpeed('Fly', speedFly) * moveMult,
	};
});
const toTiles = (feet: number) => {
	// Rounds to the nearest vv
	const fractionalRound = 5; // 4
	return Math.trunc((feet * fractionalRound) / 5) / fractionalRound;
};
const moveResults = computed<Record<string, string>>(() => {
	if (moveShowTiles.value) {
		return {
			jump: toTiles(moveInfo.value.jump) + ' tiles',
			climb: toTiles(moveInfo.value.climb) + ' tiles',
			swim: toTiles(moveInfo.value.swim) + ' tiles',
			fly: toTiles(moveInfo.value.fly) + ' tiles',
		};
	}
	return {
		jump: moveInfo.value.jump + ' ft.',
		climb: moveInfo.value.climb + ' ft.',
		swim: moveInfo.value.swim + ' ft.',
		fly: moveInfo.value.fly + ' ft.',
	};
});
const encumberanceTEMP = computed<number>(() => {
	return Math.trunc(
		Math.max(
			0,
			Math.min(
				3,
				(statsBuffed.value.weightCurrent.total / statsBuffed.value.capacityCarrying.total) *
					3,
			),
		),
	);
});
const encumberanceColor = computed<string>(() => {
	// Right now 'encumberance' is broken, so I'm reusing the math for encumberanceTEMP.
	const colors: Record<number, string> = {
		0: '#fff',
		1: '#ffa',
		2: '#fa6',
		3: '#e76',
	};
	return colors[encumberanceTEMP.value];
});
</script>
<template>
	<div
		class="CharacterGameplay"
		v-if="character"
	>
		<BGImage
			:bgNames="['Gameplay', 'Gameplay_Q1', 'Gameplay_Q2', 'Gameplay_Q3', 'Gameplay_Q4']"
		/>
		<div v-if="statsLoading">
			<LoadingModal />
		</div>
		<div v-else>
			<div class="primary-block">
				<div class="action-block">
					<!-- <SpinBox v-bind="{ value: 0, max: 10 }" />
					<SpinBox v-bind="{ value: 0, max: 10, inverted: true }" /> -->
					<div>
						<button @click="statsRefresh()">Reload Data</button>
						<h1 class="turn-display">
							<span style="flex: 1 0 auto">Round </span
							><span style="margin-left: auto; flex: 1 0 auto"
								><input
									style="font-size: 0.8em; width: 2em"
									v-model="actionResources['turns']"
									type="number"
									min="0"
									value="1"
									name="turn-counter"
							/></span>
						</h1>
						<button @click="incrementTurn">Begin Next Round</button>
						<button @click="rallyBanner">Rally Banner</button>
					</div>
					<!-- <div>
						<h2>Roll Dice</h2>
						<input
							type="text"
							v-model="customDice"
							@focusout="customDiceConfirm()"
						/>
						<span>{{
							customDiceFormula
								?.evaluateExceptDice(getStatByCharacter(statsBuffed))
								.stringify()
						}}</span>
					</div> -->
					<h2>Action Log</h2>
					<textarea
						v-model="actionLog"
						readonly
						class="action-log"
						name="action-log"
					></textarea>
				</div>
				<div class="left-block">
					<div
						class="character-header"
						:style="subclassColor"
					>
						<img
							:src="'./icons/headshot_' + characterId + '.png'"
							style="height: 48px; position: absolute; bottom: -2px; left: -20px"
						/>
						<span style="flex-grow: 1">{{ character.label }}</span>
						<span class="label">CPL</span>
						<span>{{ statsBuffed.cpl.total }}</span>
						<span class="label">LIGHT LEVEL</span>
						<span :style="'color: ' + lightLevelColor">
							<DGlyph v-bind="{ name: 'Light' }" />
							<span>{{ lightLevel + statsBuffed.lightLevel.total }}</span></span
						>
					</div>
					<div class="stat-column-a">
						<StatBarsBox
							v-bind="infoAbilityScores"
							class="hover-highlight"
						/>
						<StatBarsBox
							v-bind="infoSaves"
							class="hover-highlight"
						/>
						<StatBarsBox
							v-bind="infoDefenseMods"
							class="hover-highlight"
						/>
						<StatCapacityBox
							v-bind="{ label: 'Expendables', data: expendables }"
							:characterId="characterId"
							class="hover-highlight"
							style="margin: 0.5em"
						/>
					</div>
					<div class="stat-column-b">
						<h2>
							Health & Shields<button
								style="float: right"
								:disabled="actionResourcesDisplay.health > 0"
								@click="revive()"
							>
								Revive
							</button>
						</h2>
						<div class="health-block hover-highlight">
							<div
								class="health-block-bars"
								:class="{ 'guardian-down': previewDamage.health <= 0 }"
							>
								<div class="health-bar-back">
									<CapacityBar
										v-bind="{
											max: statsBuffed.hpMax.total,
											current: actionResourcesDisplay.health,
											color: '#844',
											hideLine: true,
										}"
										:style="'width: ' + healthBarPercentage + '%'"
									/>
									<CapacityBar
										v-bind="{
											max: statsBuffed.hpShieldMax.total,
											current: actionResourcesDisplay.shields,
											color: shieldColor + '66',
											hideLine: true,
										}"
										:style="'width: ' + (100 - healthBarPercentage) + '%'"
									/>
								</div>
								<div class="health-bar-front">
									<CapacityBar
										v-bind="{
											max: statsBuffed.hpMax.total,
											current: previewDamage.health,
											color: healthColor,
											hideLine: true,
										}"
										:style="'width: ' + healthBarPercentage + '%'"
									/>
									<CapacityBar
										v-bind="{
											max: statsBuffed.hpShieldMax.total,
											current: previewDamage.shields,
											color: shieldColor,
											hideLine: true,
										}"
										:style="'width: ' + (100 - healthBarPercentage) + '%'"
									/>
								</div>
							</div>
							<div class="health-block-infos">
								<span class="health-block-info-left"
									><SpinBox
										v-bind="{
											value: actionResources.damage,
											max: statsBuffed.hpMax.total,
											inverted: true,
										}"
										v-model="actionResources.damage"
										style="width: 4em"
									/> ⁄ {{ statsBuffed.hpMax.total }}
								</span>
								<span class="health-block-info-mid d-glyph"></span>
								<span class="health-block-info-right">
									<SpinBox
										v-bind="{
											value: actionResources.damageShields,
											max: statsBuffed.hpShieldMax.total,
											inverted: true,
										}"
										v-model="actionResources.damageShields"
										style="width: 4em"
									/> ⁄ {{ statsBuffed.hpShieldMax.total }}
									<DGlyph
										v-bind="{ name: activeShieldType }"
										style="font-size: 1em"
										:style="'color: ' + elements[activeShieldType]"
									/>
								</span>
							</div>
						</div>
						<table class="stat-box-table hover-highlight">
							<caption>
								<h2>
									<span>Damage Calculator</span
									><button
										style="float: right"
										@click="applyDamage"
									>
										Apply
									</button>
								</h2>
							</caption>
							<tbody>
								<tr title="(Damage Received × Mult) - DR → Count → Resulting Damage">
									<td class="stat-label">Math</td>
									<td
										class="stat-value"
										colspan="3"
									>
										({{ dmg }} × {{ dmgMult }}){{ currentDR < 0 ? ' + ' : ' - '
										}}{{ Math.abs(currentDR) }} → {{ dmgCount }}× →
									</td>
									<td
										class="stat-value"
										style="text-align: right"
									>
										<span>{{ currentDamage }}</span>
									</td>
								</tr>
								<tr>
									<td class="stat-label">Received</td>
									<td
										class="stat-value"
										colspan="4"
									>
										<input
											id="damage-raw"
											type="number"
											value="0"
											v-model="dmg"
											style="min-width: 4em; width: 40%"
										/>
									</td>
								</tr>
								<tr>
									<td class="stat-label">Mult</td>
									<td class="stat-value">
										<input
											id="damage-mult"
											type="number"
											value="1"
											min="0"
											v-model="dmgMult"
											style="width: 3em"
										/>
									</td>
									<td class="stat-label">Type</td>
									<td class="stat-value">
										<select
											name="damage-type"
											v-model="dmgType"
											style="width: 100%"
										>
											<option
												v-for="element in Object.keys(elements)"
												:key="element"
												:value="element"
											>
												{{ element }}
											</option>
											<option value="Darkness">Darkness</option>
										</select>
									</td>
									<td>
										<DGlyph
											v-if="dmgType !== 'Kinetic'"
											v-bind="{ name: dmgType }"
											class="element-glyph"
											:style="
												'color: ' + (elements[dmgType as Element] || '#7a6666')
											"
											style="font-size: 1em"
										/>
									</td>
								</tr>
								<tr>
									<td class="stat-label">Count</td>
									<td class="stat-value">
										<input
											name="damage-count"
											type="number"
											value="1"
											min="1"
											v-model="dmgCount"
											style="width: 3em"
										/>
									</td>
									<td class="stat-label">DR</td>
									<td class="stat-value">
										<select
											name="damage-select"
											id="damage-select"
											v-model="dmgDRType"
										>
											<option value="None">--None--</option>
											<option value="DR">DR</option>
											<option value="FFDR">FFDR</option>
										</select>
									</td>
									<td class="stat-value">
										{{ currentDR }}
									</td>
								</tr>
							</tbody>
						</table>
						<div>
							<h2>Actions</h2>
							<div class="actions-block-currencies">
								<button
									class="spend-action"
									v-for="name in Object.keys(actionsInfo)"
									:key="name"
									:class="{ empty: !actionsInfo[name].isAllowed }"
									:style="actionsInfo[name].gridStyle"
									@click="spendAction(name, $event)"
									:title="
										actionsInfo[name].hovertext +
										statsBuffed[('actions' + name) as StatName].summary.join(
											'\n',
										) +
										'\n\n(Hold shift to increase instead of spend.)'
									"
								>
									<span class="spend-action-label">{{ name }}</span>
									<span
										>{{ actionsInfo[name].remaining }} ⁄ {{
											actionsInfo[name].max
										}}</span
									>
								</button>
							</div>
						</div>
						<div>
							<div class="actions-block-toggles">
								<label
									title="Hunker down and increase your survivability. Dodge +2, Ref Safe +2"
								>
									<input type="checkbox" />Defend
								</label>
								<label title="Contribute to an ally's action.">
									<input type="checkbox" />Aid
								</label>
								<label
									title="Receiving defense from an ally. Rolls +2, Deflection +2"
								>
									<input type="checkbox" />Being Aided
								</label>
							</div>
						</div>
						<table class="hover-highlight">
							<caption>
								<h2>
									Derived Information<span style="float: right"
										><button @click="moveShowTiles = !moveShowTiles">
											Show {{ moveShowTiles ? 'Feet' : 'Tiles' }}
										</button></span
									>
								</h2>
							</caption>
							<tbody>
								<tr :title="buffsTallied.actionsMoveBaseLand.summary.join('\n') || ''">
									<td class="stat-label">Movement Per Action</td>
									<td class="stat-value">
										{{
											moveShowTiles
												? toTiles(statsBuffed['actionsMoveBaseLand'].total) +
													' tiles'
												: statsBuffed['actionsMoveBaseLand'].total + ' ft.'
										}}
									</td>
								</tr>
								<tr>
									<td colspan="2">
										<table class="movement-table">
											<tbody>
												<tr>
													<td>Jump</td>
													<td>Climb</td>
													<td>Swim</td>
													<td>Fly</td>
												</tr>
												<tr>
													<td class="movement-table-value">
														{{ moveResults.jump }}
													</td>
													<td class="movement-table-value">
														{{ moveResults.climb }}
													</td>
													<td class="movement-table-value">
														{{ moveResults.swim }}
													</td>
													<td class="movement-table-value">
														{{ moveResults.fly }}
													</td>
												</tr>
											</tbody>
										</table>
									</td>
								</tr>
								<!-- <tr>
									<td class="stat-label">Jump Height</td>
									<td class="stat-value">
										{{ moveInfo.acrobatics }} ft. /
										{{ toTiles(moveInfo.acrobatics) }} tiles
									</td>
								</tr>
								<tr>
									<td class="stat-label">Climb Speed</td>
									<td class="stat-value">
										{{ moveInfo.climb }} ft. / {{ toTiles(moveInfo.climb) }} tiles
									</td>
								</tr>
								<tr>
									<td class="stat-label">Swim Speed</td>
									<td class="stat-value">
										{{ moveInfo.swim }} ft. / {{ toTiles(moveInfo.swim) }} tiles
									</td>
								</tr>
								<tr>
									<td class="stat-label">Fly Speed</td>
									<td class="stat-value">
										{{ moveInfo.fly }} ft. / {{ toTiles(moveInfo.fly) }} tiles
									</td>
								</tr> -->
								<tr>
									<td class="stat-label">Reach</td>
									<td class="stat-value">
										{{
											moveShowTiles
												? toTiles(statsBuffed['reach'].total) + ' tiles'
												: statsBuffed['reach'].total + ' ft.'
										}}
									</td>
								</tr>
								<tr>
									<td class="stat-label">Size</td>
									<td class="stat-value">
										{{ sizeMap[statsBuffed['size'].total].name }}
									</td>
								</tr>
								<tr>
									<td class="stat-label">Carrying Capacity</td>
									<td class="stat-value">
										{{ statsBuffed['weightCurrent'].total }} ⁄
										{{ statsBuffed['capacityCarrying'].total }} lbs.
									</td>
								</tr>
								<tr>
									<td class="stat-label">
										<span v-if="encumberanceTEMP <= 0"> Not Encumbered </span>
										<span v-else-if="encumberanceTEMP === 1"> Encumbered </span>
										<span v-else-if="encumberanceTEMP === 2">
											Heavily Encumbered
										</span>
										<span v-else-if="encumberanceTEMP >= 3"> Over Encumbered </span>
									</td>
									<td>
										<CapacityBar
											v-bind="{
												max: statsBuffed.capacityCarrying.total,
												current: statsBuffed.weightCurrent.total || 0,
												color: encumberanceColor,
											}"
											style="height: 0.8em"
										/>
									</td>
								</tr>
							</tbody>
						</table>
					</div>
					<!-- <div class="stat-column-c">
						<div class="ability-block">nothing here</div>
					</div> -->
				</div>
				<div class="right-block">
					<div class="tab-header">
						<RouterLink
							:to="{ name: 'characterGameplayWeapons', params: { characterId } }"
							@click="changeSubtab('characterGameplayWeapons')"
							>Weapons</RouterLink
						>
						<RouterLink
							:to="{ name: 'characterGameplayAbilities', params: { characterId } }"
							@click="changeSubtab('characterGameplayAbilities')"
							>Abilities</RouterLink
						>
						<RouterLink
							:to="{ name: 'characterGameplaySkills', params: { characterId } }"
							@click="changeSubtab('characterGameplaySkills')"
							>Skills</RouterLink
						>
						<RouterLink
							:to="{ name: 'characterGameplayBuffs', params: { characterId } }"
							@click="changeSubtab('characterGameplayBuffs')"
							>Buffs</RouterLink
						>
						<RouterLink
							:to="{ name: 'characterGameplayArmor', params: { characterId } }"
							@click="changeSubtab('characterGameplayArmor')"
							>Armor</RouterLink
						>
						<RouterLink
							:to="{ name: 'characterGameplayArtifact', params: { characterId } }"
							@click="changeSubtab('characterGameplayArtifact')"
							>Artifact</RouterLink
						>
					</div>
					<RouterView />
				</div>
			</div>
		</div>
	</div>
</template>
<style>
.turn-display {
	display: flex;
	align-items: baseline;
	padding: 10px 20px;
	border-top: 2px solid #ddd;
	border-bottom: 2px solid #ddd;
	margin: 8px 0;
}
.character-header {
	display: flex;
	position: relative;
	font-size: 2em;
	font-weight: bold;
	margin: 8px 0.5em 0px 1em;
	border-bottom: var(--line);
	padding-left: 1em;
	padding-top: 0.15em;
}
.character-header > .label {
	font-size: 0.5em;
	font-weight: normal;
	margin-left: 2em;
	margin-right: 0.25em;
}
.hover-highlight {
	/* color: #e8e8e8; */
	transition: color 0.5s;
}
.hover-highlight:hover {
	color: #fff;
	transition: color 0.5s;
}
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
.movement-table {
	border-collapse: collapse;
	width: 100%;
	text-align: center;
	/* border-top: var(--line);
	border-bottom: var(--line); */
}
.movement-table-value {
	font-size: 0.8em;
	font-weight: bold;
	padding-left: 2px;
}
/* */
.primary-block {
	height: var(--content-height);
	width: 100%;
	max-width: 1400px;
	margin: 0 auto;
	display: inline-block;
	vertical-align: top;
	display: flex;
}
.left-block {
	flex: 1 1 auto;
}
.right-block {
	flex: 0 0 auto;
	width: 500px;
}
.stat-column-a,
.stat-column-b,
.stat-column-c {
	display: inline-block;
	vertical-align: top;
	margin: 0.6%;
}
.stat-column-a {
	width: 43%;
}
.stat-column-b {
	width: 53%;
}
.stat-column-c {
	width: 98%;
}
.tab-header {
	width: 100%;
	display: flex;
}
.tab-header * {
	flex: 1 0;
	border: 1px solid #fffd;
	background-color: #0002;
	text-align: center;
	text-transform: uppercase;
	text-decoration: none;
	padding: 0.5em;
	transition:
		color 0.1s,
		background-color 0.1s;
	color: #fffb;
	margin-top: 1em;
}
.tab-header a:hover {
	transition:
		color 0.1s,
		background-color 0.1s;
	color: #fff;
	background-color: #fff1;
}
.tab-header .router-link-exact-active {
	color: #ffff;
	background-color: #fff4;
}
/* */
.health-block {
	position: relative;
	background-image: url('/svgs/health.svg');
	background-position: top;
	background-repeat: no-repeat;
}
.health-block-bars {
	padding: 0 0 0 0;
	margin-left: 8px;
	height: 1.75em;
}
.health-bar-front,
.health-bar-back {
	width: calc(100% - 16px);
	position: absolute;
	top: 4px;
}
.health-bar-front > .container,
.health-bar-back > .container {
	height: 10px;
}
.health-bar-front > .container > .remaining,
.health-bar-back > .container > .remaining {
	border-top: 1px solid #fffd;
	border-bottom: 1px solid #fffd;
	top: 1.5px;
}
.guardian-down .container > .remaining,
.guardian-down .container > .remaining {
	border-color: var(--color-debuff);
}
.health-bar-front > .container > .remaining {
	background-color: #0003;
}
.health-bar-back > .container > .remaining {
	background-color: #0004;
}
.health-block-infos {
	display: grid;
}
.health-block-info-left {
	grid-row: 1;
	grid-column: 1 / 2;
}
.health-block-info-mid {
	grid-row: 1;
	grid-column: 1 / 3;
	pointer-events: none;
	text-align: center;
}
.health-block-info-right {
	grid-row: 1;
	grid-column: 2 / 3;
	text-align: right;
}
/* */
.action-block {
	flex: 0 0 auto;
	display: flex;
	width: 12em;
	height: var(--content-height);
	flex-direction: column;
}
.action-block button {
	width: 100%;
	height: 2em;
	font-size: 1em;
	margin: 2px 0;
}
.action-log {
	width: auto;
	flex-grow: 2;
}
/* */
.actions-block-currencies {
	display: grid;
}
.actions-block-currencies > * {
	font-weight: bold;
}
.spend-action.empty {
	color: #ddd;
	border-color: #aaa;
}
.spend-action-label {
	font-weight: initial;
	padding-right: 0.5em;
}
.actions-block-toggles > * {
	margin: 0 auto;
}
</style>
