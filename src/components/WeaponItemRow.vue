<script setup lang="ts">
import { type Weapon } from '@/composables/useCharacterData';

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
</script>
<template>
	<div class="weapon-row">
		<div
			class="weapon-header"
			:style="'background-color: ' + colorsRarity(Rarity)"
		>
			<h1>{{ Name }}</h1>
			<h2>{{ Rarity }} {{ Element }} {{ WeaponClass }}</h2>
			<h2 class="flavortext">{{ Flavortext }}</h2>
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
h1 {
	font-size: 1.3em;
	font-weight: 800;
	padding: 0;
	padding-left: 1.4em;
	margin: 0.5em 0;
}
h2 {
	margin: 0.25em 0;
	font-weight: 400;
	font-size: 1em;
}
.weapon-row {
	padding: 0.25em;
	margin: 0.25em;
	background-color: #555;
	background-blend-mode: multiply;
	border-radius: 0.5em;
}
.weapon-header {
	padding: 0.2em;
	padding-left: 1em;
	border-radius: 0.25em;
}
.weapon-header * {
	text-shadow:
		1px 1px 0px #0008,
		-1px 1px 0px #0008,
		1px -1px 0px #0008,
		-1px -1px 0px #0008;
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
	margin: 2px;
	background-color: #444;
	background-blend-mode: multiply;
	border-bottom-left-radius: 0.25em;
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
