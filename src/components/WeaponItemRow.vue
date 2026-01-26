<script setup lang="ts">
import { updateLog } from '@/sharedState.ts';
import useCharacterData, { type Weapon } from '@/composables/useCharacterData';
import DGlyph from './DGlyph.vue';
import CapacityBar from './CapacityBar.vue';
import { DiceFormula } from '@/business_logic/diceFormula';
import { computed, ref } from 'vue';

const props = defineProps<Weapon & { characterId: string; activatable?: boolean }>();
const {
	weaponAmmoUpdate,
	namesOfEquippedWeapons,
	namesOfActiveWeapons,
	buffsTallied,
	stats,
	actionResources,
} = useCharacterData(props.characterId);
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
const getAmmoTypeDisplay = (): string => {
	return props.ammoType.split(' ')[0];
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
	const ammo = props.ammoType.toLocaleLowerCase();
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
	const increment = Math.min(10, Math.max(0, distance / props.range));
	return Math.trunc(increment) * props.rangePenalty;
});
const toHitCalc = computed<number>(() => {
	let result = props.hitBonus || 0;
	if (props.rangeType === 'Melee') {
		result += buffsTallied.value.toHitMelee?.total || stats.value.toHitMelee;
	} else if (props.rangeType === 'Ranged') {
		result += buffsTallied.value.toHitRanged?.total || stats.value.toHitRanged;
		result -= hitRangeMod.value;
	} else if (props.rangeType === 'Spell') {
		result += buffsTallied.value.toHitSpell?.total || stats.value.toHitSpell;
		result -= hitRangeMod.value;
	}
	return result;
});
const hitFormula = new DiceFormula('1d20');
const rollDamage = () => {
	const result = props.damageFormula.roll(() => 0);
	let string =
		glyphMap[props.weaponClass] +
		props.name +
		'\n  Damage:     ' +
		glyphMap[props.damageType] +
		result;
	if (props.critMult && props.critMult > 1) {
		string += '\n  Crit damage: ' + glyphMap[props.damageType] + result * props.critMult;
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
	if (props.rangeType !== 'Melee' && actionResources.value.rangeIncrement > 0) {
		string += ' - ' + actionResources.value.rangeIncrement * props.rangePenalty + ' (range)';
	}
	string += '\n  Hit result ⇒ ' + (result + toHitCalc.value);
	if (result <= 1) {
		string += '\n == Natural 1! ==';
	}
	if (result > 20 - (props.critRange || 0)) {
		string += '\n == Critical hit! ==';
	}
	updateLog(string);
	fire();
};
const currentAmmo = ref<number>(props.ammoCurrent);
const fire = () => {
	currentAmmo.value = weaponAmmoUpdate(props.name, -props.ammo);
};
const reload = () => {
	updateLog('Reloaded ' + glyphMap[props.weaponClass] + props.name);
	const difference = props.ammoCapacity - props.ammoCurrent;
	currentAmmo.value = weaponAmmoUpdate(props.name, difference);
};
</script>
<template>
	<label
		class="weapon-row"
		:class="
			(equipped && !activatable ? 'equipped' : '') +
			' ' +
			(active && activatable ? 'equipped' : '')
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
					:value="name"
					v-model="namesOfActiveWeapons"
				/>
				<input
					v-else
					type="checkbox"
					:id="name + '-equip'"
					:value="name"
					v-model="namesOfEquippedWeapons"
				/>
				<div class="gun-icon"><DGlyph v-bind="{ name: weaponClass }" /></div>
				<div class="gun-titles">
					<h1>
						<DGlyph
							v-if="element != 'Kinetic'"
							v-bind="{ name: element }"
							class="element-glyph"
							:style="'color: ' + colorsElement(element)"
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
						v-if="element != 'Kinetic'"
						v-bind="{ name: element }"
						class="element-glyph"
						:style="'color: ' + colorsElement(element)"
					/>
					<img
						v-else
						class="kinetic-icon"
						src="/public/svgs/Kenetic.svg"
					/>
					<span
						:style="'color: ' + colorsElement(element)"
						:title="damage"
						>{{ dmgShort }}</span
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
							max: ammoCapacity,
							current: currentAmmo,
							color: colorsAmmo(ammoType),
						}"
						class="ammo-bar"
					/>
					<span>{{ currentAmmo }} ⁄ {{ props.ammoCapacity }}</span>
					<button @click="reload()">↺</button>
				</div>
			</div>
			<table class="weapon-details">
				<tbody class="weapon-cells">
					<tr>
						<td class="weapon-stat-label">Average Dmg</td>
						<td class="weapon-stat-data alt">{{ dmgAvg }}</td>
						<td class="weapon-stat-label">To Hit</td>
						<td
							class="weapon-stat-data"
							:style="
								hitRangeMod > 0 && props.rangeType !== 'Melee'
									? 'color: var(--color-debuff)'
									: ''
							"
						>
							{{ toHitCalc }} v. {{ hitType }}
						</td>
						<td class="weapon-stat-label">Range</td>
						<td class="weapon-stat-data">{{ rangeType }} {{ range }}ft. </td>
					</tr>
					<tr>
						<td class="weapon-stat-label">Min Dmg</td>
						<td class="weapon-stat-data">{{ dmgMin }}</td>
						<td class="weapon-stat-label">Crit</td>
						<td class="weapon-stat-data">{{ getCritDisplay() }}</td>
						<td class="weapon-stat-label">Shape</td>
						<td
							v-if="size"
							class="weapon-stat-data"
						>
							{{ size }}ft. {{ shape }}
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
						<td class="weapon-stat-data">{{ dmgMax }}</td>
						<td class="weapon-stat-label">Ammo</td>
						<td class="weapon-stat-data">{{ ammo }}</td>
						<td class="weapon-stat-label">Duration</td>
						<td
							v-if="duration"
							class="weapon-stat-data"
						>
							{{ duration }} rounds
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
						<td class="weapon-stat-data">{{ attackType }}</td>
						<td class="weapon-stat-label">Magazine</td>
						<td class="weapon-stat-data">{{ ammoCapacity }} {{ ammoType }}</td>
						<td class="weapon-stat-label">Handed</td>
						<td class="weapon-stat-data">{{ handed }}-handed</td>
					</tr>
				</tbody>
			</table>
			<div class="weapon-perks">
				<pre>{{ perks?.split(', ') }}</pre>
			</div>
			<div
				class="flavortext"
				v-if="flavortext"
			>
				{{ flavortext }}
			</div>
			<div class="weapon-footer">
				<span
					v-if="equipped && !activatable"
					class="is-equipped"
					>CURRENTLY EQUIPPED</span
				>
				<span
					v-else-if="active"
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
.weapon-stat-data.alt {
	width: 7%;
}
.weapon-perks {
	flex: 2;
	/* max-height: 6em;
	overflow-y: scroll; */
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
