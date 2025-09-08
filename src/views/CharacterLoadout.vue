<script setup lang="ts">
import useCharacterData, { type CharacterNames } from '@/composables/useCharacterData';
// import WeaponItemRow from './WeaponItemRow.vue';
type CharacterProps = {
	characterId: CharacterNames;
};
const props = defineProps<CharacterProps>();
const { character } = useCharacterData(props.characterId);
</script>

<template>
	<div
		class="CharacterEquipment"
		v-if="character"
	>
		<div class="stacked-nav">
			<RouterLink :to="{ name: 'characterWeapons', params: { characterId } }"
				><img src="/src/assets/icons/slot_weapon.png"
			/></RouterLink>
			<RouterLink :to="{ name: 'characterArmor', params: { characterId } }"
				><img src="/src/assets/icons/slot_overview.png"
			/></RouterLink>
			<RouterLink :to="{ name: 'characterClass', params: { characterId } }"
				><img src="/src/assets/icons/slot_tricorn.png"
			/></RouterLink>
		</div>
		<div class="loadout-contents">
			<RouterView />
		</div>
	</div>
</template>
<style>
.CharacterEquipment {
	display: flex;
}
.stacked-nav {
	top: 10px;
	position: fixed;
	vertical-align: top;
	min-height: 100vh;
	border-right: 2px solid #fff8;
	margin-right: 1em;
}
.stacked-nav a {
	display: block;
	margin: 0.5em;
	padding: 0.25em;
	border: 1px solid #fff8;
}
.stacked-nav .router-link-exact-active {
	background-color: #fff4;
}
.loadout-contents {
	flex: 1;
	padding-left: 100px;
}
</style>
