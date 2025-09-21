import type { CharacterStatKey, CharacterStats } from '@/composables/useCharacterData';

type BuffTypes = 'Buff' | 'Debuff' | 'Story Buff';
export type BuffInfo = {
	name: string;
	type: BuffTypes;
	category?: string;
	isStacking?: boolean;
	stackMax?: number;
	stacks?: number;
	duration?: number;
	roundsRemaining?: number;
	description?: string;
	effects?: string;
	isPassive?: boolean;
};
export type PartyBuffInfo = BuffInfo & {
	aurora: boolean;
	kara: boolean;
	mark: boolean;
	lewis: boolean;
};

export type BuffEffect = {
	source: string;
	affectedStat: CharacterStatKey;
	amount: number;
};
export type BuffSummary = {
	total: number;
	summary: string;
};
export type CharacterBuffSummary = {
	[Property in keyof CharacterStats]?: BuffSummary;
};
export const getBuffEffects = (buff: BuffInfo, stats: CharacterStats): BuffEffect[] => {
	if (!buff.effects) {
		return [];
	}
	return buff.effects.split(', ').map((effect): BuffEffect => {
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
			affectedStat: affectedStat as CharacterStatKey,
			amount: result,
		};
	});
};
export const tallyBuffs = (buffs: BuffEffect[], stats: CharacterStats) => {
	const result = {} as CharacterBuffSummary;
	buffs.forEach((buff) => {
		const key = buff.affectedStat as keyof CharacterBuffSummary;
		if (stats[buff.affectedStat] === undefined) {
			console.error('Invalid stat provided: ' + buff.affectedStat);
			return;
		}
		if (!result[key]) {
			result[key] = {
				total: stats[key] + buff.amount,
				summary: buff.source + ' ' + buff.amount,
			};
		} else {
			result[key].total += buff.amount;
			result[key].summary += '\n' + buff.source + ' ' + buff.amount;
		}
	});
	return result;
};
