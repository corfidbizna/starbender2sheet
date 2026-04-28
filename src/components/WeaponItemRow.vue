<script setup lang="ts">
import { updateLog } from '@/sharedState.ts';
import useCharacterData, {
	labelToStatName,
	rangeMap,
	type StatName,
	type Weapon,
} from '@/composables/useCharacterData';
import DBox from '@/components/DBox.vue';
import DGlyph from './DGlyph.vue';
import CapacityBar from './CapacityBar.vue';
import { DiceFormula, getStatByCharacter } from '@/business_logic/diceFormula';
import { computed, ref } from 'vue';

const props = defineProps<Weapon & { characterId: string; activatable?: boolean }>();
const { weapons, damageStringToDownstream, statsBuffed, actionResources } = useCharacterData(
	props.characterId,
);
const weaponIndex = computed<number>(() =>
	weapons.value.findIndex((weapon) => weapon.name === props.name),
);
const getCritDisplay = (): string => {
	if (!weapon.value.critRange) {
		return '--';
	}
	const delimiter = ', ×';
	if (weapon.value.critRange === 1) {
		return 20 + delimiter + weapon.value.critMult;
	}
	return 21 - weapon.value.critRange + '–20' + delimiter + weapon.value.critMult;
};
const getAmmoTypeDisplay = (): string => {
	return weapon.value.ammoType.split(' ')[0];
};
const colorsElement = (element: string): string => {
	if (element === 'Solar') {
		return '#F16F27';
	}
	if (element === 'Void') {
		return '#B283CC';
	}
	if (element === 'Arc') {
		return '#7AECF3';
	}
	if (element === 'Stasis') {
		return '#4D87FF';
	}
	if (element === 'Strand') {
		return '#35E366';
	}
	return '#FFFFFF'; // Kinetic
};
const ammoImageSrc = () => {
	const ammo = weapon.value.ammoType.toLocaleLowerCase();
	if (ammo.includes('energy') || ammo.includes('special')) {
		return './svgs/ammo_special.svg';
	}
	if (ammo.includes('heavy')) {
		return './svgs/ammo_heavy.svg';
	}
	return './svgs/ammo_primary.svg';
};
const colorsAmmo = (ammoType: string) => {
	const alpha = 'ff';
	if (ammoType.includes('energy') || ammoType.includes('special')) {
		return '#7AF48B' + alpha;
	}
	if (ammoType.includes('heavy')) {
		return '#B286FF' + alpha;
	}
	return '#eeeeee' + alpha;
};
const glyphMap = {
	Bow: '',
	'Auto Rifle': '',
	'Pulse Rifle': '',
	'Scout Rifle': '',
	'Hand Cannon': '',
	'Submachine Gun': '',
	Sidearm: '',
	// Energy
	Shotgun: '',
	'Sniper Rifle': '',
	'Fusion Rifle': '',
	'Breech-Loading Grenade Launcher': '',
	'Trace Rifle': '',
	Glaive: '',
	// Heavy
	'Rocket Launcher': '',
	'Drum-Loading Grenade Launcher': '',
	'Linear Fusion Rifle': '',
	Sword: '',
	'Machine Gun': '',
	// Elements
	Kinetic: '',
	Solar: '',
	Arc: '',
	Void: '',
	Stasis: '',
	Strand: '',
	Prismatic: '',
	Nightmare: '',
};
type RollInfo = {
	value: number;
	glyph?: string;
	description: string;
};
const hitRangeMod = computed<number>(() => {
	const distance = actionResources.value.targetRange;
	const weaponRange = rangeMap[weapon.value.rangeType].range + weapon.value.range;
	const increment = Math.min(10, Math.max(0, distance / weaponRange));
	return Math.trunc(increment) * weapon.value.rangePenalty;
});
const toHitCalc = computed<number>(() => {
	let result = weapon.value.hitBonus || 0;
	result += isAiming.value ? 2 : 0;
	if (weapon.value.rangeType > 0) {
		result -= hitRangeMod.value;
	}
	result +=
		statsBuffed.value[
			labelToStatName[weapon.value.hitBonusSource.toLocaleLowerCase()] as StatName
		]?.total || 0;
	return result;
});
const hitFormula = new DiceFormula('1d20');
const advantageState = ref<string>('');
const isAiming = ref<boolean>(false);
const isPrecise = ref<boolean>(false);
const isCrit = ref<boolean>(false);
const isSneak = ref<boolean>(false);
const rollDamage = () => {
	// Precision icon: 
	const results: RollInfo[] = [];
	const loops = !advantageState.value ? 1 : 2;
	for (let i = 0; i < loops; i++) {
		const current: RollInfo = { value: 0, description: '' };
		const statFunction = getStatByCharacter(statsBuffed.value);
		const result = weapon.value.damageFormula.roll(statFunction);
		const glyph = glyphMap[weapon.value.damageType];
		const stringList = [];
		let total = 0;
		let isMultipleComponents = false;
		// Both a precise hit and a critical hit
		// This combined the base damage & crit damage for single-display, but that's been removed upon request.
		// If you want it back, un-comment this bit of code and turn the `if` beneath it to an `else if`
		// if (isPrecise.value && isCrit.value) {
		// 	stringList.push(' Damage:      ' + glyph + result * weapon.value.critMult);
		// 	total += result * weapon.value.critMult;
		if (isPrecise.value || isCrit.value) {
			// Whether or not there was a precise main hit
			isMultipleComponents = true;
			if (isPrecise.value) {
				stringList.push(' Damage:      ' + glyph + result);
				total += result;
			} else stringList.push('    Damage:      ' + glyph + result);
			// Whether or not there is critical damage added to it
			if (isCrit.value && weapon.value.critMult > 1) {
				stringList.push(' Crit damage:  ' + glyph + result * (weapon.value.critMult - 1));
				total += result * weapon.value.critMult;
			}
		} else {
			stringList.push('    Damage:      ' + glyph + result);
			total += result;
		}
		// This attack was a sneak attack
		if (isSneak.value) {
			isMultipleComponents = true;
			const sneakResult = new DiceFormula('1d6').roll(statFunction);
			if (isCrit.value) {
				stringList.push(' Sneak Attack: ' + glyph + sneakResult * weapon.value.critMult);
				total += sneakResult * weapon.value.critMult;
			} else {
				stringList.push(' Sneak Attack: ' + glyph + sneakResult);
				total += sneakResult;
			}
		}
		if (isMultipleComponents) stringList.push('    TOTAL:       ' + glyph + total);
		// let string =
		// 	glyphMap[props.weaponClass] +
		// 	props.name +
		// 	'\n    Damage:     ' +
		// 	glyphMap[weapon.value.damageType] +
		// 	result;
		// if (weapon.value.critMult && weapon.value.critMult > 1) {
		// 	string +=
		// 		'\n Crit damage: ' +
		// 		glyphMap[weapon.value.damageType] +
		// 		result * weapon.value.critMult;
		// }
		current.value = total;
		current.glyph = glyph;
		current.description = stringList.join('\n');
		results.push(current);
	}
	const stringTotal = () => {
		if (!advantageState.value) return '';
		const adv = advantageState.value === 'Advantage';
		const total = results
			.map((item) => item.value)
			.reduce((prev, curr) => (adv ? Math.max(curr, prev) : Math.min(curr, prev)));
		return (
			('\nWith ' + (adv ? '' : 'dis') + 'advantage: ').padEnd(20, ' ') +
			(results[0].glyph || '') +
			total
		);
	};
	updateLog(
		[
			glyphMap[props.weaponClass] + props.name,
			...results.map((result) => result.description),
		].join('\n') + stringTotal(),
	);
};
const rollHit = () => {
	isAiming.value = false;
	const results: RollInfo[] = [];
	const loops = !advantageState.value ? 1 : 2;
	for (let i = 0; i < loops; i++) {
		const result = hitFormula.roll(() => 0);
		let string = result + ' (dice) ' + ('+ ' + toHitCalc.value).replace('+-', '-') + ' (bonus)';
		if (weapon.value.rangeType > 0 && actionResources.value.targetRange > 0) {
			string +=
				' - ' + actionResources.value.targetRange * weapon.value.rangePenalty + ' (range)';
		}
		string += ' ⇒ ' + (result + toHitCalc.value) + ' hit result';
		if (result <= 1) {
			string += '\n == Natural 1! ==';
		}
		if (result > 20 - (weapon.value.critRange || 0)) {
			string += '\n == Critical hit! ==';
		}
		results.push({ value: result + toHitCalc.value, description: string });
	}
	const stringTotal = () => {
		if (!advantageState.value) return '';
		const adv = advantageState.value === 'Advantage';
		const total = results
			.map((item) => item.value)
			.reduce((prev, curr) => (adv ? Math.max(curr, prev) : Math.min(curr, prev)));
		return (
			('\nWith ' + (adv ? '' : 'dis') + 'advantage: ').padEnd(20, ' ') +
			(results[0].glyph || '') +
			total
		);
	};
	updateLog(
		[
			glyphMap[props.weaponClass] + props.name,
			...results.map((result) => result.description),
		].join('\n') + stringTotal(),
	);
	fire();
};

