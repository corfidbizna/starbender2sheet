<script setup lang="ts">
import { type Weapon } from '@/composables/useCharacterData';

const props = defineProps<Weapon>();
const getCritDisplay = (): string => {
	if (!props.CritRange) {
		return '';
	}
	const delimiter = ', x ';
	if (props.CritRange === 20) {
		return props.CritRange + delimiter + props.CritMult;
	}
	return props.CritRange + '-20' + delimiter + props.CritMult;
};
</script>
<template>
	<h1>{{ Name }}</h1>
	<h2>{{ Rarity }} {{ Element }} {{ WeaponClass }}</h2>
	<h2 class="flavortext">{{ Flavortext }}</h2>
	<table>
		<tr>
			<td>To Hit:</td>
			<td>Crit:</td>
			<td>Damage:</td>
			<td>Range:</td>
			<td>Shape:</td>
			<td>Duration:</td>
			<td>Handedness:</td>
			<td>Ammo:</td>
		</tr>
		<tr>
			<td>
				{{ AttackType }} - {{ HitBonus }} v.
				{{ HitType }}
			</td>
			<td>{{ getCritDisplay() }}</td>
			<td>{{ Damage }} {{ AttackType }}</td>
			<td>{{ RangeType }} {{ Range }}ft.</td>
			<td>{{ Shape }}</td>
			<td>{{ Duration }} rounds</td>
			<td>{{ Handed }}-handed</td>
			<td>
				<p>{{ Ammo }} {{ AmmoType }}</p>
				<p>36/50 {{ AmmoType }}</p>
			</td>
		</tr>
	</table>
</template>
<style scoped>
h1 {
	font-size: 2em;
	padding: 0;
	margin-bottom: 0.25em;
}
h2 {
	margin-top: 0.25em;
	font-size: 1em;
}
.flavortext {
	font-style: italic;
	font-weight: 100;
	font-size: 0.85em;
}
table {
	padding: 1em;
	background-color: #555;
	border-radius: 0.5em;
}
</style>
