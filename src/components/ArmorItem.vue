<script setup lang="ts">
import type { Armor } from '@/composables/useCharacterData';
import useCharacterData from '@/composables/useCharacterData';
import DBox from '@/components/DBox.vue';
import { computed, ref, watch } from 'vue';

const props = defineProps<Armor & { characterId: string; activatable?: boolean }>();
const { namesOfEquippedArmor, namesOfActiveArmor, armorStackUpdate } = useCharacterData(
	props.characterId,
);
const currentStacks = ref<number>(props.stacks);
watch(currentStacks, () => {
	armorStackUpdate(props.name, currentStacks.value);
});
const slotName = computed<string>(() => {
	const slot = props.slots || '';
	const slotName = slot.split(' ')[0].toLocaleLowerCase();
	const map = {
		full: 'Overview',
		helmet: 'Helmet',
		arm: 'Arms',
		chest: 'Chest',
		leg: 'Leg',
		class: 'Class',
	};
	return map[slotName as keyof typeof map] || 'overview';
});
const imageURL =
	'./icons/Slot_' + slotName.value[0].toLocaleUpperCase() + slotName.value.slice(1) + '.svg';
const buffsForDisplay = computed<Record<string, string>>(() => {
	return {
		buffs: props.buffs?.replace(/ /g, ' ').replace(/, /g, ', ') || '',
		buffsCharged: props.buffsCharged?.replace(/ /g, ' ').replace(/, /g, ', ') || '',
	};
});
</script>
<template>
	<label
		class="armor-item"
		:class="equipped ? 'equipped' : ''"
		:for="name + '-equip'"
	>
		<DBox
			v-bind="{
				rarity: props.rarity,
				title: props.name,
				subtitle: (props.slots || 'full').split(' ')[0] + ' equipment',
				flavortext: props.flavortext,
			}"
			:class="equipped && activatable ? 'active' : ''"
		>
			<template #header-icon>
				<input
					:id="name + '-equip'"
					type="checkbox"
					style="width: 0; margin: 0"
					:value="name + ' (Equipped)'"
					:disabled="!activatable"
					v-model="namesOfEquippedArmor"
				/>
				<img
					:src="imageURL"
					style="width: 3em; margin: 0 0.25em"
					:style="rarity === 'Common' ? 'filter: invert(1)' : ''"
				/>
			</template>
			<template #header-right>
				<div v-if="isStacking">
					{{ stacksName || 'Stacks' }} x
					<input
						type="number"
						min="0"
						class="stacks-input"
						:max="stacksMax || Infinity"
						:value="props.stacks"
						v-model="currentStacks"
					/>
				</div>
			</template>
			<template #contents>
				<div v-if="buffs !== undefined || buffsCharged !== undefined">
					<div
						v-if="buffs"
						class="armor-stats passive"
					>
						<span class="armor-stats-label">Stats</span>
						<span class="armor-stats-list">{{ buffsForDisplay.buffs }}</span>
					</div>
					<div
						v-if="buffsCharged"
						class="armor-stats active"
					>
						<span class="armor-stats-label">
							<label
								v-if="isActivatable"
								class="activate"
								:class="active ? 'activated' : ''"
								:for="name + '-active'"
								>Activate<input
									:id="name + '-active'"
									type="checkbox"
									:value="name + ' (Active)'"
									v-model="namesOfActiveArmor"
							/></label>
						</span>
						<span
							class="armor-stats-list"
							:class="active ? '' : 'deactivated'"
							>{{ buffsForDisplay.buffsCharged }}</span
						>
					</div>
				</div>
				<div
					v-if="description"
					class="description"
				>
					{{ description }}
				</div>
			</template>
			<template #footer-text>
				<span
					v-if="equipped && activatable"
					class="is-equipped"
					>CURRENTLY EQUIPPED</span
				>
			</template>
		</DBox>
		<!-- <div
			class="header"
			:class="rarity.toLocaleLowerCase()"
		>
			<input
				:id="name + '-equip'"
				type="checkbox"
				style="visibility: collapse"
				:value="name + ' (Equipped)'"
				v-model="namesOfEquippedArmor"
			/>
			<img
				:src="'./icons/slot_' + slotName.toLocaleLowerCase() + '.png'"
				style="width: 2em"
			/>
			<div class="armor-titles">
				<div class="name">{{ name }}</div>
				<div class="coverage">{{ coverage || '' }} Equipment</div>
			</div>
			<div v-if="isStacking">
				{{ stacksName || 'Stacks' }} x{{ stacks
				}}<input
					type="number"
					class="stacks-input"
					min="0"
					onkeydown="return false"
					:max="stacksMax || Infinity"
					:value="props.stacks"
					@input="changeStacksUpdate"
				/>
			</div>
		</div>
		<div class="armor-content">
			<div v-if="buffs !== undefined || buffsCharged !== undefined">
				<div
					v-if="buffs"
					class="armor-stats passive"
				>
					<span class="armor-stats-label">Stats</span>
					<span class="armor-stats-list">{{ buffs }}</span>
				</div>
				<div
					v-if="buffsCharged"
					class="armor-stats active"
				>
					<span class="armor-stats-label">
						<label
							v-if="isActivatable"
							class="activate"
							:class="active ? 'activated' : ''"
							:for="name + '-active'"
							>Activate<input
								:id="name + '-active'"
								type="checkbox"
								:value="name + ' (Active)'"
								v-model="namesOfActiveArmor"
						/></label>
					</span>
					<span
						class="armor-stats-list"
						:class="active ? '' : 'deactivated'"
						>{{ buffsCharged }}</span
					>
				</div>
			</div>
			<div
				v-if="description"
				class="description"
			>
				{{ description }}
			</div>
			<div
				v-if="props.flavortext"
				class="flavortext"
			>
				{{ flavortext }}
			</div>
			<div class="footer">
				<span
					v-if="equipped"
					class="is-equipped"
					>CURRENTLY EQUIPPED</span
				>
			</div>
		</div> -->
	</label>
</template>
<style>
.armor-item {
	display: block;
	margin: 0.5em 0;
	text-shadow: none;
}

.armor-stats {
	display: flex;
	align-items: center;
}
.armor-stats-label,
.armor-stats-list {
	padding: 0.25em;
}
.armor-stats-label {
	width: 5em;
	font-style: normal;
	font-weight: bold;
	text-align: right;
	margin: -0.4em;
}
.armor-stats-list {
	border-left: 2px solid #fff8;
	margin-left: 0.5em;
	padding-left: 0.5em;
	font-style: italic;
	flex: 1;
}
.stacks-input {
	max-width: 3em;
}
.armor-stats-list.deactivated {
	color: #fff5;
}
.activate {
	text-align: center;
	padding: 0.25em;
	background: #0004;
	border: 2px solid #fff8;
	width: 100%;
	display: inline-block;
	box-sizing: border-box;
}
.activate.activated {
	background: #fff4;
	border-color: #ffff;
}
.activate input {
	display: none;
}
.effects {
	font-size: 0.9em;
	font-style: italic;
}
.description {
	white-space: pre-line;
}
.armor-content .footer {
	height: 1em;
	background: #000a;
	border: none;
	padding: 0.2em;
	padding-bottom: 0;
	text-align: right;
	color: #000a;
}
</style>
