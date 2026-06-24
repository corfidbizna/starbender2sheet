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
	getStat,
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
// const armorSlots = ['Full', 'Helmet', 'Arm', 'Torso', 'Legs', 'Class', 'Other'];
const sortedArmorList = computed<Armor[]>(() => {
	return [...armorList.value].sort(
		(a, b) =>
			armorSlotSortOrder[(a.slots || 'full').split(' ')[0]] -
			armorSlotSortOrder[(b.slots || 'full').split(' ')[0]],
	);
});
const findArmorSlots = computed<Record<string, string[]>>(() => {
	const result: Record<string, string[]> = {
		full: [],
		head: [],
		arm: [],
		chest: [],
		leg: [],
		class: [],
		exotic: [],
		other: [],
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
						result[slot].push(armor.name);
						added = true;
					}
				});
			}
		});
		if (!added) {
			result.other.push(armor.name);
		}
	});
	Object.keys(result).forEach((key) => result[key].sort());
	return result;
});
const getBackgroundColor = (armorName: string) => {
	const armor = armorList.value.find((armor) => armor.name === armorName);
	return {
		Common: '#c2bdb466',
		Uncommon: '#356f4266',
		Rare: '#5076a366',
		Legendary: '#522e6566',
		Exotic: '#cdae3466',
	}[armor?.rarity || 'Common'];
};
const scrollTo = (id: string) => {
	const element = document.getElementById(id);
	if (element) {
		element.scrollIntoView({ behavior: 'smooth' });
	}
};
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
							stat: 'armorChargesUsed',
							color: '#8df',
							max: getStat('capacityArmorCharge'),
							current: actionResources.armorChargesUsed,
							inverted: true,
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
					:class="getStat('equipArmorFull') > getStat('slotsArmorFull') ? 'overfull' : ''"
				>
					<h2>
						Full: {{ statsBuffed.equipArmorFull.total }} ⁄
						{{ getStat('slotsArmorFull') }}
					</h2>
					<span v-if="findArmorSlots.full.length > 0">
						<button
							v-for="armor in findArmorSlots.full"
							:key="armor"
							class="armor-list-button"
							@click="scrollTo(armor)"
							:style="'background-color: ' + getBackgroundColor(armor)"
						>
							{{ armor }}
						</button>
					</span>
					<span v-else>--</span>
				</div>
				<div
					class="armor-slot helmet"
					:class="getStat('equipArmorHead') > getStat('slotsArmorHead') ? 'overfull' : ''"
				>
					<h2>
						Helmet: {{ statsBuffed.equipArmorHead.total }} ⁄
						{{ getStat('slotsArmorHead') }}
					</h2>
					<span v-if="findArmorSlots.head.length > 0">
						<button
							v-for="armor in findArmorSlots.head"
							:key="armor"
							class="armor-list-button"
							@click="scrollTo(armor)"
							:style="'background-color: ' + getBackgroundColor(armor)"
						>
							{{ armor }}
						</button>
					</span>
					<span v-else>--</span>
				</div>
				<div
					class="armor-slot arm"
					:class="getStat('equipArmorArm') > getStat('slotsArmorArm') ? 'overfull' : ''"
				>
					<h2>
						Arm: {{ statsBuffed.equipArmorArm.total }} ⁄
						{{ getStat('slotsArmorArm') }}
					</h2>
					<span v-if="findArmorSlots.arm.length > 0">
						<button
							v-for="armor in findArmorSlots.arm"
							:key="armor"
							class="armor-list-button"
							@click="scrollTo(armor)"
							:style="'background-color: ' + getBackgroundColor(armor)"
						>
							{{ armor }}
						</button>
					</span>
					<span v-else>--</span>
				</div>
				<div
					class="armor-slot torso"
					:class="
						getStat('equipArmorChest') > getStat('slotsArmorChest') ? 'overfull' : ''
					"
				>
					<h2>
						Torso: {{ statsBuffed.equipArmorChest.total }} ⁄
						{{ getStat('slotsArmorChest') }}
					</h2>
					<span v-if="findArmorSlots.chest.length > 0">
						<button
							v-for="armor in findArmorSlots.chest"
							:key="armor"
							class="armor-list-button"
							@click="scrollTo(armor)"
							:style="'background-color: ' + getBackgroundColor(armor)"
						>
							{{ armor }}
						</button>
					</span>
					<span v-else>--</span>
				</div>
				<div
					class="armor-slot legs"
					:class="getStat('equipArmorLegs') > getStat('slotsArmorLegs') ? 'overfull' : ''"
				>
					<h2>
						Legs: {{ statsBuffed.equipArmorLegs.total }} ⁄
						{{ getStat('slotsArmorLegs') }}
					</h2>
					<span v-if="findArmorSlots.leg.length > 0">
						<button
							v-for="armor in findArmorSlots.leg"
							:key="armor"
							class="armor-list-button"
							@click="scrollTo(armor)"
							:style="'background-color: ' + getBackgroundColor(armor)"
						>
							{{ armor }}
						</button>
					</span>
					<span v-else>--</span>
				</div>
				<div
					class="armor-slot class"
					:class="
						getStat('equipArmorClass') > getStat('slotsArmorClass') ? 'overfull' : ''
					"
				>
					<h2>
						Class: {{ statsBuffed.equipArmorClass.total }} ⁄
						{{ getStat('slotsArmorClass') }}
					</h2>
					<span v-if="findArmorSlots.class.length > 0">
						<button
							v-for="armor in findArmorSlots.class"
							:key="armor"
							class="armor-list-button"
							@click="scrollTo(armor)"
							:style="'background-color: ' + getBackgroundColor(armor)"
						>
							{{ armor }}
						</button>
					</span>
					<span v-else>--</span>
				</div>
				<div
					class="armor-slot exotic"
					:class="
						getStat('equipArmorExotic') > getStat('slotsArmorExotic') ? 'overfull' : ''
					"
				>
					<h2>
						Exotic: {{ statsBuffed.equipArmorExotic.total }} ⁄
						{{ getStat('slotsArmorExotic') }}
					</h2>
					<span v-if="findArmorSlots.exotic.length > 0">
						<button
							v-for="armor in findArmorSlots.exotic"
							:key="armor"
							class="armor-list-button"
							@click="scrollTo(armor)"
							:style="'background-color: ' + getBackgroundColor(armor)"
						>
							{{ armor }}
						</button>
					</span>
					<span v-else>--</span>
				</div>
				<div
					v-if="findArmorSlots.other.length > 0"
					class="armor-slot other"
				>
					<h2>Other:</h2>
					<button
						v-for="armor in findArmorSlots.other"
						:key="armor"
						class="armor-list-button"
						@click="scrollTo(armor)"
						:style="'background-color: ' + getBackgroundColor(armor)"
					>
						{{ armor }}
					</button>
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
.armor-slots-active :first-child {
	border-top: var(--line);
}
.armor-slots-active h2 {
	width: 14em;
}
.armor-slot {
	flex: 1 1 auto;
	border-left: var(--line);
	border-right: var(--line);
	border-bottom: var(--line);
	padding: 2px;
	background-repeat: no-repeat;
	background-position: right;
	background-size: 2.5em;
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
.armor-list-button {
	display: block;
	width: 100%;
}
.armor-slot.full {
	background-image: url('/icons/Slot_Overview.svg');
}
.armor-slot.helmet {
	background-image: url('/icons/Slot_Helmet.svg');
}
.armor-slot.arm {
	background-image: url('/icons/Slot_Arms.svg');
}
.armor-slot.torso {
	background-image: url('/icons/Slot_Chest.svg');
}
.armor-slot.legs {
	background-image: url('/icons/Slot_Leg.svg');
}
.armor-slot.class {
	background-image: url('/icons/Slot_Class.svg');
}
</style>
