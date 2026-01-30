<script setup lang="ts">
import type {
	Ability,
	ActionResourceKey,
	CharacterNames,
	DamageComponent,
	StatsCalculatedKey,
} from '@/composables/useCharacterData';
import useCharacterData from '@/composables/useCharacterData';
import DBox from '@/components/DBox.vue';
import { computed, ref } from 'vue';
import DGlyph from '@/components/DGlyph.vue';
import { DiceFormula, getStatByCharacter } from '@/business_logic/diceFormula';
import { updateLog } from '@/sharedState';
import type { BuffInfo } from '@/business_logic/buffs';
import BuffItemRow from './BuffItemRow.vue';

type CharacterProps = {
	characterId: CharacterNames;
};
const props = defineProps<Ability & CharacterProps>();
const {
	stats,
	statsBase,
	buffs,
	buffsAsStats,
	buffsTallied,
	getFinalStat,
	actionResources,
	actionResourceUpdate,
} = useCharacterData(props.characterId);

// =======================
//          Stats
// =======================
// Whether or not it's possible to use the Ability.
const isDisabled = computed<boolean>(() => {
	return energyUseAmount.value > actionResources.value['energy' + props.type];
});
// The current amount of the Ability's energy type available.
const currentEnergy = computed<number>(() => actionResources.value['energy' + props.type]);
// The maximum amount of the Ability's energy type that can be available.
const maxEnergy = computed<number>(() =>
	getFinalStat(('energy' + props.type) as StatsCalculatedKey),
);
// The amount of energy it will take to use the Ability.
// Takes "partial power" into account.
const energyUseAmount = computed<number>(() => props.energyMax - partialPowerIncrement.value);
// Assembles the gradient string used for the energy usage bar.
const energyUsageGradientString = computed<string>(() => {
	const colRemaining = '#fff';
	const colReduced = 'var(--color-buff)';
	const colSubtracted = '#aaa';
	const colEmpty = '#0004';
	const energyProgress = (100 * currentEnergy.value) / maxEnergy.value;
	const useProgress = Math.max(
		0,
		(100 * (currentEnergy.value - energyUseAmount.value)) / maxEnergy.value,
	);
	const useProgressMax = Math.max(
		0,
		(100 * (currentEnergy.value - props.energyMax)) / maxEnergy.value,
	);
	return (
		'linear-gradient(to right, ' +
		colRemaining +
		' ' +
		useProgressMax +
		'%, ' +
		colReduced +
		' ' +
		useProgressMax +
		'%, ' +
		colReduced +
		' ' +
		useProgress +
		'%, ' +
		colSubtracted +
		' ' +
		useProgress +
		'%, ' +
		colSubtracted +
		' ' +
		energyProgress +
		'%, ' +
		colEmpty +
		' ' +
		energyProgress +
		'%)'
	);
});
// Map of elemental glyphs using the Destiny symbols font.
const glyphMap = {
	Kinetic: '',
	Solar: '',
	Arc: '',
	Void: '',
	Stasis: '',
	Strand: '',
	Prismatic: '',
};
// Image URL for the Ability header.
const energyImage: Record<string, string> = {
	Super: '/public/svgs/stat_intellect.svg',
	Grenade: '/public/svgs/stat_discipline.svg',
	Melee: '/public/svgs/stat_melee.svg',
	Class: computed<string>(() => {
		const gClass = statsBase.value?.guardianClass || 'Titan';
		const classMap: Record<string, string> = {
			Titan: '/public/svgs/class_titan_proportional.svg',
			Warlock: '/public/svgs/class_warlock_proportional.svg',
			Hunter: '/public/svgs/class_hunter_proportional.svg',
		};
		return classMap[gClass] || '/public/svgs/Tricorn.svg';
	}).value,
	Universal: '/public/svgs/Tricorn.svg',
};
// Assembles the Critical Hit info string for the attack stats.
const getCritDisplay = (): string => {
	if (!props.damageStatsBase.critRange) {
		return '--';
	}
	const delimiter = ', x';
	if (props.damageStatsBase.critRange === 1) {
		return 20 + delimiter + props.damageStatsBase.critMult;
	}
	return (
		21 - props.damageStatsBase.critRange + '-20' + delimiter + props.damageStatsBase.critMult
	);
};
// Figures the amount to subtract the hit by
// given a certain distance to target specified by `actionResources`.
const hitRangeMod = computed<number>(() => {
	const distance = actionResources.value.targetRange;
	const increment = Math.min(10, Math.max(0, distance / props.damageStatsBase.range));
	return Math.trunc(increment) * props.damageStatsBase.rangePenalty;
});
// The current reduction of partial power.
// Note: this number being _higher_ means _more reduction_.
const partialPowerIncrement = ref<number>(0);
// The label map for all the stats affectable by partial power.
const partialPowerStatLabels = {
	hitBonus: 'Hit Bonus',
	critRange: 'Crit Range',
	critMult: 'Crit Mult',
	dmgDieQuantity: 'Damage Dice Count',
	range: 'Range',
	size: 'Size',
	duration: 'Duration',
	handed: 'Handedness',
	dmg: 'Damage',
};
// The version of the stats affected by partial power to read from.
// Exists because we can't non-destructively modify `props`.
const partialPowerStats = computed<
	Record<keyof typeof partialPowerStatLabels, number | DiceFormula>
