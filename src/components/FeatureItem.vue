<script setup lang="ts">
import useCharacterData, {
	type CharacterNames,
	type Feature,
} from '@/composables/useCharacterData';
import DBox from '@/components/DBox.vue';
import BuffItemRow from './BuffItemRow.vue';
import { computed } from 'vue';
import type { BuffInfo } from '@/business_logic/buffs';

type CharacterProps = {
	characterId: CharacterNames;
};
const props = defineProps<Feature & CharacterProps>();
const { buffs, namesOfActivatedBuffs } = useCharacterData(props.characterId);

const missingRequirements = computed<string[]>(() => {
	return props.dependencies.filter((name) => !namesOfActivatedBuffs.value.includes(name));
});
const disabled = computed<boolean>(() => {
	return (
		namesOfActivatedBuffs.value.filter((name) => props.dependencies.includes(name)).length !==
		props.dependencies.length
	);
});
const effectsProcessed = props.effects.replace(/ /g, ' ').replace(/, /g, ', ');
// The buffs that this feature is associated with, if any.
const buffsFiltered = computed<BuffInfo[]>(() => {
	return buffs.value.filter((buff) => props.buffList.includes(buff.name));
});
</script>
<template>
	<DBox
		v-bind="{
			rarity: 'Legendary',
			title: name,
			subtitle: subtitle,
		}"
		style="width: 60em; max-width: none"
		:class="{ disabled }"
	>
		<template
			#header-right
			v-if="disabled"
		>
			<span style="color: var(--color-debuff)">
				Missing requirement{{ missingRequirements.length === 1 ? '' : 's' }}:
				{{ missingRequirements.join(', ') }}</span
			>
		</template>
		<template #contents>
			<div
				v-if="effects"
				class="feature-effects"
			>
				{{ effectsProcessed }}
			</div>
			<div v-if="description">{{ description }}</div>
			<div v-if="buffList.length > 0">
				<BuffItemRow
					v-for="buff in buffsFiltered"
					:key="buff.name"
					v-bind="buff"
					:character-id="characterId"
					:condensed="true"
				/>
			</div>
			<div
				v-for="group in Object.keys(groups)"
				:key="group"
			>
				<div class="feature-group-label">{{ group }}:</div>
				<div
					v-for="mod in groups[group]"
					:key="mod.name"
					class="feature-mod"
				>
					<details v-if="mod.description">
						<summary>{{ mod.name }}</summary>
						<span style="padding-left: 2em">{{ mod.description }}</span>
					</details>
					<li v-else>{{ mod.name }}</li>
				</div>
			</div>
		</template>
	</DBox>
</template>
<style>
.feature-effects {
	font-style: italic;
	padding: 0 1em;
	text-transform: capitalize;
}
.feature-group-label {
	text-transform: uppercase;
	padding-bottom: 0.5em;
}
.feature-mod li {
	margin-left: 0.9em;
}
</style>
