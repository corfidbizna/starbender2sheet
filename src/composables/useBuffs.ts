import { computed, type ComputedRef, type Ref } from 'vue';
import type { CharacterStats } from './useCharacterData';
import { getBuffEffects, type BuffEffect, type PartyBuffInfo } from '@/business_logic/buffs';

export default function useBuffs(
	characterStats: ComputedRef<CharacterStats>,
	partyBuffs: ComputedRef<PartyBuffInfo[]> | Ref<PartyBuffInfo[]>,
) {
	return {
		flatBuffArray: computed<BuffEffect[]>(() => {
			const stats = characterStats.value;
			const buffs = partyBuffs.value;
			return buffs.map((buff) => getBuffEffects(buff, stats)).flat();
		}),
	};
}
