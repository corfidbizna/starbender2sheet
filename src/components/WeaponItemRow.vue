<script setup lang="ts">
import { type Weapon } from '@/composables/useCharacterData';
import DGlyph from './DGlyph.vue';

const props = defineProps<Weapon>();
const getCritDisplay = (): string => {
	if (!props.CritRange) {
		return '--';
	}
	const delimiter = ', x ';
	if (props.CritRange === 20) {
		return props.CritRange + delimiter + props.CritMult;
	}
	return props.CritRange + '-20' + delimiter + props.CritMult;
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
			<div class="gun-icon"><DGlyph v-bind="{ name: WeaponClass }" /></div>
			<div class="gun-titles">
				<h1>{{ Name }}</h1>
				<h2>
					<DGlyph
						v-if="Element != 'Kinetic'"
						v-bind="{ name: Element }"
						class="element-glyph"
						:style="'color: ' + colorsElement(Element)"
					/>
					{{ Element.toUpperCase() }}
					{{ WeaponClass.toUpperCase() }}
				</h2>
			</div>
			<div class="flavortext">{{ Flavortext }}</div>
		</div>
		<div class="weapon-content">
			<div class="weapon-cells">
				<div class="weapon-stat-label">
					<div>To Hit:</div>
					<div>Crit:</div>
					<div>Damage:</div>
					<div>Ammo:</div>
					<div></div>
				</div>
				<div class="weapon-stat-data">
					<div>{{ AttackType }} - {{ HitBonus }} v. {{ HitType }}</div>
					<div>{{ getCritDisplay() }}</div>
					<div>{{ Damage }} {{ Element }}</div>
					<div>{{ Ammo }}</div>
					<div>36/50 {{ AmmoType }}</div>
				</div>
			</div>
			<div class="weapon-cells">
				<div class="weapon-stat-label">
					<div>Range:</div>
					<div>Shape:</div>
					<div>Duration:</div>
					<div>Handed:</div>
				</div>
				<div class="weapon-stat-data">
					<div>{{ RangeType }} {{ Range }}ft. </div>
					<div>{{ Shape }} </div>
					<div>{{ Duration }} rounds</div>
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
	font-size: 0.8em;
	margin: 0.5em 0;
	/* background-color: #555; */
	background-blend-mode: multiply;
	/* border: 2px solid #fffa; */
}
.gun-icon {
	font-size: 2em;
	display: inline-block;
	padding-right: 0.25em;
	margin-right: 0.25em;
	text-shadow: none;
	border-right: 2px solid #fffd;
}
.gun-titles {
	display: inline-block;
}
.element-glyph {
	display: inline-block;
	font-size: 0.9em;
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
}
.weapon-header {
	padding: 0.2em;
}
.flavortext {
	font-style: italic;
	font-weight: 100;
	font-size: 0.85em;
	margin: 0.5em 0;
}
.weapon-content {
	display: flex;
}
.weapon-cells {
	display: flex;
	font-size: 0.9em;
	padding: 0.5em;
	flex: 1;
	/* margin: 2px; */
	background-color: #0008;
	/* background-blend-mode: multiply; */
}
.weapon-stat-label {
	flex: 1;
	font-weight: 800;
}
.weapon-stat-data {
	flex: 2;
}
.weapon-perks {
	flex: 2;
	max-height: 6em;
	overflow-y: scroll;
}
</style>
