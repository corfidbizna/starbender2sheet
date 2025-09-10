import { computed, type ComputedRef, type Ref } from 'vue';
import type { CharacterStats } from './useCharacterData';
import {
	getBuffEffects,
	tallyBuffs,
	type BuffEffect,
	type BuffInfo,
	type CharacterBuffSummary,
} from '@/business_logic/buffs';

export default function useBuffs(
	characterStats: ComputedRef<CharacterStats>,
	partyBuffs: ComputedRef<BuffInfo[]> | Ref<BuffInfo[]>,
) {
	const flatBuffArray = computed<BuffEffect[]>(() => {
		const stats = characterStats.value;
		const buffs = partyBuffs.value;
		return buffs.map((buff) => getBuffEffects(buff, stats)).flat();
	});
	return {
		flatBuffArray,
		talliedBuffs: computed<CharacterBuffSummary>(() => {
			return tallyBuffs(flatBuffArray.value, characterStats.value);
		}),
	};
}
