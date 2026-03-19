<script setup lang="ts">
import type { BuffInfo } from '@/business_logic/buffs';
import useCharacterData, { labelMap } from '@/composables/useCharacterData';
import { computed, ref } from 'vue';

const props = defineProps<{ characterId: string }>();
const { customBuffs, activatablePartyBuffs } = useCharacterData(props.characterId);

const currentState = ref<BuffInfo>({
	name: 'New Buff ' + (Object.keys(customBuffs.value).length + 1),
	type: 'Buff',
	icon: 'General_Ghost', //
	category: 'Misc', //
	isStory: false,
	isBasic: false,
	isStacking: false, //
	stackMax: 0,
	stacks: 0,
	// duration: 0, //
	// roundsRemaining: 0, //
	description: '', //
	effects: '', //
	isPassive: false, //
	active: false,
	isCustom: true,
	isMagic: false,
});
const effectsList = ref<string[]>([]);
const effectsForDisplay = computed<string>(() =>
	effectsList.value.map((item) => item.replace(/ /g, ' ')).join(', '),
);
const currentEffectKey = ref<string>();
const currentEffectValue = ref<number>(0);
const currentEffectShouldStack = ref<boolean>(false);
const addEffect = () => {
	effectsList.value.push(
		(currentEffectKey.value + ' +' + currentEffectValue.value).replace('+-', '-') +
			(currentEffectShouldStack.value ? '*stacks' : ''),
	);
};
const clearEffects = () => {
	effectsList.value.length = 0;
};
const sendBuff = () => {
	currentState.value.effects = effectsList.value.join(', ');
	customBuffs.value[currentState.value.name] = JSON.parse(JSON.stringify(currentState.value));
};
const buffValidator = computed(() => {
	const reasons = <string[]>[];
	if (!currentState.value.name) {
		reasons.push('Buff must have a name');
	}
	if (
		activatablePartyBuffs.value
			.map((info) => info.name)
			.filter((name) => name === currentState.value.name).length > 0
	) {
		reasons.push('Buff name is already in use');
	}
	if (currentState.value.name.replace(/[^\+\-,]/g, '').length > 0) {
		reasons.push("Name cannot include '+' '-' or ','");
	}
	return { isValid: reasons.length < 1, reasons };
});
const iconList: string[] = [
	'Element_Arc',
	'Element_Kinetic',
	'Element_Solar',
	'Element_Void',
	'Faction_GuardianHunter',
	'Faction_GuardianTitan',
	'Faction_GuardianVanguard',
	'Faction_GuardianWarlock',
	'General_Armor',
	'General_Arrow',
	'General_DarknessZone',
	'General_Ghost',
	'General_GhostNo',
	'General_Raid',
	'General_Reticle',
];
const imageSrc = computed<string>(() => {
	return './buff_icons/' + currentState.value.icon + '_' + currentState.value.type + '.svg';
});
const buffTypeList = ['Buff', 'Debuff', 'Neutral', 'Warning'];

