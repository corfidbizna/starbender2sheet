import {
	type StatsCalculatedKey,
	type StatsCalculated,
	labelToStatName,
} from '@/composables/useCharacterData';

type BuffTypes = 'Buff' | 'Debuff' | 'Story Buff';
export type BuffInfo = {
	name: string;
	type: BuffTypes;
	category?: string;
	isStacking?: boolean;
	stackMax?: number;
	stacks: number;
	duration?: number;
	roundsRemaining?: number;
	description?: string;
	effects?: string;
	isPassive?: boolean;
	active: boolean;
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
	} else {
		return buff.effects.split(', ').map((effect): BuffEffect => {
			const effectForSplit = effect.replace(/( )(?![A-Za-z])/g, '¶');
			// Str Mod¶+2*Dex Mod
			const [affectedStat, amount] = effectForSplit.split('¶');
			if (!amount) {
				throw new Error('Buff must have a target!');
			}
			let currentCategory = buff.category || 'Misc';
			if (affectedStat.toLocaleLowerCase().slice(0, 4) === 'misc') {
				currentCategory = 'Misc';
			}
			const splitAmount = amount.split('*');
			let multFlag = false;
			const newFactors = [];
			for (let i = 0; i < splitAmount.length; i++) {
				const item = splitAmount[i];
				if (!item) {
					multFlag = true;
				} else if (Number(item)) {
					// If the item was just a number
					newFactors.push(Number(item));
				} else if (item.replace('+', '') === 'stacks') {
					// If the stacks has a plus in front of it
					// or had nothing
					newFactors.push(buff.stacks);
				} else if (item.replace('-', '') === 'stacks') {
					// If the stacks was negative
					newFactors.push(-buff.stacks);
				} else {
					// Should be either the name of a stat or a typo
					const statResult = Number(
						stats[labelToStatName[item.toLocaleLowerCase()] as StatsCalculatedKey],
					);
					if (item[0] === '-') {
						newFactors.push(-statResult);
					} else {
						newFactors.push(statResult);
					}
				}
			}
			const magnitude = newFactors.reduce((accumulator, currentValue) => {
				return accumulator * (currentValue === undefined ? 1 : currentValue);
			}, 1);
			let result: number;
			if (multFlag) {
				console.log(
					"Hey!  Multiplies of this nature aren't properly supported anymore!!! Maybe???",
				);
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
	}
};
export const tallyBuffs = (buffs: BuffEffect[], stats: StatsCalculated) => {
	// Note: the destionation needs to be filtered through the labels-whatever to get the actual stat key name.
	const result = {} as CharacterBuffSummary;
	buffs.forEach((buff) => {
		const key = buff.affectedStat as StatsCalculatedKey;
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
				summary:
					buff.sourceName +
					' ' +
					('+' + buff.amount).replace('+-', '-') +
					' ' +
					buff.category,
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
			result[key].summary +=
				'\n' +
				buff.sourceName +
				' ' +
				('+' + buff.amount).replace('+-', '-') +
				' ' +
				buff.category;
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
	Object.keys(result).forEach((statt) => {
		// Remove fractional values at this stage.
		const stat = statt as StatsCalculatedKey;
		const newTotal = Math.trunc(result[stat]?.total || 0);
		if (result[stat] !== undefined) {
			result[stat].total = newTotal;
		}
	});
	return buffsDistribute(result, stats);
	// return result;
};
export const buffsDistribute = (buffs: CharacterBuffSummary, stats: StatsCalculated) => {
	const distributeAdditive = (
		source: StatsCalculatedKey,
		destinations: StatsCalculatedKey[],
		stats: StatsCalculated,
		ratio?: number,
	) => {
		destinations.forEach((destination) => {
			// console.log(buffs[destination]);
			// console.log(source + ' -> ' + destinations.join(', ') + '\n');
			if (buffs[destination] !== undefined) {
				buffs[destination].total += (ratio || 1) * (buffs[source]?.total || 0);
				buffs[destination].summary += '\n' + buffs[source]?.summary || '';
			} else {
				buffs[destination] = {
					total: stats[destination] + (ratio || 1) * (buffs[source]?.total || 0),
					categories: {},
					summary: buffs[source]?.summary || '',
				};
			}
		});
	};
	const distributeScore = (
		source: StatsCalculatedKey,
		destinations: StatsCalculatedKey[],
		stats: StatsCalculated,
	) => {
		destinations.forEach((destination) => {
			// console.log(buffs[destination]);
			// console.log(source + ' -> ' + destinations.join(', ') + '\n');
			const result = Math.floor(((buffs[source]?.total || 10) - 10) / 2);
			if (buffs[destination] !== undefined) {
				// Math.floor((source.strScore - 10) / 2)
				buffs[destination].total += result - stats[destination];
				buffs[destination].summary += '\n' + buffs[source]?.summary || '';
			} else {
				buffs[destination] = {
					total: result,
					categories: {},
					summary: buffs[source]?.summary || '',
				};
			}
		});
	};
	const distributeMultiply = (
		source: StatsCalculatedKey,
		destinations: StatsCalculatedKey[],
		stats: StatsCalculated,
		ratio?: number,
	) => {
		destinations.forEach((destination) => {
			if (buffs[destination]) {
				buffs[destination].total +=
					buffs[destination].total * (buffs[source]?.total || 1) * (ratio || 1);
				buffs[destination].summary += '\n' + buffs[source]?.summary || '';
			} else {
				buffs[destination] = {
					total: stats[destination] * (buffs[source]?.total || 1) * (ratio || 1),
					categories: {},
					summary: buffs[source]?.summary || '',
				};
			}
		});
	};
	const distributeWeight = (stats: StatsCalculated) => {
		const encumberance = Math.trunc(
			Math.max(
				0,
				Math.min(
					3,
					((buffs.weightCurrent?.total || stats.weightCurrent) /
						(buffs.capacityCarrying?.total || stats.capacityCarrying)) *
						3,
				),
			),
		);
		const sizeMultMap: Record<number, number> = {
			0: 1,
			1: 0.5,
			2: 0.25,
			3: 0,
		};
		const speedMult = sizeMultMap[encumberance];
		if (buffs.encumberance !== undefined) {
			buffs.encumberance.total = encumberance;
			buffs.encumberance.summary += '\n' + (buffs.weightCurrent?.summary || '');
		} else {
			buffs.encumberance = {
				total: encumberance,
				categories: {},
				summary: buffs.weightCurrent?.summary || '',
			};
		}
		if (speedMult < 1) {
			const moveStats = [
				'actionsMoveBaseLand',
				'actionsMoveBaseSwim',
				'actionsMoveBaseFly',
				'actionsMoveBaseClimb',
			];
			moveStats.forEach((stat) => {
				const key = stat as StatsCalculatedKey;
				if (buffs[key] !== undefined) {
					buffs[key].total = buffs[key].total * speedMult;
					buffs[key].summary += '\nEncumberance x' + speedMult;
				} else {
					buffs[key] = {
						total: stats[key] * speedMult,
						categories: {},
						summary: 'Encumberance x' + speedMult,
					};
				}
			});
		}
	};
	const buffKeys = Object.keys(buffs);
	buffKeys.forEach((name) => {
		if (name === 'actionsMoveMult') {
			distributeMultiply(
				'actionsMoveMult',
				[
					'actionsMoveBaseLand',
					'actionsMoveBaseSwim',
					'actionsMoveBaseFly',
					'actionsMoveBaseClimb',
				],
				stats,
			);
		} else if (name === 'drBase') {
			distributeAdditive('drBase', ['dr', 'drFF'], stats);
		} else if (name === 'damagePrecision') {
			// Add a "precision" toggle on / off to modify weapon damage.
			// Buffing "Precision Damage" buffs _this_ damage, not the weapon's base damage.
			// Precision damage can be dice ∏_∏
			distributeAdditive(
				'damagePrecision',
				['damageMelee', 'damageSpell', 'damageRanged'],
				stats,
			);
		} else if (name === 'armor') {
			distributeAdditive('armor', ['ac', 'acFF', 'dr', 'drFF'], stats);
		} else if (name === 'armorNatural') {
			distributeAdditive('armorNatural', ['ac', 'acFF', 'dr', 'drFF'], stats);
		} else if (name === 'armorShield') {
			distributeAdditive('armorShield', ['ac', 'dr'], stats);
		} else if (name === 'armorDeflection') {
			distributeAdditive('armorDeflection', ['ac', 'acFF', 'acTouch', 'acFFTouch'], stats);
		} else if (name === 'armorDodge') {
			distributeAdditive('armorDodge', ['ac', 'acTouch'], stats);
		} else if (name === 'bab') {
			distributeAdditive('bab', ['toHitMelee', 'toHitRanged', 'toHitSpell'], stats);
		} else if (name === 'bdb') {
			distributeAdditive('bdb', ['ac', 'acFF', 'acTouch', 'acFFTouch'], stats);
		} else if (name === 'str') {
			distributeAdditive('str', ['toHitMelee', 'damageMelee', 'strSave'], stats);
		} else if (name === 'dex') {
			distributeAdditive(
				'dex',
				['toHitRanged', 'ac', 'acTouch', 'initiative', 'dexSave', 'ref'],
				stats,
			);
		} else if (name === 'con') {
			distributeAdditive('con', ['fort', 'conSave', 'dr', 'drFF'], stats);
			distributeAdditive('con', ['hpMax', 'hpTempMax'], stats, buffs.cpl?.total || stats.cpl);
		} else if (name === 'int') {
			distributeAdditive('int', ['skillFocus', 'intSave'], stats);
		} else if (name === 'wis') {
			distributeAdditive('wis', ['will', 'wisSave'], stats);
		} else if (name === 'cha') {
			distributeAdditive('cha', ['toHitSpell', 'damageSpell', 'chaSave'], stats);
			distributeAdditive('cha', ['energyUniversal'], stats, buffs.cpl?.total || stats.cpl);
		} else if (name === 'strScore') {
			distributeScore('strScore', ['str'], stats);
			// if (buffs.capacityCarrying !== undefined) {
			// 	stat.carryingCapacity * (buffs.strScore?.total || 1) * 30;
			// }
			// Carrying Capacity goes here somehow ._.
		} else if (name === 'dexScore') {
			distributeScore('dexScore', ['dex'], stats);
		} else if (name === 'conScore') {
			distributeScore('conScore', ['con'], stats);
		} else if (name === 'intScore') {
			distributeScore('intScore', ['int'], stats);
		} else if (name === 'wisScore') {
			distributeScore('wisScore', ['wis'], stats);
		} else if (name === 'chaScore') {
			distributeScore('chaScore', ['cha'], stats);
		} else if (name === 'weightBase') {
			distributeAdditive('weightBase', ['weightTotal'], stats);
		} else if (name === 'weightCurrent') {
			distributeAdditive('weightCurrent', ['weightTotal'], stats);
			distributeWeight(stats);
		} else if (name === 'babPerLevel') {
			distributeAdditive('babPerLevel', ['bab'], stats);
		} else if (name === 'bdbPerLevel') {
			distributeAdditive('bdbPerLevel', ['bdb'], stats);
		} else if (name === 'hpPerLevel') {
			distributeAdditive('hpPerLevel', ['hpMax', 'hpTempMax'], stats);
		} else if (name === 'fortPerLevel') {
			distributeAdditive('fortPerLevel', ['fort'], stats);
		} else if (name === 'refPerLevel') {
			distributeAdditive('refPerLevel', ['ref'], stats);
		} else if (name === 'willPerLevel') {
			distributeAdditive('willPerLevel', ['will'], stats);
		} else if (name === 'size') {
		}
	});
	return buffs;
};
