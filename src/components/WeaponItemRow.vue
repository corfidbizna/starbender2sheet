<script setup lang="ts">
import { updateLog } from '@/sharedState.ts';
import useCharacterData, { type Weapon } from '@/composables/useCharacterData';
import DGlyph from './DGlyph.vue';
import CapacityBar from './CapacityBar.vue';
import { DiceFormula } from '@/business_logic/diceFormula';
import { computed, ref } from 'vue';

const props = defineProps<Weapon & { characterId: string; activatable?: boolean }>();
const {
	weapons,
	weaponAmmoUpdate,
	damageStringToDownstream,
	getFinalStat,
	buffsAsStats,
	actionResources,
} = useCharacterData(props.characterId);
const weaponIndex = computed<number>(() =>
	weapons.value.findIndex((weapon) => weapon.name === props.name),
);
const getCritDisplay = (): string => {
	if (!weapon.value.critRange) {
		return '--';
	}
	const delimiter = ', x';
	if (weapon.value.critRange === 1) {
		return 20 + delimiter + weapon.value.critMult;
	}
	return 21 - weapon.value.critRange + '-20' + delimiter + weapon.value.critMult;
};
const getAmmoTypeDisplay = (): string => {
	return weapon.value.ammoType.split(' ')[0];
};
const colorsRarity = (rarity: string): string => {
	if (rarity === 'Uncommon') {
		return '#356f42';
	}
	if (rarity === 'Rare') {
		return '#5076a3';
	}
	if (rarity === 'Legendary') {
		return '#522e65';
	}
	if (rarity === 'Exotic') {
		return '#cdae34';
	}
	return '#c2bdb4';
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
		return '/public/svgs/ammo_special.svg';
	}
	if (ammo.includes('heavy')) {
		return '/public/svgs/ammo_heavy.svg';
	}
	return '/public/svgs/ammo_primary.svg';
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
};
const hitRangeMod = computed<number>(() => {
	const distance = actionResources.value.targetRange;
	const increment = Math.min(10, Math.max(0, distance / weapon.value.range));
	return Math.trunc(increment) * weapon.value.rangePenalty;
});
const toHitCalc = computed<number>(() => {
	let result = weapon.value.hitBonus || 0;
	if (weapon.value.rangeType === 'Melee') {
		result += getFinalStat('toHitMelee');
	} else if (weapon.value.rangeType === 'Ranged') {
		result += getFinalStat('toHitRanged');
		result -= hitRangeMod.value;
	} else if (weapon.value.rangeType === 'Spell') {
		result += getFinalStat('toHitSpell');
		result -= hitRangeMod.value;
	}
	return result;
});
const hitFormula = new DiceFormula('1d20');
const rollDamage = () => {
	const result = weapon.value.damageFormula.roll(() => 0);
	let string =
		glyphMap[props.weaponClass] +
		props.name +
		'\n  Damage:     ' +
		glyphMap[weapon.value.damageType] +
		result;
	if (weapon.value.critMult && weapon.value.critMult > 1) {
		string +=
			'\n  Crit damage: ' +
			glyphMap[weapon.value.damageType] +
			result * weapon.value.critMult;
	}
	updateLog(string);
};
const rollHit = () => {
	const result = hitFormula.roll(() => 0);
	let string =
		glyphMap[props.weaponClass] +
		props.name +
		'\n  ' +
		result +
		' (dice) ' +
		('+ ' + toHitCalc.value).replace('+-', '-') +
		' (bonus)';
	if (weapon.value.rangeType !== 'Melee' && actionResources.value.rangeIncrement > 0) {
		string +=
			' - ' + actionResources.value.rangeIncrement * weapon.value.rangePenalty + ' (range)';
	}
	string += '\n  Hit result ⇒ ' + (result + toHitCalc.value);
	if (result <= 1) {
		string += '\n == Natural 1! ==';
	}
	if (result > 20 - (weapon.value.critRange || 0)) {
		string += '\n == Critical hit! ==';
	}
	updateLog(string);
	fire();
};

const currentAmmo = ref<number>(props.ammoCurrent);
const fire = () => {
	currentAmmo.value = weaponAmmoUpdate(props.name, -weapon.value.ammo);
};
const reload = () => {
	updateLog('Reloaded ' + glyphMap[props.weaponClass] + props.name);
	const difference = weapon.value.ammoCapacity - props.ammoCurrent;
	currentAmmo.value = weaponAmmoUpdate(props.name, difference);
};