const fire = () => {
	weapons.value[weaponIndex.value].ammoCurrent -= weapon.value.ammo;
};
const reload = () => {
	updateLog('Reloaded ' + glyphMap[props.weaponClass] + props.name);
	const wep = weapons.value[weaponIndex.value];
	wep.ammoCurrent += weapon.value.ammoReloadAmount;
	if (!weapon.value.ammoCanOverflow) {
		// Cap to the ammo capacity of the weapon.
		wep.ammoCurrent = Math.min(wep.ammoCurrent, props.ammoCapacity);
	} else {
		// Otherwise, cap to the ammo capacity + 100%
		wep.ammoCurrent = Math.min(wep.ammoCurrent, props.ammoCapacity * 2);
	}
};

// Perks stuff lives here
const weapon = computed<Weapon>(() => {
	const modified = JSON.parse(JSON.stringify(props));
	modified.damageFormula = props.damageFormula;
	const perkKeys = Object.keys(props.perks);
	for (let i = 0; i < perkKeys.length; i++) {
		const perk = props.perks[perkKeys[i]];
		if (perk.takeAimDependant && !isAiming.value) {
			// Skip this perk if it wants to be taking aim and we aren't doing it.
			continue;
		}
		const stk = (statName: string) => {
			// If the stat is affected by stacks, return the stack amount.
			if (perk.stacking && perk.stackAffectedStats.includes(statName)) {
				return perk.stacks;
			}
			return 1;
		};
		if (weapons.value[weaponIndex.value]?.perks[perk.name]?.isActive) {
			if (perk.replaceStats) {
				// The perk needs to replace the weapon stat rather than supplement it.
				// Note: this will also be replaced by perks further down the line.
				modified.hitBonus = perk.hitBonus * stk('hitBonus') || modified.hitBonus;
				modified.critRange = perk.critRange * stk('critRange') || modified.critRange;
				modified.critMult = perk.critMult * stk('critMult') || modified.critMult;
				const damageStats = damageStringToDownstream(
					!!perk.dmgMax ? perk.dmgShort : modified.dmgShort,
					statsBuffed.value,
				);
				modified.damageFormula = damageStats.damageFormula;
				modified.dmgShort = damageStats.dmgShort;
				modified.dmgMin = damageStats.dmgMin;
				modified.dmgAvg = damageStats.dmgAvg;
				modified.dmgMax = damageStats.dmgMax;
				modified.range = perk.range * stk('range') || modified.range;
				modified.rangePenalty =
					perk.rangePenalty * stk('rangePenalty') || modified.rangePenalty;
				modified.rangeIncrementsModifier =
					perk.rangeIncrementsModifier * stk('rangeIncrementsModifier') ||
					modified.rangeIncrementsModifier;
				modified.size = perk.size * stk('size') || modified.size;
				modified.duration = perk.duration * stk('duration') || modified.duration;
				modified.ammo = perk.ammo * stk('ammo') || modified.ammo;
				modified.ammoCapacity =
					perk.ammoCapacity * stk('ammoCapacity') || modified.ammoCapacity;
				modified.ammoReloadAmount =
					perk.ammoReloadAmount * stk('ammoReloadAmount') || modified.ammoReloadAmount;
			} else {
				// Supplement things instead.
				modified.hitBonus += perk.hitBonus * stk('hitBonus') || 0;
				modified.critRange += perk.critRange * stk('critRange') || 0;
				modified.critMult += perk.critMult * stk('critMult') || 0;
				const damageStats = damageStringToDownstream(
					perk.damageFormula
						? modified.dmgShort + ('+' + perk.dmgShort).replace('+-', '-')
						: modified.dmgShort,
					statsBuffed.value,
				);
				modified.damageFormula = damageStats.damageFormula;
				modified.dmgShort = damageStats.dmgShort;
				modified.dmgMin = damageStats.dmgMin;
				modified.dmgAvg = damageStats.dmgAvg;
				modified.dmgMax = damageStats.dmgMax;
				modified.rangePenalty += perk.rangePenalty * stk('rangePenalty') || 0;
				modified.rangeIncrementsModifier +=
					perk.rangeIncrementsModifier * stk('rangeIncrementsModifier') || 0;
				modified.size += perk.size * stk('size') || 0;
				modified.duration += perk.duration * stk('duration') || 0;
				modified.ammo += perk.ammo * stk('ammo') || 0;
				modified.ammoCapacity += perk.ammoCapacity * stk('ammoCapacity') || 0;
				modified.ammoReloadAmount += perk.ammoReloadAmount * stk('ammoReloadAmount') || 0;
			}
			// To do regardless of replace or not.
			modified.attackType = perk.attackType || modified.attackType;
			modified.hitType = perk.hitType || modified.hitType;
			modified.hitType = perk.hitType || modified.hitType;
			modified.hitBonusSource = perk.hitBonusSource || modified.hitBonusSource;
			modified.damageType = perk.damageType || modified.damageType;
			modified.rangeType = perk.rangeType || modified.rangeType;
			modified.shape = perk.shape || modified.shape;
			modified.ammoType = perk.ammoType || modified.ammoType;
			modified.ammoCanOverflow = perk.ammoCanOverflow || modified.ammoCanOverflow;
			modified.isMagic = perk.isMagic || modified.isMagic;
		}
	}
	return modified;
});
</script>
<template>
	<label
		class="weapon-row"
		:for="name + '-equip'"
	>
		<DBox
			v-bind="{
				rarity: props.rarity,
				title: props.name,
				subtitle: (props.brand ? props.brand + ' ' : '') + props.weaponClass,
				flavortext: props.flavortext,
				lore: props.lore,
			}"
			:class="
				(isEquipped && !activatable ? 'active' : '') +
				' ' +
				(isActive && activatable ? 'active' : '')
			"
		>
			<template #header-icon>
				<input
					v-if="activatable"
					class="hidden"
					type="checkbox"
					:id="name + '-equip'"
					v-model="weapons[weaponIndex].isActive"
				/>
				<input
					v-else
					class="hidden"
					type="checkbox"
					:id="name + '-equip'"
					v-model="weapons[weaponIndex].isEquipped"
				/>
				<div class="gun-icon"><DGlyph v-bind="{ name: weaponClass }" /></div>
			</template>
			<template #header-right>
				<div class="action-buttons">
					<button @click="rollHit"><span class="glyph"></span><span>Hit</span></button>
					<button @click="rollDamage">
						<span class="glyph"></span><span>Dmg</span>
					</button>
				</div>
			</template>
			<template #contents>
				<div class="weapon-damage-info">
					<div class="damage-main">
						<DGlyph
							v-if="weapon.element != 'Kinetic'"
							v-bind="{ name: weapon.element }"
							class="element-glyph"
							:style="'color: ' + colorsElement(weapon.element)"
						/>
						<img
							v-else
							class="kinetic-icon"
							src="/public/svgs/Kenetic.svg"
						/>
						<span
							:style="'color: ' + colorsElement(weapon.element)"
							:title="weapon.dmgShort"
							>{{ weapon.dmgShort }} × {{ weapon.techMult }}</span
						>
					</div>
					<div class="damage-sub">
						<img
							class="ammo-image"
							:src="ammoImageSrc()"
						/>
						<span class="ammo-type">{{ ' ' + getAmmoTypeDisplay() }}</span>
						<CapacityBar
							v-bind="{
								max: weapon.ammoCapacity,
								current: weapons[weaponIndex].ammoCurrent,
								color: colorsAmmo(weapon.ammoType),
							}"
							class="ammo-bar"
						/>
						<span
							><input
								type="number"
								v-model="weapons[weaponIndex].ammoCurrent"
								style="width: 3em"
							/>
							⁄ {{ weapon.ammoCapacity }} </span
						>
						<!-- <button @click="fire()">Fire</button> -->
						<button
							class="button-reload"
							@click="reload()"
						>
							↺
						</button>
					</div>
				</div>
				<table class="weapon-details">
					<tbody class="weapon-cells">
						<tr>
							<td class="weapon-stat-label">Avg Dmg</td>
							<td class="weapon-stat-data alt">{{ weapon.dmgAvg }}</td>
							<td class="weapon-stat-label">To Hit</td>
							<td
								class="weapon-stat-data"
								:style="
									hitRangeMod > 0 &&
									(weapon.rangeType > 0 ? 'color: var(--color-debuff)' : '')
								"
							>
								{{ toHitCalc }} v. {{ weapon.hitType }}
							</td>
							<td class="weapon-stat-label">Range</td>
							<td class="weapon-stat-data">
								{{ weapon.range }}ft. {{ rangeMap[weapon.rangeType].name }}
							</td>
						</tr>
						<tr>
							<td class="weapon-stat-label">Dmg Range</td>
							<td class="weapon-stat-data">
								{{ weapon.dmgMin }}–{{ weapon.dmgMax }}
							</td>
							<td class="weapon-stat-label">Crit</td>
							<td class="weapon-stat-data">{{ getCritDisplay() }}</td>
							<td class="weapon-stat-label">Shape</td>
							<td
								v-if="weapon.size"
								class="weapon-stat-data"
							>
								{{ weapon.size }}ft. {{ weapon.shape }}
							</td>
							<td
								v-else
								class="weapon-stat-data"
							>
								--
							</td>
						</tr>
						<tr>
							<td class="weapon-stat-label">Attack Type</td>
							<td class="weapon-stat-data">{{ weapon.attackType }}</td>
							<td class="weapon-stat-label">Ammo</td>
							<td class="weapon-stat-data">{{ weapon.ammo }}</td>
							<td class="weapon-stat-label">Duration</td>
							<td
								v-if="weapon.duration"
								class="weapon-stat-data"
							>
								{{ weapon.duration }}
								{{ weapon.duration === 1 ? 'round' : 'rounds' }}
							</td>
							<td
								v-else
								class="weapon-stat-data"
							>
								--
							</td>
						</tr>
						<tr>
							<td class="weapon-stat-label">Autofire</td>
							<td class="weapon-stat-data">
								{{ weapon.autoFireRange ? weapon.autoFireRange : '--' }}
							</td>
							<td class="weapon-stat-label">Magazine</td>
							<td class="weapon-stat-data">
								{{ weapon.ammoCapacity }} {{ weapon.ammoType }}
							</td>
							<td class="weapon-stat-label">Handed</td>
							<td class="weapon-stat-data">{{ weapon.handed }}-handed</td>
						</tr>
					</tbody>
				</table>
				<div class="weapon-damage-mods">
					<select v-model="advantageState">
						<option value="">--</option>
						<option value="Advantage">Advantage</option>
						<option value="Disadvantage">Disadvantage</option>
					</select>
					<label
						><input
							type="checkbox"
							v-model="isAiming"
						/>Take Aim</label
					>
					<label :class="{ disabled: !weapon.critRange }"
						><input
							type="checkbox"
							:disabled="!weapon.critRange"
							v-model="isPrecise"
						/>Precise Hit</label
					>
					<label :class="{ disabled: !weapon.critRange }"
						><input
							type="checkbox"
							:disabled="!weapon.critRange"
							v-model="isCrit"
						/>Critical Hit</label
					>
					<label :class="{ disabled: !weapon.critRange }"
						><input
							type="checkbox"
							:disabled="!weapon.critRange"
							v-model="isSneak"
						/>Sneak Attack</label
					>
				</div>
				<div
					class="weapon-perks"
					v-if="Object.keys(perks).length"
				>
					<details
						v-for="perk in perks"
						:key="perk.name"
						class="weapon-perk"
						:class="{
							active:
								weapons[weaponIndex].perks[perk.name].isActive &&
								(perk.takeAimDependant ? isAiming : true),
							disabled: perk.takeAimDependant ? !isAiming : false,
						}"
						:for="'perk ' + perk.name"
					>
						<summary>
							<input
								type="checkbox"
								:class="{ hidden: perk.passive }"
								:disabled="
									perk.passive || (perk.takeAimDependant ? !isAiming : false)
								"
								v-model="weapons[weaponIndex].perks[perk.name].isActive"
							/><span>{{ perk.name }}  </span>
							<span v-if="perk.stacking"
								><input
									class="weapon-perk-stacks"
									type="number"
									min="0"
									:max="perk.stacksMax || Infinity"
									v-model="weapons[weaponIndex].perks[perk.name].stacks"
							/></span>
							<span
								v-if="perk.takeAimDependant"
								style="font-style: italic"
								>(Must be aiming)</span
							>
						</summary>
						<div>{{ perk.description }}</div>
					</details>
				</div>
				<div
					v-if="description"
					class="weapon-description"
				>
					{{ description }}
				</div>
			</template>
			<template #footer-text>
				<span
					v-if="isEquipped && !activatable"
					class="is-equipped"
					>CURRENTLY EQUIPPED</span
				>
				<span
					v-else-if="isActive"
					class="is-equipped"
					>CURRENTLY ACTIVE</span
				>
			</template>
		</DBox>
	</label>
