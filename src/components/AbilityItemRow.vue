<script setup lang="ts">
import type {
	Ability,
	ActionResourceKey,
	CharacterNames,
	StatsCalculatedKey,
} from '@/composables/useCharacterData';
import useCharacterData from '@/composables/useCharacterData';
import DBox from '@/components/DBox.vue';
import { computed, ref } from 'vue';
import DGlyph from '@/components/DGlyph.vue';
import { DiceFormula, getStatByCharacter } from '@/business_logic/diceFormula';
import { updateLog } from '@/sharedState';

type CharacterProps = {
	characterId: CharacterNames;
};
const props = defineProps<Ability & CharacterProps>();
const {
	stats,
	statsBase,
	buffsAsStats,
	buffsTallied,
	getFinalStat,
	actionResources,
	actionResourceUpdate,
} = useCharacterData(props.characterId);
const isDisabled = computed<boolean>(() => {
	return energyUseAmount.value > actionResources.value['energy' + props.type];
});
const currentEnergy = computed<number>(() => actionResources.value['energy' + props.type]);
const maxEnergy = computed<number>(() =>
	getFinalStat(('energy' + props.type) as StatsCalculatedKey),
);
const energyUseAmount = computed<number>(() => props.energyMax - partialPowerIncrement.value);
const energyUsageGradientString = computed<string>(() => {
	// Colors
	const colRemaining = '#eee';
	const colSubtracted = 'var(--color-debuff)';
	const colEmpty = '#0004';
	const energyProgress = (100 * currentEnergy.value) / maxEnergy.value;
	const useProgress = Math.max(
		0,
		(100 * (currentEnergy.value - energyUseAmount.value)) / maxEnergy.value,
	);
	return (
		'linear-gradient(to right, ' +
		colRemaining +
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
const updateEnergy = (energyUsed: number) => {
	const key = ('energy' + props.type) as ActionResourceKey;
	actionResourceUpdate(key, -energyUsed);
};
const glyphMap = {
	Kinetic: '',
	Solar: '',
	Arc: '',
	Void: '',
	Stasis: '',
	Strand: '',
	Prismatic: '',
};
const classIcon = computed<string>(() => {
	const gClass = statsBase.value.guardianClass;
	const classMap: Record<string, string> = {
		Titan: '/public/svgs/class_titan_proportional.svg',
		Warlock: '/public/svgs/class_warlock_proportional.svg',
		Hunter: '/public/svgs/class_hunter_proportional.svg',
	};
	return classMap[gClass] || '/public/svgs/Tricorn.svg';
});
const energyImage: Record<string, string> = {
	Super: '/public/svgs/stat_intellect.svg',
	Grenade: '/public/svgs/stat_discipline.svg',
	Melee: '/public/svgs/stat_melee.svg',
	Class: classIcon.value,
	Universal: '/public/svgs/Tricorn.svg',
};
const getCritDisplay = (): string => {
	if (!props.critRange) {
		return '--';
	}
	const delimiter = ', x';
	if (props.critRange === 20) {
		return props.critRange + delimiter + props.critMult;
	}
	return 21 - props.critRange + '-20' + delimiter + props.critMult;
};
const partialPowerIncrement = ref<number>(0);
const partialPowerStats = {
	hitBonus: 'Hit Bonus',
	critRange: 'Crit Range',
	critMult: 'Crit Mult',
	dmgDieQuantity: 'Damage Dice Count',
	range: 'Range',
	size: 'Size',
	duration: 'Duration',
	handed: 'Handedness',
};
const partialPowerAffectedStats = computed<Record<string, number | DiceFormula>>(() => {
	const result = {
		hitBonus: props.hitBonus,
		critRange: props.critRange,
		critMult: props.critMult,
		dmgDieQuantity: props.dmgDieQuantity,
		range: props.range,
		size: props.size,
		duration: props.duration,
		handed: props.handed,
		dmg: props.dmg,
	};
	props.partialPowerStats.forEach((statName, i) => {
		const key = statName as keyof typeof partialPowerStats;
		const subtractAmount = partialPowerIncrement.value * props.partialPowerStepMults[i] || 0;
		result[key] -= subtractAmount;
	});
	const newDamage = (result.dmgDieQuantity || '0') + (props.dmgDieFormula || 'd0');
	console.log(newDamage + ' ' + partialPowerIncrement.value);
	result.dmg = new DiceFormula(newDamage);
	return result;
});
const dmgDisplays = computed<Record<string, string>>(() => {
	const statFunction = getStatByCharacter(buffsAsStats.value);
	const damage = partialPowerAffectedStats.value.dmg as DiceFormula;
	return {
		short: damage.evaluateExceptDice(statFunction).stringify(),
		min: damage.min(statFunction) + '',
		max: damage.max(statFunction) + '',
		avg: damage.mean(statFunction) + '',
	};
});
const hitFormula = new DiceFormula('1d20');
const rollDamage = () => {
	const statFunction = getStatByCharacter(buffsAsStats.value);
	const result = (partialPowerAffectedStats.value.dmg as DiceFormula).roll(statFunction);
	let string = props.name + '\n  Damage:     ' + glyphMap[props.element] + result;
	if ((partialPowerAffectedStats.value.critMult as number) > 1) {
		string +=
			'\n  Crit damage: ' +
			glyphMap[props.element] +
			result * (partialPowerAffectedStats.value.critMult as number);
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
	if (result > 20 - ((partialPowerAffectedStats.value.critRange as number) || 0)) {
		string += '\n == Critical hit! ==';
	}
	updateLog(string);
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
				<div v-if="props.dmgDieFormula === undefined">
					<div v-if="props.hitType === undefined">
						<button
							class="cast-ability-button"
							@click="updateEnergy(energyUseAmount)"
							:title="isDisabled ? 'Not enough ' + props.type + ' energy' : ''"
							:disabled="isDisabled"
						>
							Use
						</button>
					</div>
					<div v-else>
						<button
							class="cast-ability-button"
							@click="(updateEnergy(energyUseAmount), rollHit())"
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
						@click="(updateEnergy(energyUseAmount), rollHit())"
						:title="isDisabled ? 'Not enough ' + props.type + ' energy' : ''"
						:disabled="isDisabled"
					>
						Hit
					</button>
					<button @click="rollDamage()">Dmg</button>
				</div>
			</template>
			<template #contents>
				<div v-if="props.partialPowerAllowed">
					Partial Power (affects
					{{
						props.partialPowerStats
							.map(
								(name) => partialPowerStats[name as keyof typeof partialPowerStats],
							)
							.join(', ')
					}})
					<input
						type="number"
						v-model="partialPowerIncrement"
						min="0"
						:max="props.partialPowerSteps"
						style="width: 100%"
					/>
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
					<tbody class="damage-cells">
						<tr>
							<td class="damage-stat-label">Average Dmg</td>
							<td class="damage-stat-data alt">{{ dmgDisplays.avg }}</td>
							<td class="damage-stat-label">To Hit</td>
							<td
								class="damage-stat-data"
								:style="
									hitBonus > 0 && props.rangeType === 'Spell'
										? 'color: var(--color-debuff)'
										: ''
								"
							>
								{{
									(partialPowerAffectedStats.hitBonus as number) +
									getFinalStat('toHitSpell')
								}}
								v. {{ hitType }}
							</td>
							<td class="damage-stat-label">Range</td>
							<td class="damage-stat-data">
								{{ rangeType }} {{ partialPowerAffectedStats.range }}ft. 
							</td>
						</tr>
						<tr>
							<td class="damage-stat-label">Min Dmg</td>
							<td class="damage-stat-data">{{ dmgDisplays.min }}</td>
							<td class="damage-stat-label">Crit</td>
							<td class="damage-stat-data">{{ getCritDisplay() }}</td>
							<td class="damage-stat-label">Shape</td>
							<td
								v-if="size"
								class="damage-stat-data"
							>
								{{ partialPowerAffectedStats.size }}ft. {{ shape }}
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
							<td class="damage-stat-data">{{ dmgDisplays.max }}</td>
							<td class="damage-stat-label">Energy</td>
							<td class="damage-stat-data">{{ energyMax }}</td>
							<td class="damage-stat-label">Duration</td>
							<td
								v-if="duration"
								class="damage-stat-data"
							>
								{{ partialPowerAffectedStats.duration }} rounds
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
							<td class="damage-stat-data">{{ element }}</td>
							<td class="damage-stat-label"></td>
							<td class="damage-stat-data">{{ type }} energy</td>
							<td class="damage-stat-label">Handed</td>
							<td class="damage-stat-data">
								{{ partialPowerAffectedStats.handed }}-handed
							</td>
						</tr>
					</tbody>
				</table>
				<div v-if="!!props.description">{{ props.description }}</div>
				<div v-if="!!props.specialProperties">{{ props.specialProperties }}</div>
			</template>
		</DBox>
	</div>
</template>
<style>
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
}
.damage-stat-data.alt {
	width: 7%;
}
</style>