>(() => {
	const result = {
		hitBonus:
			props.damageStatsBase.hitBonus + (props.type === 'Melee' ? 0 : -hitRangeMod.value),
		critRange: props.damageStatsBase.critRange,
		critMult: props.damageStatsBase.critMult,
		dmgDieQuantity: props.dmgDieQuantity,
		range: props.damageStatsBase.range,
		size: props.damageStatsBase.size,
		duration: props.damageStatsBase.duration,
		handed: props.handed,
		dmg: props.dmg,
	};
	props.partialPowerStats.forEach((statName, i) => {
		const key = statName as keyof typeof partialPowerStatLabels;
		if (key !== 'dmg') {
			const subtractAmount =
				partialPowerIncrement.value * props.partialPowerStepMults[i] || 0;
			result[key] -= Math.trunc(subtractAmount);
		}
	});
	const newDamage = (result.dmgDieQuantity || '0') + (props.dmgDieFormula || 'd0');
	result.dmg = new DiceFormula(newDamage);
	return result;
});
// The attack info stats related to damage. Dynamic because of partial power.
const dmgDisplays = computed<Record<string, string>>(() => {
	const statFunction = getStatByCharacter(buffsAsStats.value);
	const damage = partialPowerStats.value.dmg as DiceFormula;
	return {
		short: damage.evaluateExceptDice(statFunction).stringify(),
		min: damage.min(statFunction) + '',
		max: damage.max(statFunction) + '',
		avg: damage.mean(statFunction) + '',
	};
});
// Flags for the CSS to see if certain elements have been debuffed.
const debuffed = computed<Record<string, boolean>>(() => {
	const pps = partialPowerStats.value; // "P"artial "P"ower "S"tats
	return {
		hitBonus: pps.hitBonus !== props.damageStatsBase.hitBonus,
		critRange: pps.critRange !== props.damageStatsBase.critRange,
		critMult: pps.critMult !== props.damageStatsBase.critMult,
		dmgDieQuantity: pps.dmgDieQuantity !== props.dmgDieQuantity,
		range: pps.range !== props.damageStatsBase.range,
		size: pps.size !== props.damageStatsBase.size,
		duration: pps.duration !== props.damageStatsBase.duration,
		handed: pps.handed !== props.handed,
		dmg: pps.dmgDieQuantity !== props.dmgDieQuantity,
	};
});
// The buffs that this ability is associated with, if any.
const buffsFiltered = computed<BuffInfo[]>(() => {
	return buffs.value.filter((buff) => props.buffs.includes(buff.name));
});