// Perks stuff lives here
const weapon = computed<Weapon>(() => {
	const modified = JSON.parse(JSON.stringify(props));
	const perkKeys = Object.keys(props.perks);
	for (let i = 0; i < perkKeys.length; i++) {
		const perk = props.perks[perkKeys[i]];
		const stk = (statName: string) => {
			if (perk.stacking && perk.stackAffectedStats.includes(statName)) {
				return perk.stacks;
			}
			return 1;
		};
		if (weapons.value[weaponIndex.value].perks[perk.name].isActive) {
			if (perk.replaceStats) {
				// The perk needs to replace the weapon stat rather than supplement it.
				// Note, this will also be replaced by perks further down the line.
				modified.hitBonus = perk.hitBonus * stk('hitBonus') || modified.hitBonus;
				modified.critRange = perk.critRange * stk('critRange') || modified.critRange;
				modified.critMult = perk.critMult * stk('critMult') || modified.critMult;
				const damageStats = damageStringToDownstream(
					!!perk.dmgMax ? perk.dmgShort : modified.dmgShort,
					buffsAsStats.value,
				);
				modified.damageFormula = damageStats.damageFormula;
				modified.dmgShort = damageStats.dmgShort;
				modified.dmgMin = damageStats.dmgMin;
				modified.dmgAvg = damageStats.dmgAvg;
				modified.dmgMax = damageStats.dmgMax;
				modified.range = perk.range * stk('range') || modified.range;
				modified.rangePenalty = perk.rangePenalty * stk('rangePenalty') || modified.range;
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
				modified.hitBonus = modified.hitBonus || 0 + perk.hitBonus * stk('hitBonus');
				modified.critRange = modified.critRange || 0 + perk.critRange * stk('critRange');
				modified.critMult = modified.critMult || 0 + perk.critMult * stk('critMult');
				const damageStats = damageStringToDownstream(
					perk.damageFormula
						? modified.dmgShort + '+' + perk.dmgShort
						: modified.dmgShort,
					buffsAsStats.value,
				);
				modified.damageFormula = damageStats.damageFormula;
				modified.dmgShort = damageStats.dmgShort;
				modified.dmgMin = damageStats.dmgMin;
				modified.dmgAvg = damageStats.dmgAvg;
				modified.dmgMax = damageStats.dmgMax;
				modified.rangePenalty += perk.rangePenalty * stk('rangePenalty');
				modified.rangeIncrementsModifier +=
					perk.rangeIncrementsModifier * stk('rangeIncrementsModifier');
				modified.size = modified.size || 0 + perk.size * stk('size');
				modified.duration = modified.duration || 0 + perk.duration * stk('duration');
				modified.ammo = perk.ammo * stk('ammo') || modified.ammo;
				modified.ammoCapacity =
					perk.ammoCapacity * stk('ammoCapacity') || modified.ammoCapacity;
				modified.ammoReloadAmount =
					perk.ammoReloadAmount * stk('ammoReloadAmount') || modified.ammoReloadAmount;
			}
			// To do regardless of replace or not.
			modified.attackType = perk.attackType || modified.attackType;
			modified.hitType = perk.hitType || modified.hitType;
			modified.hitType = perk.hitType || modified.hitType;
			modified.damageType = perk.damageType || modified.damageType;
			modified.rangeType = perk.rangeType || modified.rangeType;
			modified.shape = perk.shape || modified.shape;
			modified.ammoType = perk.ammoType || modified.ammoType;
			modified.isMagic = perk.isMagic || modified.isMagic;
		}
	}
	return modified;
});
</script>
<template>
	<label
		class="weapon-row"
		:class="
			(isEquipped && !activatable ? 'equipped' : '') +
			' ' +
			(isActive && activatable ? 'equipped' : '')
		"
		:for="name + '-equip'"
	>
		<div
			class="weapon-header"
			:class="rarity.toLocaleLowerCase()"
			:style="'background-color: ' + colorsRarity(rarity)"
		>
			<div class="weapon-titles">
				<input
					v-if="activatable"
					type="checkbox"
					:id="name + '-equip'"
					v-model="weapons[weaponIndex].isActive"
				/>
				<input
					v-else
					type="checkbox"
					:id="name + '-equip'"
					v-model="weapons[weaponIndex].isEquipped"
				/>
				<div class="gun-icon"><DGlyph v-bind="{ name: weaponClass }" /></div>
				<div class="gun-titles">
					<h1>
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
						<span>{{ name }}</span>
					</h1>
					<h2>
						{{ weaponClass.toUpperCase() }}
					</h2>
				</div>
			</div>
			<div class="action-buttons">
				<button @click="rollHit"><span class="glyph"></span><span>Hit</span></button>
				<button @click="rollDamage"><span class="glyph"></span><span>Dmg</span></button>
			</div>
		</div>
		<div class="weapon-content">
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
						>{{ weapon.dmgShort }}</span
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
							current: currentAmmo,
							color: colorsAmmo(weapon.ammoType),
						}"
						class="ammo-bar"
					/>
					<span>{{ currentAmmo }} ⁄ {{ weapon.ammoCapacity }}</span>
					<button @click="reload()">↺</button>
				</div>
			</div>
			<table class="weapon-details">
				<tbody class="weapon-cells">
					<tr>
						<td class="weapon-stat-label">Average Dmg</td>
						<td class="weapon-stat-data alt">{{ weapon.dmgAvg }}</td>
						<td class="weapon-stat-label">To Hit</td>
						<td
							class="weapon-stat-data"
							:style="
								hitRangeMod > 0 && weapon.rangeType !== 'Melee'
									? 'color: var(--color-debuff)'
									: ''
							"
						>
							{{ toHitCalc }} v. {{ weapon.hitType }}
						</td>
						<td class="weapon-stat-label">Range</td>
						<td class="weapon-stat-data">
							{{ weapon.rangeType }} {{ weapon.range }}ft. 
						</td>
					</tr>
					<tr>
						<td class="weapon-stat-label">Min Dmg</td>
						<td class="weapon-stat-data">{{ weapon.dmgMin }}</td>
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
						<td class="weapon-stat-label">Max Dmg</td>
						<td class="weapon-stat-data">{{ weapon.dmgMax }}</td>
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
						<td class="weapon-stat-label">Attack Type</td>
						<td class="weapon-stat-data">{{ weapon.attackType }}</td>
						<td class="weapon-stat-label">Magazine</td>
						<td class="weapon-stat-data">
							{{ weapon.ammoCapacity }} {{ weapon.ammoType }}
						</td>
						<td class="weapon-stat-label">Handed</td>
						<td class="weapon-stat-data">{{ weapon.handed }}-handed</td>
					</tr>
				</tbody>
			</table>
			<div class="weapon-perks">
				<details
					v-for="perk in perks"
					:key="perk.name"
					class="weapon-perk"
					:class="{ active: weapons[weaponIndex].perks[perk.name].isActive }"
					:for="'perk ' + perk.name"
				>
					<summary>
						<input
							type="checkbox"
							:class="{ hidden: perk.passive }"
							:disabled="perk.passive"
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
					</summary>
					<div>{{ perk.description }}</div>
				</details>
			</div>
			<div
				class="flavortext"
				v-if="flavortext"
			>
				{{ flavortext }}
			</div>
			<div class="weapon-footer">
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
			</div>
		</div>
	</label>
