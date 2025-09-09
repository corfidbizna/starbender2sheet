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
		// Example: `str +1*dex*stacks`√
		// Example: `str +10, dex +1*stacks`√
		// Example: `+5`
		// Example: `dex *2`
		const [affectedStat, amount] = effect.split(/\s+/);
		if (!amount) {
			throw new Error('Buff must have a target!');
		}
		// affectedStat = `str`, amount = `+1*dex*stacks`
		const splitAmount = amount.split('*');
		let multFlag = false;
		const newFactors = splitAmount.map((item) => {
			if (!item) {
				multFlag = true;
			} else if (Number(item)) {
				// If the item was just a number
				return Number(item);
			} else if (item.replace('+', '') === 'stacks') {
				// If the stacks has a plus in front of it
				// or had nothing
				return buff.stacks || 1;
			} else if (item.replace('-', '') === 'stacks') {
				// If the stacks was negative
				return -(buff.stacks || -1);
			} else {
				// Should be either the name of a stat or a typo
				if (item[0] === '-') {
					return -Number(stats[item as CharacterStatKey] || 0);
				} else {
					return Number(stats[item as CharacterStatKey] || 0);
				}
			}
		});
		const magnitude = newFactors.reduce((accumulator, currentValue) => {
			return (accumulator || 1) * (currentValue || 1);
		});
		let result: number;
		if (multFlag) {
			result = stats[affectedStat as CharacterStatKey] * (Number(magnitude) - 1);
		} else {
			result = Number(magnitude);
		}
		return {
			source: buff.name,
			effectedStat: affectedStat as CharacterStatKey,
			amount: result,
		};
	});
};
