import type { StatsCalculatedKey, StatsCalculated } from '@/composables/useCharacterData';

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
	category: string;
	sourceName: string;
	affectedStat: StatsCalculatedKey;
	amount: number;
};
export type BuffSummary = {
	total: number;
	summary: string;
};
export type CharacterBuffSummary = {
	[Property in keyof StatsCalculated]?: BuffSummary;
};
// Buffs will have a category, a name, and list of affected stats.
// - The category should be output in the buff effects.
// - Manually check for if the stat starts with "Misc " to make that the category instead.
// - Manually check for if the stat is actually a skill. (If stats[destination] === undefined)
//   - If the skill is also defined, then the buff didn't have a valid target.

export const getBuffEffects = (buff: BuffInfo, stats: StatsCalculated): BuffEffect[] => {
	if (!buff.effects) {
		return [];
	}
	return buff.effects.split(', ').map((effect): BuffEffect => {
		// Str Mod +2
		// Str Mod +2*Dex Mod
		// Str Mod +2*Dex Mod*stacks
		// Str Mod +2*Dex Mod*-stacks
		// Str Mod -2*stacks
		const effectForSplit = effect.replace(/( )(?![A-Za-z])/g, '¶');
		// Str Mod¶+2*Dex Mod
		const [affectedStat, amount] = effectForSplit.split('¶');
		if (!amount) {
			throw new Error('Buff must have a target!');
		}
		// affectedStat = `str`, amount = `+1*dex*stacks`
		let currentCategory = buff.category || 'Misc';
		if (affectedStat.toLocaleLowerCase().slice(0, 4) === 'misc') {
			currentCategory = 'Misc';
		}
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
					return -Number(stats[item as StatsCalculatedKey] || 0);
				} else {
					return Number(stats[item as StatsCalculatedKey] || 0);
				}
			}
		});
		const magnitude = newFactors.reduce((accumulator, currentValue) => {
			return (accumulator || 1) * (currentValue || 1);
		});
		let result: number;
		if (multFlag) {
			result = stats[affectedStat as StatsCalculatedKey] * (Number(magnitude) - 1);
		} else {
			result = Number(magnitude);
		}
		return {
			category: currentCategory,
			sourceName: buff.name,
			affectedStat: affectedStat.replace(/^[Mm]isc /, '') as StatsCalculatedKey,
			amount: result,
		};
	});
};
export const tallyBuffs = (buffs: BuffEffect[], stats: StatsCalculated) => {
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
				summary: buff.sourceName + ' ' + buff.amount,
			};
		} else {
			result[key].total += buff.amount;
			result[key].summary += '\n' + buff.sourceName + ' ' + buff.amount;
		}
	});
	return result;
};

export const getStatsCalclated = (baseStats: StatSheet, lolidk: any): Partial<StatsCalculated> => {
	return {};
};
