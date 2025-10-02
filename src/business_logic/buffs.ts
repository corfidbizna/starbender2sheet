import {
	type StatsCalculatedKey,
	type StatsCalculated,
	labelToStatName,
	type StatSheet,
} from '@/composables/useCharacterData';

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
	categories: Record<string, number>;
	summary: string;
};
export type CharacterBuffSummary = {
	[Property in StatsCalculatedKey]?: BuffSummary;
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
				const statResult = Number(
					stats[labelToStatName[item.toLocaleLowerCase()] as StatsCalculatedKey],
				);
				if (item[0] === '-') {
					return -statResult;
				} else {
					return statResult;
				}
			}
		});
		const magnitude = newFactors.reduce((accumulator, currentValue) => {
			return (accumulator || 1) * (currentValue || 1);
		});
		let result: number;
		if (multFlag) {
			console.log("Hey!  Multiplies of this nature aren't properly supported anymore!!!");
			result =
				stats[labelToStatName[affectedStat.toLocaleLowerCase()] as StatsCalculatedKey] *
				(Number(magnitude) - 1);
		} else {
			result = Number(magnitude);
		}
		return {
			category: currentCategory,
			sourceName: buff.name,
			affectedStat: labelToStatName[
				affectedStat.replace(/^[Mm]isc /, '').toLocaleLowerCase()
			] as StatsCalculatedKey,
			amount: result,
		};
	});
};
export const tallyBuffs = (buffs: BuffEffect[], stats: StatsCalculated) => {
	// Note: the destionation needs to be filtered through the labels-whatever to get the actual stat key name.
	const result = {} as CharacterBuffSummary;
	buffs.forEach((buff) => {
		const key = buff.affectedStat.toLocaleLowerCase() as StatsCalculatedKey;
		if (stats[key] === undefined) {
			// If the destination stat doesn't exist...
			console.error('Invalid stat provided: ' + buff.affectedStat);
			return;
		}
		if (!result[key]) {
			// If there isn't alreay buff accumulation happening...
			result[key] = {
				total: stats[key],
				categories: {},
				summary: buff.sourceName + ' ' + buff.amount,
			};
			result[key].categories[buff.category] = buff.amount;
		} else {
			// Destination exists and buff accumulation has started.
			if (buff.category !== 'Misc') {
				result[key].categories[buff.category] = Math.max(
					buff.amount || -Infinity,
					result[key].categories[buff.category] || -Infinity,
				);
			} else {
				result[key].categories[buff.category] =
					(buff.amount || 0) + (result[key].categories[buff.category] || 0);
			}
			result[key].summary += '\n' + buff.sourceName + ' ' + buff.amount;
		}
	});
	const destinations = Object.keys(result);
	destinations.forEach((destination) => {
		// console.log(
		// 	'destination: ' + destination + '\nstat: ' + stats[destination as StatsCalculatedKey],
		// );
		const currentStat = result[destination as StatsCalculatedKey];
		if (currentStat) {
			const keys = Object.keys(currentStat?.categories || {});
			if (keys.length > 0) {
				keys.forEach((key) => {
					if (currentStat !== undefined) {
						currentStat.total += currentStat.categories[key];
					}
				});
			}
		}
	});
	return result;
};

export const getStatsCalclated = (baseStats: StatSheet, lolidk: any): Partial<StatsCalculated> => {
	return {};
};
