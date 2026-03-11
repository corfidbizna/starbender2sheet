<script setup lang="ts">
import ArmorItem from '@/components/ArmorItem.vue';
import LoadingModal from '@/components/LoadingModal.vue';
import StatCapacityBox from '@/components/StatCapacityBox.vue';
import type { Armor, CharacterNames } from '@/composables/useCharacterData';
import useCharacterData from '@/composables/useCharacterData';
import { computed } from 'vue';

const props = defineProps<{
	characterId: CharacterNames;
}>();
const {
	statsLoading,
	actionResources,
	statsBuffed,
	buffsLoading,
	armor: armorList,
	namesOfEquippedArmor,
	armorLoading,
	armorRefresh,
	getFinalStat,
} = useCharacterData(props.characterId);
const armorSlotSortOrder: Record<string, number> = {
	full: 0,
	head: 1,
	arm: 2,
	chest: 3,
	leg: 4,
	class: 5,
	exotic: 6,
	other: 7,
};
const sortedArmorList = computed<Armor[]>(() => {
	return [...armorList.value].sort(
		(a, b) =>
			armorSlotSortOrder[(a.slots || 'full').split(' ')[0]] -
			armorSlotSortOrder[(b.slots || 'full').split(' ')[0]],
	);
});
const findArmorSlots = computed<Record<string, string>>(() => {
	const result: Record<string, string> = {
		full: '',
		head: '',
		arm: '',
		chest: '',
		leg: '',
		class: '',
		exotic: '',
		other: '',
	};
	const slots = Object.keys(result);
	const filteredArmorList = computed<Armor[]>(() =>
		armorList.value.filter((armor) => {
			return namesOfEquippedArmor.value.includes(armor.name + ' (Equipped)');
		}),
	);
	filteredArmorList.value.forEach((armor) => {
		let added = false;
		slots.forEach((slot) => {
			if (armor.slots) {
				const individualSlots = armor.slots.split(', ');
				individualSlots.forEach((individual) => {
					if (individual.toLocaleLowerCase().search(slot) === 0) {
						result[slot] += armor.name + '\n';
						added = true;
					}
				});
			}
		});
		if (!added) {
			result.other += armor.name + '\n';
		}
	});
	return result;
});
</script>
<template>
	<div v-if="armorLoading || buffsLoading || statsLoading">
		<LoadingModal />
	</div>
	<div
		v-else
		class="armor-tab-container"
	>
		<div class="armor-infos">
			<button @click="armorRefresh">Reload Armor</button>
			<StatCapacityBox
				v-bind="{
					label: 'Armor Charges',
					data: [
						{
							label: 'Charges',
							stat: 'armorCharges',
							color: '#8df',
							max: getFinalStat('capacityArmorCharge'),
							current: actionResources.armorCharges,
						},
					],
					hideRefillAll: true,
				}"
				:characterId="characterId"
			/>
			<h2>Slots</h2>
			<div class="armor-slots-active">
				<div
					class="armor-slot full"
					:class="
						getFinalStat('equipArmorFull') > getFinalStat('slotsArmorFull')
							? 'overfull'
							: ''
					"
				>
					<h2>
						Full: {{ statsBuffed.equipArmorFull.total }} ⁄
						{{ getFinalStat('slotsArmorFull') }}
					</h2>
					<span>{{ findArmorSlots.full || '--' }}</span>
				</div>
				<div
					class="armor-slot helmet"
					:class="
						getFinalStat('equipArmorHead') > getFinalStat('slotsArmorHead')
							? 'overfull'
							: ''
					"
				>
					<h2>
						Helmet: {{ statsBuffed.equipArmorHead.total }} ⁄
						{{ getFinalStat('slotsArmorHead') }}
					</h2>
					<span>{{ findArmorSlots.head || '--' }}</span>
				</div>
				<div
					class="armor-slot arm"
					:class="
						getFinalStat('equipArmorArm') > getFinalStat('slotsArmorArm')
							? 'overfull'
							: ''
					"
				>
					<h2>
						Arm: {{ statsBuffed.equipArmorArm.total }} ⁄
						{{ getFinalStat('slotsArmorArm') }}
					</h2>
					<span>{{ findArmorSlots.arm || '--' }}</span>
				</div>
				<div
					class="armor-slot torso"
					:class="
						getFinalStat('equipArmorChest') > getFinalStat('slotsArmorChest')
							? 'overfull'
							: ''
					"
				>
					<h2>
						Torso: {{ statsBuffed.equipArmorChest.total }} ⁄
						{{ getFinalStat('slotsArmorChest') }}
					</h2>
					<span>{{ findArmorSlots.chest || '--' }}</span>
				</div>
				<div
					class="armor-slot legs"
					:class="
						getFinalStat('equipArmorLegs') > getFinalStat('slotsArmorLegs')
							? 'overfull'
							: ''
					"
				>
					<h2>
						Legs: {{ statsBuffed.equipArmorLegs.total }} ⁄
						{{ getFinalStat('slotsArmorLegs') }}
					</h2>
					<span>{{ findArmorSlots.leg || '--' }}</span>
				</div>
				<div
					class="armor-slot class"
					:class="
						getFinalStat('equipArmorClass') > getFinalStat('slotsArmorClass')
							? 'overfull'
							: ''
					"
				>
					<h2>
						Class: {{ statsBuffed.equipArmorClass.total }} ⁄
						{{ getFinalStat('slotsArmorClass') }}
					</h2>
					<span>{{ findArmorSlots.class || '--' }}</span>
				</div>
				<div
					class="armor-slot exotic"
					:class="
						getFinalStat('equipArmorExotic') > getFinalStat('slotsArmorExotic')
							? 'overfull'
							: ''
					"
				>
					<h2>
						Exotic: {{ statsBuffed.equipArmorExotic.total }} ⁄
						{{ getFinalStat('slotsArmorExotic') }}
					</h2>
					<span>{{ findArmorSlots.exotic || '--' }}</span>
				</div>
				<div
					v-if="findArmorSlots.other"
					class="armor-slot other"
				>
					<h2>Other:</h2>
					<span>{{ findArmorSlots.other || '--' }}</span>
				</div>
			</div>
		</div>
		<div class="armor-list">
			<ArmorItem
				v-for="armor in sortedArmorList"
				:key="armor.name"
				v-bind="armor"
				:activatable="true"
				:characterId="characterId"
			/>
		</div>
		<!-- <pre>{{ armor }}</pre> -->
	</div>