</template>
<style scoped>
.weapon-row {
	display: block;
	font-size: 0.9em;
	max-width: 40em;
	text-shadow: none;
}
.weapon-row.disabled {
	opacity: 0.5;
}
.gun-icon {
	font-size: 1.9em;
	display: inline-block;
	padding-right: 0.25em;
	text-shadow: none;
	vertical-align: super;
	margin: 0.1em;
	/* border-right: 2px solid #fffd; */
}
.element-glyph {
	display: inline-block;
	font-size: 0.9em;
	vertical-align: top;
}
h1 {
	display: flex;
	font-size: 1.3em;
	line-height: 1em;
	font-weight: 800;
	padding: 0;
	margin: 0;
	margin-top: 0.5em;
}
h2 {
	margin: 0.25em 0;
	font-weight: 400;
	font-size: 1em;
	display: block;
	padding: 0;
	border: none;
	opacity: 0.5;
}
.weapon-header {
	padding: 0.25em;
	display: flex;
}
.weapon-header.common {
	color: #000;
}
.weapon-titles {
	display: flex;
	flex-grow: 1;
}
input[type='checkbox'].hidden {
	visibility: collapse;
	width: 0;
}
.action-buttons {
	display: flex;
	align-items: normal;
	flex-direction: column;
}
.weapon-content {
	background-color: #0008;
}
.weapon-damage-info {
	padding: 8px;
	border-bottom: var(--line);
	display: flex;
}
.damage-main {
	font-size: 2.4em;
	line-height: 1em;
	font-weight: bold;
	padding-right: 16px;
	border-right: var(--line);
	display: flex;
}
.damage-sub {
	width: fit-content;
	margin: auto 0;
	font-size: 1.1em;
	padding-left: 16px;
	white-space: nowrap;
}
.damage-sub * {
	vertical-align: middle;
}
.ammo-image {
	height: 2em;
	/* vertical-align: bottom; */
}
.ammo-type {
	text-transform: uppercase;
}
.ammo-bar {
	max-width: 5em;
	margin: 0 0.3em;
}
.weapon-details {
	border-bottom: var(--line);
	border-spacing: 0;
	table-layout: fixed;
	width: 100%;
	font-size: 0.9em;
	padding: 8px;
}
.weapon-stat-label {
	font-weight: 800;
	text-align: right;
	padding-right: 0.25em;
	border-right: var(--line);
	margin-right: 0.25em;
	white-space: nowrap;
}
.weapon-stat-data {
	padding-left: 0.25em;
	white-space: nowrap;
}
.weapon-stat-data.modified {
	color: var(--color-buff);
}
.weapon-stat-data.alt {
	width: 7%;
}