</template>
<style scoped>
.weapon-row {
	display: block;
	font-size: 0.9em;
	margin: 0.5em auto;
	max-width: 40em;
	background-blend-mode: multiply;
	border: 4px solid #fff0;
	text-shadow: none;
}
.weapon-row.equipped {
	border-color: #ffff;
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
.weapon-titles input[type='checkbox'] {
	visibility: collapse;
}
.action-buttons {
	flex-shrink: 0;
}
.weapon-content {
	background-color: #0008;
}
.weapon-damage-info {
	padding: 8px;
	border-bottom: 2px solid #fff4;
	display: flex;
}
.damage-main {
	font-size: 2.8em;
	line-height: 1em;
	font-weight: bold;
	padding-right: 16px;
	border-right: 2px solid #fff8;
	display: flex;
}
.damage-sub {
	display: inline-block;
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
	width: 5em;
	margin: 0 0.3em;
}
.weapon-details {
	border-bottom: 2px solid #fff4;
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
	border-right: 2px solid #fff8;
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
.weapon-perks {
	flex: 2;
	/* max-height: 6em;
	overflow-y: scroll; */
}
.weapon-perk {
	margin: 0.5em;
	padding: 0.25em;
	display: block;
	border: 2px solid #fff0;
}
.weapon-perk.active {
	border: 2px solid #fff4;
	background-color: #fff4;
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
	border-top: 2px solid #fff4;
	border-bottom: 2px solid #fff4;
}
.weapon-footer {
	height: 1em;
	padding: 0.2em;
	padding-bottom: 0;
	background: #000a;
	text-align: right;
	color: #000a;
}
.equipped .weapon-footer {
	background: #fff;
}
.kinetic-icon {
	width: 1em;
	height: 1em;
	filter: invert(100%);
}
button {
	color: #fff;
	text-decoration: none;
	border: 1px solid #fff8;
	background: #0003;
	transition: background 0.1s;
	margin: 3px;
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
</style>