</template>
<style>
.armor-tab-container {
	display: flex;
}
.armor-infos {
	display: flex;
	flex-direction: column;
	width: 18em;
	margin-right: 20px;
	padding: 10px;
	position: fixed;
	height: calc(100vh - 85px);
}
.armor-list {
	margin-left: 20em;
	display: inline;
	width: auto;
	flex: 1;
}
.armor-slots-active {
	display: flex;
	flex-direction: column;
	width: 100%;
}
.armor-slots-active h2 {
	width: 14em;
}
.armor-slot {
	flex: 1 1 auto;
	margin: 0.25em;
	border: 2px solid #fff8;
	padding: 0.25em;
	background-repeat: no-repeat;
	background-position: right;
	background-size: 6em;
	background-color: #0002;
	background-position-y: 0.4em;
}
.armor-slot.overfull h2 {
	color: #d64;
	font-weight: bold;
}
.armor-slot h2 {
	margin-top: 0;
}
.armor-slot span {
	white-space: pre-line;
}
.armor-slot.full {
	background-image: url('/public/icons/Slot_Overview.svg');
}
.armor-slot.helmet {
	background-image: url('/public/icons/Slot_Helmet.svg');
}
.armor-slot.arm {
	background-image: url('/public/icons/Slot_Arms.svg');
}
.armor-slot.torso {
	background-image: url('/public/icons/Slot_Chest.svg');
}
.armor-slot.legs {
	background-image: url('/public/icons/Slot_Leg.svg');
}
.armor-slot.class {
	background-image: url('/public/icons/Slot_Class.svg');
}
</style>