const statLabelList = Object.values(labelMap);
const statLabelGroupHeaderMap: Record<string, string> = {
	'Move Base Land': 'Movement Actions',
	AC: 'Defenses',
	'Arc DR': 'Elemental Defenses',
	'Carrying Capacity': 'Capacities',
	'Head Slot': 'Armor Slots',
	'Weapon Slots': 'Weapon Slots',
	'Aspect Slots': 'Class Slots',
	'Ranged to hit': 'Damage',
	'Str Save DC': 'Ability Related & Saves',
	'Max HP': 'Health & Shields',
	Armor: 'Armor',
	'Str Mod': 'Ability Mods & Scores',
	'Major Action': 'Actions',
	CPL: 'Level-up',
	'Base Character Weight': 'Weight',
	'Artifact Points': 'Misc Stats',
	'Str Roll': 'Strength Skills',
	'Dex Roll': 'Dexterity Skills',
	'Con Roll': 'Constitution Skills',
	'Int Roll': 'Intelligence Skills',
	'Wis Roll': 'Wisdom Skills',
	'Cha Roll': 'Charisma Skills',
};
const statLabelGroupNames = Object.values(statLabelGroupHeaderMap);
const statLabelGroups: Record<string, string[]> = statLabelGroupNames.reduce(
	(acc, key) => ({ ...acc, [key]: [] }),
	{},
);
let currentLabel = '';
for (let i = 0; i < statLabelList.length; i++) {
	if (statLabelGroupHeaderMap[statLabelList[i]]) {
		currentLabel = statLabelGroupHeaderMap[statLabelList[i]];
	}
	statLabelGroups[currentLabel].push(statLabelList[i]);
}
</script>
<template>
	<div class="custom-buff-info">
		<table style="border-collapse: collapse">
			<thead class="line-below">
				<tr>
					<td colspan="2">
						<h2 style="border: none; margin-top: inherit">Create New Buff</h2>
					</td>
					<td
						colspan="3"
						class="error-text"
					>
						<div v-if="buffValidator.reasons.length > 0">
							<div
								v-for="reason in buffValidator.reasons"
								:key="reason"
								style="color: var(--color-debuff)"
							>
								{{ reason }}
							</div>
						</div>
						<div
							v-else
							style="color: var(--color-buff)"
						></div>
					</td>
					<td>
						<button
							@click="sendBuff"
							:disabled="!buffValidator.isValid"
							style="font-weight: bold"
						>
							Confirm
						</button>
					</td>
				</tr>
			</thead>
			<tbody>
				<tr>
					<td class="custom-buff-info-label">Name</td>
					<td>
						<input
							v-model="currentState.name"
							type="text"
						/>
					</td>
					<td></td>
					<td class="custom-buff-info-label">Category</td>
					<td>
						<input
							v-model="currentState.category"
							type="text"
						/>
					</td>
					<td></td>
				</tr>
				<tr
					class="line-below"
					style="position: relative"
				>
					<td class="custom-buff-info-label">Icon</td>
					<td colspan="2">
						<select v-model="currentState.icon">
							<option
								v-for="icon in iconList"
								:key="icon"
							>
								{{ icon }}
							</option></select
						><select v-model="currentState.type">
							<option
								v-for="type in buffTypeList"
								:key="type"
							>
								{{ type }}
							</option>
						</select>
					</td>
					<td class="custom-buff-info-label">Is Magic</td>
					<td>
						<input
							type="checkbox"
							v-model="currentState.isMagic"
						/>
					</td>
					<td>
						<img
							:src="imageSrc"
							class="buff-preview-icon"
						/>
					</td>
				</tr>
				<tr class="line-below">
					<td class="custom-buff-info-label">Stacking</td>
					<td>
						<input
							v-model="currentState.isStacking"
							type="checkbox"
						/>
					</td>
					<td></td>
					<td class="custom-buff-info-label">Stacks Max</td>
					<td>
						<input
							v-model="currentState.stackMax"
							type="number"
							min="0"
						/> (0 for no limit)
					</td>
					<td></td>
				</tr>
				<tr class="line-below">
					<td class="custom-buff-info-label">Description</td>
					<td colspan="5">
						<textarea v-model="currentState.description"></textarea>
					</td>
				</tr>
				<tr>
					<td class="custom-buff-info-label">Effects</td>
					<td>
						<select
							v-model="currentEffectKey"
							style="width: 18em"
						>
							<hr />
							<optgroup
								v-for="group in statLabelGroupNames"
								:key="group"
								:label="group"
							>
								<option
									v-for="label in statLabelGroups[group]"
									:key="label"
								>
									{{ label }}
								</option>
								<hr />
							</optgroup>
							<!-- <option
								v-for="label in statLabelList"
								:key="label"
							>
								{{ label }}
							</option> -->
						</select>
					</td>
					<td>
						<input
							v-model="currentEffectValue"
							type="number"
						/>
					</td>
					<td class="custom-buff-info-label">
						<span
							v-if="currentEffectShouldStack"
							style="float: left; font-weight: normal"
							>*stacks</span
						>
						<input
							id="buff-should-stack"
							v-model="currentEffectShouldStack"
							style="margin-left: auto"
							type="checkbox"
							:disabled="!currentState.isStacking"
							:title="
								currentState.isStacking
									? ''
									: 'Effect cannot stack if stacking is disabled'
							"
						/>
					</td>
					<td
						:title="
							currentState.isStacking
								? ''
								: 'Effect cannot stack if stacking is disabled'
						"
					>
						<label
							for="buff-should-stack"
							style="padding-top: 3px"
							>influence effect by stacks</label
						>
					</td>
					<td>
						<button
							@click="addEffect"
							:disabled="!currentEffectKey"
							:title="
								!currentEffectKey
									? 'Cannot append an effect with no destination'
									: ''
							"
						>
							Append Effect
						</button>
					</td>
				</tr>
				<tr>
					<td></td>
					<td
						colspan="4"
						class="effect-list"
					>
						<div v-if="effectsList.length === 0">~~ No effects ~~</div>
						<div
							v-else
							style="max-width: 32em"
						>
							{{ effectsForDisplay }}
						</div>
					</td>
					<td><button @click="clearEffects">Clear Effects</button></td>
				</tr>
			</tbody>
		</table>
	</div>
</template>
<style>
.custom-buff-info {
	padding: 0.5em;
	width: fit-content;
	margin: 0 auto;
}
.custom-buff-info tbody {
	background-color: #0004;
}
.custom-buff-info .line-below {
	border-bottom: 2px solid #fff8;
}
.custom-buff-info .error-text {
	text-align: right;
	padding-right: 0.25em;
}
.custom-buff-info-label {
	width: 6em;
	text-align: right;
	vertical-align: top;
	padding-top: 0.25em;
	font-weight: bold;
}
.custom-buff-info .effect-list {
	font-style: italic;
}
.buff-preview-icon {
	position: absolute;
	width: 2.5em;
	top: -1.25em;
	left: 0.5em;
}
.custom-buff-info input[type='number'] {
	width: 4em;
}
.custom-buff-info textarea {
	resize: none;
	width: calc(100% - 0.5em);
}
.custom-buff-info button {
	width: 100%;
}
</style>