// =======================
//       Functions
// =======================
// The d20 roll to add hit calculations to.
const hitFormula = new DiceFormula('1d20');
const rollDamage = () => {
	const statFunction = getStatByCharacter(buffsAsStats.value);
	const result = (partialPowerStats.value.dmg as DiceFormula).roll(statFunction);
	let string = props.name + '\n  Damage:     ' + glyphMap[props.element] + result;
	if ((partialPowerStats.value.critMult as number) > 1) {
		string +=
			'\n  Crit damage: ' +
			glyphMap[props.element] +
			result * (partialPowerStats.value.critMult as number);
	}
	updateLog(string);
};
const rollHit = () => {
	const result = hitFormula.roll(() => 0);
	let string =
		props.name +
		'\n  ' +
		result +
		' (dice) ' +
		('+ ' + (buffsTallied.value.toHitSpell?.total || stats.value.toHitSpell)).replace(
			'+-',
			'-',
		) +
		' (bonus)';
	string +=
		'\n  Hit result ⇒ ' +
		(result + (buffsTallied.value.toHitSpell?.total || stats.value.toHitSpell));
	if (result <= 1) {
		string += '\n == Natural 1! ==';
	}
	if (result > 20 - ((partialPowerStats.value.critRange as number) || 0)) {
		string += '\n == Critical hit! ==';
	}
	updateLog(string);
};
// Decrease the usage energy
const updateEnergy = () => {
	const key = ('energy' + props.type) as ActionResourceKey;
	actionResourceUpdate(key, -energyUseAmount.value);
};
</script>
<template>
	<div class="ability-item">
		<DBox
			v-bind="{
				rarity: 'Legendary',
				title: props.name,
				subtitle: props.type + ' Ability',
				flavortext: props.flavortext,
			}"
		>
			<template #header-icon>
				<img
					class="ability-box-icon"
					:src="energyImage[props.type]"
				/>
			</template>
			<template #header-right>
				<div v-if="!props.dmgDieFormula">
					<div v-if="!props.damageStatsBase.hitType">
						<button
							class="cast-ability-button"
							@click="updateEnergy()"
							:title="isDisabled ? 'Not enough ' + props.type + ' energy' : ''"
							:disabled="isDisabled"
						>
							Use
						</button>
					</div>
					<div v-else>
						<button
							class="cast-ability-button"
							@click="(updateEnergy(), rollHit())"
							:title="isDisabled ? 'Not enough ' + props.type + ' energy' : ''"
							:disabled="isDisabled"
						>
							Hit
						</button>
					</div>
				</div>
				<div
					v-else
					style="display: flex; flex-direction: column; width: 4em"
				>
					<button
						@click="(updateEnergy(), rollHit())"
						:title="isDisabled ? 'Not enough ' + props.type + ' energy' : ''"
						:disabled="isDisabled"
					>
						Hit
					</button>
					<button @click="rollDamage()">Dmg</button>
				</div>
			</template>
			<template #contents>
				<div
					v-if="props.partialPowerAllowed"
					style="display: flex"
				>
					<span>Partial Power</span>
					<span style="flex-grow: 1"
						><table class="partial-power-stats">
							<tbody>
								<tr
									v-for="(stat, i) in props.partialPowerStats"
									:key="stat"
								>
									<td class="damage-stat-label">
										{{
											partialPowerStatLabels[
												stat as keyof typeof partialPowerStatLabels
											]
										}}
									</td>
									<td>
										{{
											props[stat as keyof Ability] ||
											props.damageStatsBase[stat as keyof DamageComponent]
										}}
									</td>
									<td>→</td>
									<td>
										{{
											partialPowerStats[
												stat as keyof typeof partialPowerStatLabels
											]
										}}
									</td>
									<td>(-{{ props.partialPowerStepMults[i] }}x)</td>
								</tr>
							</tbody>
						</table>
					</span>
					<span>
						<input
							type="number"
							v-model="partialPowerIncrement"
							min="0"
							:max="props.partialPowerSteps"
							style="width: 6em; height: 1.25em"
						/> ⁄ {{ props.partialPowerSteps }}
					</span>
				</div>
				<div style="padding: 8px; display: flex">
					<div
						v-if="props.dmgDieFormula"
						class="damage-main"
						:style="'color: var(--color-' + props.element.toLocaleLowerCase()"
					>
						<DGlyph
							v-if="element != 'Kinetic'"
							v-bind="{ name: element }"
							class="element-glyph"
							:style="'color: var(--color-' + element.toLocaleLowerCase + ')'"
						/>
						<img
							v-else
							class="kinetic-icon"
							src="/public/svgs/Kenetic.svg"
						/>
						<span
							:class="{ debuffed: debuffed.dmg }"
							:style="'color: var(--color-' + element.toLocaleLowerCase + ')'"
							:title="dmg.stringify()"
							>{{ dmgDisplays.short }}</span
						>
					</div>
					<div class="damage-sub">
						{{ props.type }} 
						<span
							class="energy-bar"
							:style="'background-image: ' + energyUsageGradientString"
						></span>
						 {{ maxEnergy }} → {{ currentEnergy - energyUseAmount }} (-{{
							energyUseAmount
						}})
					</div>
				</div>
				<table
					v-if="props.dmgDieFormula"
					class="damage-details"
				>
					<tbody>
						<tr>
							<td class="damage-stat-label">Average Dmg</td>
							<td
								class="damage-stat-data alt"
								:class="{ debuffed: debuffed.dmg }"
							>
								{{ dmgDisplays.avg }}
							</td>
							<td class="damage-stat-label">To Hit</td>
							<td
								class="damage-stat-data"
								:class="{ debuffed: debuffed.hitBonus }"
								:style="
									hitRangeMod > 0 && props.type !== 'Melee'
										? 'color: var(--color-debuff)'
										: ''
								"
							>
								{{
									(partialPowerStats.hitBonus as number) +
									getFinalStat('toHitSpell')
								}}
								v. {{ damageStatsBase.hitType }}
							</td>
							<td class="damage-stat-label">Range</td>
							<td
								class="damage-stat-data"
								:class="{ debuffed: debuffed.range }"
							>
								{{ props.rangeType }}
								{{ partialPowerStats.range }}ft. 
							</td>
						</tr>
						<tr>
							<td class="damage-stat-label">Min Dmg</td>
							<td
								class="damage-stat-data"
								:class="{ debuffed: debuffed.dmg }"
							>
								{{ dmgDisplays.min }}
							</td>
							<td class="damage-stat-label">Crit</td>
							<td
								class="damage-stat-data"
								:class="{ debuffed: debuffed.critRange }"
							>
								{{ getCritDisplay() }}
							</td>
							<td class="damage-stat-label">Shape</td>
							<td
								v-if="damageStatsBase.size"
								class="damage-stat-data"
								:class="{ debuffed: debuffed.size }"
							>
								{{ partialPowerStats.size }}ft. {{ damageStatsBase.shape }}
							</td>
							<td
								v-else
								class="damage-stat-data"
							>
								--
							</td>
						</tr>
						<tr>
							<td class="damage-stat-label">Max Dmg</td>
							<td
								class="damage-stat-data"
								:class="{ debuffed: debuffed.dmg }"
							>
								{{ dmgDisplays.max }}
							</td>
							<td class="damage-stat-label">Energy</td>
							<td class="damage-stat-data">{{ energyMax }}</td>
							<td class="damage-stat-label">Duration</td>
							<td
								v-if="damageStatsBase.duration"
								class="damage-stat-data"
								:class="{ debuffed: debuffed.duration }"
							>
								{{ partialPowerStats.duration }}
								{{ partialPowerStats.duration === 1 ? 'round' : 'rounds' }}
							</td>
							<td
								v-else
								class="damage-stat-data"
							>
								--
							</td>
						</tr>
						<tr>
							<td class="damage-stat-label">Attack Type</td>
							<td class="damage-stat-data">{{ damageStatsBase.attackType }}</td>
							<td class="damage-stat-label"></td>
							<td class="damage-stat-data">{{ type }} energy</td>
							<td class="damage-stat-label">Handed</td>
							<td
								class="damage-stat-data"
								:class="{ debuffed: debuffed.handed }"
							>
								{{ partialPowerStats.handed }}-handed
							</td>
						</tr>
					</tbody>
				</table>
				<div
					v-if="!!props.description"
					class="ability-info-text"
				>
					{{ props.description }}
				</div>
				<div
					v-if="!!props.specialProperties"
					class="ability-info-text"
				>
					{{ props.specialProperties }}
				</div>
				<div v-if="buffsFiltered.length > 0">
					<BuffItemRow
						v-for="buff in buffsFiltered"
						:key="buff.name"
						v-bind="buff"
						:character-id="characterId"
						:condensed="true"
					/>
				</div>
			</template>
		</DBox>
	</div>
