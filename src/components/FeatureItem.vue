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
		:id="name"
		v-bind="{
			rarity: 'Legendary',
			title: name,
			subtitle: subtitle,
		}"
		style="width: 60em; max-width: none"
		class="feature"
		:class="{ disabled }"
	>
		<template
			#header-right
			v-if="disabled"
		>
			<span style="color: var(--color-debuff)">
				Missing requirement{{ missingRequirements.length === 1 ? '' : 's' }}:
				{{ missingRequirements.join(', ') }}
			</span>
		</template>
		<template #contents>
			<div
				v-if="effects"
				class="feature-effects"
			>
				{{ effectsProcessed }}
			</div>
			<div
				v-if="description"
				class="feature-description"
			>
				{{ description }}
			</div>
			<div v-if="buffList.length > 0">
				<BuffItemRow
					v-for="buff in buffsFiltered"
					:key="buff.name"
					v-bind="buff"
					:character-id="characterId"
					:condensed="true"
				/>
			</div>
			<div class="feature-group-list">
				<div
					v-for="group in Object.keys(groups)"
					:key="group"
					class="feature-group"
				>
					<div class="feature-group-label">{{ group }}:</div>
					<div
						v-for="mod in groups[group]"
						:key="mod.name"
						class="feature-mod"
						:class="mod.isDrawback ? 'drawback' : ''"
					>
						<details
							v-if="mod.description"
							class="feature-mod-item"
						>
							<summary>{{ mod.name }}</summary>
							<div class="feature-mod-description">{{ mod.description }}</div>
						</details>
						<li
							v-else
							class="feature-mod-item"
						>
							{{ mod.name }}
						</li>
					</div>
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
.feature-description {
	white-space: pre-line;
}
.feature-group-list {
	display: flex;
	flex-direction: row;
	flex-wrap: wrap;
}
.feature-group-list :nth-child(4n) {
	border-right: none;
}
.feature-group {
	width: 23.5%;
	border-right: var(--line);
	margin: 4px;
}
.feature-group-label {
	text-transform: uppercase;
	padding: 0.5em 0;
}
.feature-mod.drawback {
	color: #fea;
}
.disabled .feature-mod.drawback {
	color: #874;
}
.feature-mod-item {
	margin: 4px;
}
.feature-mod li {
	margin-left: 1.1em;
}
.feature-mod-description {
	padding-left: 1em;
	padding-top: 2px;
	margin-right: 6px;
	font-size: 0.9em;
	opacity: 0.9;
	border-top: var(--line);
}
</style>
