<script setup lang="ts">
import { type Weapon } from '@/composables/useCharacterData';
import DGlyph from './DGlyph.vue';

const props = defineProps<Weapon>();
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
const getDamageDisplay = (): string => {
	return props.Damage + ' ' + props.DamageType;
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
						{{ Name }}
					</h1>
					<h2>
						{{ Element.toUpperCase() }}
						{{ WeaponClass.toUpperCase() }}
					</h2>
				</div>
				<div
					v-if="Flavortext"
					class="flavortext"
				>
					{{ Flavortext }}
				</div>
			</div>
			<div class="action-buttons">
				<button>Hit</button>
				<button>Dmg</button>
			</div>
		</div>
		<div class="weapon-content">
			<div class="weapon-cells">
				<div class="weapon-stat-label">
					<div>To Hit</div>
					<div>Crit</div>
					<div>Damage</div>
					<div>Ammo</div>
					<div></div>
				</div>
				<div class="weapon-stat-data">
					<div>{{ AttackType }} - {{ HitBonus }} v. {{ HitType }}</div>
					<div>{{ getCritDisplay() }}</div>
					<div>{{ getDamageDisplay() }}</div>
					<div>{{ Ammo }}</div>
					<div>36/50 {{ AmmoType }}</div>
				</div>
			</div>
			<div class="weapon-cells">
				<div class="weapon-stat-label">
					<div>Range</div>
					<div>Shape</div>
					<div>Duration</div>
					<div>Handed</div>
				</div>
				<div class="weapon-stat-data">
					<div>{{ RangeType }} {{ Range }}ft. </div>
					<div v-if="Size">{{ Size }}ft. {{ Shape }} </div>
					<div v-else>-- </div>
					<div v-if="Duration">{{ Duration }} rounds</div>
					<div v-else>--</div>
					<div>{{ Handed }}-handed</div>
				</div>
			</div>
			<div class="weapon-perks">
				<pre>{{ Perks?.split('), ').map((item) => item + ')') }}</pre>
			</div>
		</div>
	</div>
</template>
<style scoped>
.weapon-row {
	font-size: 0.9em;
	margin: 0.5em 0;
	max-width: 60em;
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
.gun-titles {
	display: inline-block;
}
.element-glyph {
	display: inline-block;
	font-size: 0.9em;
	vertical-align: top;
}
h1 {
	font-size: 1.3em;
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
}
.flavortext {
	font-style: italic;
	font-weight: 100;
	font-size: 0.85em;
	margin: 0.5em 0;
}
.weapon-titles {
	display: inline-block;
}
.action-buttons {
	float: right;
}
.weapon-content {
	display: flex;
}
.weapon-cells {
	display: flex;
	font-size: 0.9em;
	padding: 0.5em;
	flex: 1.1;
	/* margin: 2px; */
	background-color: #0008;
	/* background-blend-mode: multiply; */
}
.weapon-stat-label {
	flex: 1;
	font-weight: 800;
	text-align: right;
	padding-right: 0.25em;
	border-right: 1px solid #fffd;
	margin-right: 0.25em;
}
.weapon-stat-data {
	flex: 2;
}
.weapon-perks {
	flex: 2;
	max-height: 6em;
	overflow-y: scroll;
}
.kinetic-icon {
	width: 14px;
	height: 14px;
	filter: invert(100%);
	vertical-align: top;
}
</style>
