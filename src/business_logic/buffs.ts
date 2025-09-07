import type { CharacterStatKey, CharacterStats } from '@/composables/useCharacterData';

type BuffTypes = 'Buff' | 'Debuff' | 'Story Buff';
export type BuffInfo = {
	aurora?: boolean;
	kara?: boolean;
	mark?: boolean;
	lewis?: boolean;
	name: string;
	type: BuffTypes;
	isStacking?: boolean;
	stackMax?: number;
	stacks?: number;
	description?: string;
	effects?: string;
	isPassive?: boolean;
};

export type CharacterStatsBuffed = CharacterStats & {
	strBuffed: number;
};

export type BuffEffect = {
	source: string;
	effectedStat: CharacterStatKey;
	amount: number;
};
export const getBuffEffects = (buff: BuffInfo, stats: CharacterStats): BuffEffect[] => {
	if (!buff.effects) {
		return [];
	}
	return buff.effects.split(', ').map((effect): BuffEffect => {
		const [effectedStat, amount] = effect.split(/\s+/);
		return {
			source: buff.name,
			effectedStat: effectedStat as CharacterStatKey,
			amount: Number(amount),
		};
	});
};