.weapon-damage-mods {
	background-color: #fff2;
	border-bottom: none;
	display: flex;
	text-align: center;
}
.weapon-damage-mods .disabled {
	color: #888;
}
.weapon-damage-mods * {
	flex-grow: 1;
}

.weapon-perks {
	flex: 2;
	/* max-height: 6em;
	overflow-y: scroll; */
}
.weapon-perk {
	margin: 0.25em;
	padding: 0.25em;
	display: block;
	border: 2px solid #fff0;
}
.weapon-perk.active {
	border: 2px solid #fff4;
	background-color: #fff4;
}
.weapon-perk.disabled {
	color: #aaa;
}
.weapon-perk .hidden {
	visibility: hidden;
}
.weapon-perk-stacks {
	width: 3em;
}
.flavortext {
	font-style: italic;
	font-weight: 100;
	color: #fffa;
	padding: 0.75em;
	border-top: var(--line);
	border-bottom: var(--line);
}
/* .is-equipped {
	height: 1em;
	padding: 0.2em;
	padding-bottom: 0;
	background: #000a;
	text-align: right;
	color: #000a;
}
.equipped .is-equipped {
	background: #fff;
} */
.is-equipped {
	padding-top: 2px;
	display: block;
}
.kinetic-icon {
	width: 1em;
	height: 1em;
	filter: invert(100%);
}
.button-reload {
	margin-left: 3px;
}
button {
	color: #fff;
	text-decoration: none;
	border: 1px solid #fff8;
	background: #0003;
	transition: background 0.1s;
}
button .glyph {
	font-family: 'Destiny Symbols Common';
}
button:hover {
	background: #fff1;
	transition: background 0.1s;
}
button:active {
	background: #fff8;
}
.weapon-description {
	white-space: pre-line;
}
</style>
