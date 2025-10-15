<script setup lang="ts">
import { ref } from 'vue';

const weapons = ['Forerunner', 'Half-Truths', 'Hard Light', '1000 Voices'];
const currentWeapon = ref<string>('Half-Truths');
const activeWeapons = ref<string[]>(['Half-Truths']);
const activeWeaponsAlt = ref<string>('1000 Voices');
</script>
<template>
	<div class="temp-active-weapon">
		<h1>Current Weapon: {{ currentWeapon }}</h1>
		<ul>
			<li
				v-for="weapon in weapons"
				:key="weapon"
			>
				<label
					><input
						type="radio"
						v-model="currentWeapon"
						name="current-weapon"
						:value="weapon"
					/><span>{{ weapon }}</span></label
				>
			</li>
		</ul>
		<h1>Active Weapons: {{ activeWeapons }}</h1>
		<ul>
			<li
				v-for="weapon in weapons"
				:key="weapon"
			>
				<label
					><input
						type="checkbox"
						v-model="activeWeapons"
						name="active-weapon"
						:value="weapon"
					/><span>{{ weapon }}</span></label
				>
			</li>
		</ul>
		<h1>Active Weapons Alt: {{ activeWeaponsAlt }}</h1>
		<select
			name="active-weapon-alt"
			v-model="activeWeaponsAlt"
		>
			<option
				v-for="weapon in weapons"
				:key="weapon"
				:value="weapon"
			>
				{{ weapon }}
			</option>
		</select>
	</div>
</template>
