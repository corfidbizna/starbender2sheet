<script setup lang="ts">
import WeaponTable from '@/components/WeaponTable.vue';
import { type CharacterNames } from '@/composables/useCharacterData';
import { inject } from 'vue';

const characterId: CharacterNames = inject('character') || 'kara';
</script>
<template>
	<WeaponTable :character-id="characterId"></WeaponTable>
</template>