</template>
<style>
.debuffed {
	color: var(--color-debuff);
}
.ability-item button {
	font-family: 'Destiny Symbols Common', sans-serif;
}
.ability-item button:disabled {
	color: #888;
}
.cast-ability-button {
	height: 3em;
	width: 4em;
	font-family: 'Destiny Symbols Common', sans-serif;
}
.damage-main {
	font-size: 2em;
	line-height: 1em;
	font-weight: bold;
	padding-right: 16px;
	border-right: 2px solid #fff8;
	display: flex;
}
.damage-sub {
	display: flex;
	align-items: center;
	flex-grow: 1;
	margin: auto 0;
	font-size: 1.1em;
	padding: 0 16px;
	white-space: nowrap;
}
.element-glyph {
	font-size: 0.9em;
}
.energy-bar {
	display: inline-block;
	max-width: 8em;
	flex-grow: 1;
	height: 1em;
}
.partial-power-stats {
	margin: 0 auto;
	border-collapse: collapse;
}
.partial-power-stats td {
	padding: 0 3px;
	text-align: right;
}
.damage-details {
	border-bottom: 2px solid #fff4;
	border-spacing: 0;
	table-layout: fixed;
	width: 100%;
	font-size: 0.9em;
	padding: 8px;
}
.damage-stat-label {
	font-weight: 800;
	text-align: right;
	padding-right: 0.25em;
	border-right: 2px solid #fff8;
	margin-right: 0.25em;
	white-space: nowrap;
}
.damage-stat-data {
	padding-left: 0.25em;
	white-space: nowrap;
	overflow-x: clip;
}
.damage-stat-data.alt {
	width: 7%;
}
.ability-info-text {
	white-space: pre-line;
}
</style>
