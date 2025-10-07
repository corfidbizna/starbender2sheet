<script setup lang="ts">
import { updateLog } from '@/sharedState.ts';
import useCharacterData, { type Weapon } from '@/composables/useCharacterData';
import DGlyph from './DGlyph.vue';
import CapacityBar from './CapacityBar.vue';
import { DiceFormula } from '@/business_logic/diceFormula';
import svgAmmoPrimary from '@/assets/svgs/ammo_primary.svg?url';
import svgAmmoSpecial from '@/assets/svgs/ammo_special.svg?url';
import svgAmmoHeavy from '@/assets/svgs/ammo_heavy.svg?url';
import iconKinetic from '@/assets/svgs/Kenetic.svg?url';
import { computed, ref } from 'vue';

const props = defineProps<Weapon & { characterId: string }>();
const { weaponAmmoUpdate, buffsTallied, stats } = useCharacterData(props.characterId);
const getCritDisplay = (): string => {
	if (!props.CritRange) {
		return '--';
	}
	const delimiter = ', x';
	if (props.CritRange === 20) {
		return props.CritRange + delimiter + props.CritMult;
	}
	return 21 - props.CritRange + '-20' + delimiter + props.CritMult;
};
const getAmmoTypeDisplay = (): string => {
	return props.AmmoType.split(' ')[0];
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
	const ammo = props.AmmoType.toLocaleLowerCase();
	if (ammo.includes('energy') || ammo.includes('special')) {
		return svgAmmoSpecial;
	}
	if (ammo.includes('heavy')) {
		return svgAmmoHeavy;
	}
	return svgAmmoPrimary;
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
const toHitCalc = computed<number>(() => {
	let result = props.HitBonus || 0;
	if (props.RangeType === 'Melee') {
		result += buffsTallied.value.toHitMelee?.total || stats.value.toHitMelee;
	} else if (props.RangeType === 'Ranged') {
		result += buffsTallied.value.toHitRanged?.total || stats.value.toHitRanged;
	} else if (props.RangeType === 'Spell') {
		result += buffsTallied.value.toHitSpell?.total || stats.value.toHitSpell;
	}
	return result;
});
// const damageBonus = computed<number>(() => {
// 	let result = 0;
// 	if (props.RangeType === 'Melee') {
// 		result += buffsTallied.value.damageMelee?.total || stats.value.damageMelee;
// 	} else if (props.RangeType === 'Ranged') {
// 		result += buffsTallied.value.damageRanged?.total || stats.value.damageRanged;
// 	} else if (props.RangeType === 'Spell') {
// 		result += buffsTallied.value.damageSpell?.total || stats.value.damageSpell;
// 	}
// 	return (
// 		result + (buffsTallied.value?.damagePrecision?.total || stats.value.damagePrecision || 0)
// 	);
// });
const hitFormula = new DiceFormula('1d20');
const rollDamage = () => {
	console.log(props.DamageFormula);
	const result = props.DamageFormula.roll(() => 0);
	let string = props.Name + '\n  Damage: ' + result;
	if (props.CritMult && props.CritMult > 1) {
		string += '\n  Crit damage: ' + result * props.CritMult;
	}
	updateLog(string);
};
const rollHit = () => {
	const result = hitFormula.roll(() => 0);
	let string = props.Name + '\n  Hit result: ' + (result + toHitCalc.value);
	if (result <= 1) {
		string += '\n == Natural 1! ==';
	}
	if (result > 20 - (props.CritRange || 0)) {
		string += '\n == Critical hit! ==';
	}
	updateLog(string);
	fire();
};
const currentAmmo = ref<number>(props.AmmoCurrent);
const fire = () => {
	currentAmmo.value = weaponAmmoUpdate(props.Name, -props.Ammo);
};
const reload = () => {
	updateLog('Reloaded ' + props.Name);
	const difference = props.AmmoCapacity - props.AmmoCurrent;
	currentAmmo.value = weaponAmmoUpdate(props.Name, difference);
};
</script>
<template>
	<div class="weapon-row">
		<div
			class="weapon-header"
			:style="'background-color: ' + colorsRarity(Rarity)"
		>
			<div class="weapon-titles">
				<div class="gun-icon"><DGlyph v-bind="{ name: WeaponClass }" /></div>
				<div class="gun-titles">
					<h1>
						<DGlyph
							v-if="Element != 'Kinetic'"
							v-bind="{ name: Element }"
							class="element-glyph"
							:style="'color: ' + colorsElement(Element)"
						/>
						<img
							v-else
							class="kinetic-icon"
							src="/src/assets/svgs/Kenetic.svg"
						/>
						<span>{{ Name }}</span>
					</h1>
					<h2>
						{{ WeaponClass.toUpperCase() }}
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
						v-if="Element != 'Kinetic'"
						v-bind="{ name: Element }"
						class="element-glyph"
						:style="'color: ' + colorsElement(Element)"
					/>
					<img
						v-else
						class="kinetic-icon"
						:src="iconKinetic"
					/>
					<span
						:style="'color: ' + colorsElement(Element)"
						:title="Damage"
						>{{ DmgShort }}</span
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
							max: AmmoCapacity,
							current: currentAmmo,
							color: colorsAmmo(AmmoType),
						}"
						class="ammo-bar"
					/>
					<span>{{ currentAmmo }} ⁄ {{ props.AmmoCapacity }}</span>
					<button @click="reload()">↺</button>
				</div>
			</div>
			<table class="weapon-details">
				<tbody class="weapon-cells">
					<tr>
						<td class="weapon-stat-label">Average Dmg</td>
						<td class="weapon-stat-data alt">{{ DmgAvg }}</td>
						<td class="weapon-stat-label">To Hit</td>
						<td class="weapon-stat-data">{{ toHitCalc }} v. {{ HitType }}</td>
						<td class="weapon-stat-label">Range</td>
						<td class="weapon-stat-data">{{ RangeType }} {{ Range }}ft. </td>
					</tr>
					<tr>
						<td class="weapon-stat-label">Min Dmg</td>
						<td class="weapon-stat-data">{{ DmgMin }}</td>
						<td class="weapon-stat-label">Crit</td>
						<td class="weapon-stat-data">{{ getCritDisplay() }}</td>
						<td class="weapon-stat-label">Shape</td>
						<td
							v-if="Size"
							class="weapon-stat-data"
						>
							{{ Size }}ft. {{ Shape }} 
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
						<td class="weapon-stat-data">{{ DmgMax }}</td>
						<td class="weapon-stat-label">Ammo</td>
						<td class="weapon-stat-data">{{ Ammo }}</td>
						<td class="weapon-stat-label">Duration</td>
						<td
							v-if="Duration"
							class="weapon-stat-data"
						>
							{{ Duration }} rounds
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
						<td class="weapon-stat-data">{{ AttackType }}</td>
						<td class="weapon-stat-label">Magazine</td>
						<td class="weapon-stat-data">{{ AmmoCapacity }} {{ AmmoType }}</td>
						<td class="weapon-stat-label">Handed</td>
						<td class="weapon-stat-data">{{ Handed }}-handed</td>
					</tr>
				</tbody>
			</table>
			<div class="weapon-perks">
				<pre>{{ Perks?.split('), ').map((item) => item + ')') }}</pre>
			</div>
			<div
				class="flavortext"
				v-if="Flavortext"
			>
				{{ Flavortext }}
			</div>
			<div class="weapon-footer"></div>
		</div>
	</div>
</template>
<style scoped>
.weapon-row {
	font-size: 0.9em;
	margin: 0.5em auto;
	max-width: 40em;
	background-blend-mode: multiply;
	/* background-color: #555; */
	/* border: 2px solid #fffa; */
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
.weapon-titles {
	display: flex;
	flex-grow: 1;
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
	height: 0.5em;
	background: #000a;
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
