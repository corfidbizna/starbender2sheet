import {
	type StatName,
	labelToStatName,
	sizeMap,
	type Characters,
	labelMap,
} from '@/composables/useCharacterData';

export type BuffTypes = 'Buff' | 'Debuff' | 'Neutral' | 'Warning' | 'Hidden';
// Every piece of information about a buff, as provided by the user
export type BuffInfo = {
	name: string;
	type: BuffTypes;
	icon?: string;
	category?: string;
	isStory: boolean;
	isStacking?: boolean;
	stackMax?: number;
	stacks: number;
	duration?: number;
	roundsRemaining?: number;
	description?: string;
	perks?: string;
	effects?: string;
	isPassive?: boolean;
	active: boolean;
};
export type PartyBuffInfo = BuffInfo & Characters;
// An INDIVIDUAL effect, post-parsing.
export type BuffEffect = {
	category: string;
	sourceName: string;
	affectedStat: StatName;
	amount: number;
};
// The value for a map of all stats; this contains the information about how the current stat came to be.
export type BuffSummary = {
	total: number;
	categories: Record<string, number>;
	summary: string[];
};
// A full set of stats, populated with data describing the current state of the stat.
// Formerly `CharacterBuffSummary`
export type Stats = {
	[Property in StatName]: BuffSummary;
};

const statShouldMultiply = (stat: StatName) => {
	return stat.startsWith('actionsMoveMult');
};

const distributeStat = (
	inputStats: Stats,
	statName: StatName,
	amount: number,
	outputStats: Stats,
	explanation?: string[],
) => {
	// some stats are always multiplicative, some stats are always additive, are some stats sometimes multiplicative and sometimes additive?
	if (statShouldMultiply(statName)) outputStats[statName].total *= amount;
	else outputStats[statName].total += amount;
	if (explanation) outputStats[statName].summary.push(...explanation);
	if (buffDistributionMap[statName]?.affectedStats) {
		for (const affectedStat of buffDistributionMap[statName].affectedStats) {
			if (affectedStat.hasOwnProperty('ratio')) {
				const affectedLestat = affectedStat as StatNameWithRatio;
				let ratio;
				if (typeof affectedLestat.ratio === 'function') {
					ratio = affectedLestat.ratio(inputStats);
				} else {
					ratio = affectedLestat.ratio;
				}
				distributeStat(
					inputStats,
					affectedLestat.stat,
					amount * ratio,
					outputStats,
					explanation,
				);
			} else {
				const affectedLestat = affectedStat as StatName;
				distributeStat(inputStats, affectedLestat, amount, outputStats, explanation);
			}
		}
	}
};

const neutralStatTotals: Record<string, number> = {
	str: -5,
	dex: -5,
	con: -5,
	wis: -5,
	int: -5,
	cha: -5,
	ac: 10,
	acFF: 10,
	acTouch: 10,
	acFFTouch: 10,
	size: 0,
	reach: 5,
	actionsMoveMult: 1,
	actionsMoveBaseLand: 30,
	capacityCarrying: 25,
	capacitySpecial: 18,
	capacityHeavy: 8,
	energyUniversal: 2,
	energyMeleeRecharge: 1,
	energyGrenadeRecharge: 1,
	energySuperRecharge: 1,
	energyClassRecharge: 1,
	energyDiscountMelee: 0,
	energyDiscountGrenade: 0,
	energyDiscountSuper: 0,
	energyDiscountClass: 0,
	slotsArmorHead: 3,
	slotsArmorArm: 3,
	slotsArmorChest: 3,
	slotsArmorLegs: 3,
	slotsArmorClass: 1,
	slotsArmorFull: 1,
	slotsArmorExotic: 1,
	slotsWeapon: 3,
	hands: 2,
};
// Creates a neutral starting state for all stats.
export const makeNeutralStats = () => {
	const ret: Record<string, BuffSummary> = {};
	Object.keys(labelMap).forEach((key) => {
		ret[key] = {
			total: neutralStatTotals[key] || 0,
			categories: {},
			summary: [],
		};
	});
	return ret as Stats;
};

export const distributeStats = (buffSummary: Stats): Stats => {
	const ret: Stats = makeNeutralStats();
	for (const stat in buffSummary) {
		// the reason `stat` could be a string is if `buffSummary` has
		// additional keys beyond those required by CharacterBuffSummary.
		//
		// This is something that is allowed at all times and we can't tell
		// TypeScript that it isn't.
		//
		// two lines of mollification, are you keeping score? -SB
		const lestat = stat as StatName;
		if (buffSummary[lestat]) {
			distributeStat(
				buffSummary,
				lestat,
				buffSummary[lestat].total,
				ret,
				buffSummary[lestat].summary,
			);
		}
	}
	for (const key in ret) {
		const specialDooo = buffDistributionMap[key as StatName];
		if (specialDooo?.special !== undefined) {
			specialDooo.special(ret);
		}
	}
	for (const key in ret) {
		ret[key as StatName].total = Math.trunc(ret[key as StatName].total);
		ret[key as StatName].summary = ret[key as StatName].summary.filter(
			(line) => line[0] !== '.', // Put a `.` in a stat name to make it's effects "hidden"
		);
	}
	return ret;
};

// Buffs will have a category, a name, and list of affected stats.
// - The category should be output in the buff effects.
// - Manually check for if the stat starts with "Misc " to make that the category instead.
// - Manually check for if the stat is actually a skill. (If stats[destination] === undefined)
//   - If the skill is also defined, then the buff didn't have a valid target.
export const getBuffEffects = (buff: BuffInfo): BuffEffect[] => {
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
				} else if (!isNaN(Number(item))) {
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
					console.log("Hey! I reached a state I shouldn't while trying to parse a buff!");
					// const statResult = Number(
					// 	stats[labelToStatName[item.toLocaleLowerCase()] as StatName],
					// );
					// if (item[0] === '-') {
					// 	newFactors.push(-statResult);
					// } else {
					// 	newFactors.push(statResult);
					// }
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
				result = 0; // This is so that `result` has a number
				// result =
				// 	stats[labelToStatName[affectedStat.toLocaleLowerCase()] as StatName] *
				// 	(Number(magnitude) - 1);
			} else {
				result = Number(magnitude);
			}
			return {
				category: currentCategory,
				sourceName: buff.name,
				affectedStat: labelToStatName[
					affectedStat.replace(/^[Mm]isc /, '').toLocaleLowerCase()
				] as StatName,
				amount: result,
			};
		});
	}
};
// Takes a set of cooked buffs and process them into a new set of stats, INCLUDING distribution.
export const tallyBuffs = (buffs: BuffEffect[]): Stats => {
	// Note: the destionation needs to be filtered through the labels-whatever to get the actual stat key name.
	const result = {} as Stats;
	buffs.forEach((buff) => {
		const key = buff.affectedStat as StatName;
		const summaryString =
			buff.sourceName +
			' ' +
			('(+' + buff.amount).replace('+-', '-') +
			' ' +
			labelMap[buff.affectedStat] +
			'), ' +
			buff.category;
		if (!result[key]) {
			// If there isn't already buff accumulation happening...
			result[key] = {
				total: 0,
				categories: {},
				summary: [summaryString],
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
			result[key].summary.push(summaryString);
		}
	});
	const destinations = Object.keys(result);
	destinations.forEach((destination) => {
		const currentStat = result[destination as StatName];
		if (currentStat) {
			const keys = Object.keys(currentStat.categories || {});
			if (keys.length > 0) {
				keys.forEach((key) => {
					if (currentStat !== undefined) {
						currentStat.total += currentStat.categories[key];
					}
				});
			}
		}
	});
	// There is a bug here?!
	return distributeStats(result);
};
type StatNameWithRatio = {
	stat: StatName;
	ratio: number | ((inputBuffs: Stats) => number);
};
/** Describes how to distribute a change in a stat to other stats */
type Distribution = {
	/** stats to linearly affect, optionally with a non-1:1 ratio */
	affectedStats: (StatName | StatNameWithRatio)[];
	/** special logic to apply after all linear effects are done */
	special?: (outputBuffs: Stats) => void;
};
const buffDistributionMap: Partial<Record<StatName, Distribution>> = {
	actionsMoveMult: {
		affectedStats: [
			'actionsMoveBaseLand',
			'actionsMoveBaseSwim',
			'actionsMoveBaseFly',
			'actionsMoveBaseClimb',
		],
	},
	drBase: {
		affectedStats: ['dr', 'drFF'],
	},
	damagePrecision: {
		affectedStats: ['damageMelee', 'damageSpell', 'damageRanged'],
	},
	armor: {
		affectedStats: ['ac', 'acFF', 'dr', 'drFF'],
	},
	armorNatural: {
		affectedStats: ['ac', 'acFF', 'dr', 'drFF'],
	},
	armorShield: {
		affectedStats: ['ac', 'dr'],
	},
	armorDeflection: {
		affectedStats: ['ac', 'acFF', 'acTouch', 'acFFTouch'],
	},
	armorDodge: {
		affectedStats: ['ac', 'acTouch'],
	},
	hpShieldKinetic: {
		affectedStats: ['hpShieldMax'],
	},
	hpShieldSolar: {
		affectedStats: ['hpShieldMax'],
	},
	hpShieldArc: {
		affectedStats: ['hpShieldMax'],
	},
	hpShieldVoid: {
		affectedStats: ['hpShieldMax'],
	},
	hpShieldStasis: {
		affectedStats: ['hpShieldMax'],
	},
	hpShieldStrand: {
		affectedStats: ['hpShieldMax'],
	},
	hpShieldPrismatic: {
		affectedStats: ['hpShieldMax'],
	},
	bab: {
		affectedStats: ['toHitMelee', 'toHitRanged', 'toHitSpell'],
	},
	bdb: {
		affectedStats: ['ac', 'acFF', 'acTouch', 'acFFTouch'],
	},
	str: {
		affectedStats: ['toHitMelee', 'damageMelee', 'strSave'],
	},
	dex: {
		affectedStats: ['toHitRanged', 'ac', 'acTouch', 'initiative', 'dexSave', 'ref'],
	},
	con: {
		affectedStats: [
			'fort',
			'conSave',
			'dr',
			'drFF',
			{ stat: 'hpMax', ratio: (buffs) => buffs.cpl.total }, // TODO
			{ stat: 'hpTempMax', ratio: (buffs) => buffs.cpl.total }, // TODO
			// { stat: 'hpMax', ratio: 7 },
			// { stat: 'hpTempMax', ratio: 7 },
		],
	},
	int: {
		affectedStats: ['skillFocus', 'intSave'],
	},
	wis: {
		affectedStats: ['will', 'wisSave'],
	},
	cha: {
		affectedStats: [
			'toHitSpell',
			'damageSpell',
			'chaSave',
			{ stat: 'energyUniversal', ratio: (buffs) => buffs.cpl.total }, // TODO
			// { stat: 'energyUniversal', ratio: 7 },
		],
	},
	strScore: {
		affectedStats: [{ stat: 'str', ratio: 0.5 }],
		special: (buffs) => {
			const newCapacity =
				25 *
				Math.floor(Math.pow(4, Math.max(buffs.strScore.total / 10, 0))) *
				sizeMap[buffs.size.total].carryingCapacity;

			buffs.capacityCarrying.total = newCapacity;
			buffs.capacityCarrying.summary.splice(0, 0, ...buffs.strScore.summary);
		},
	},
	dexScore: {
		affectedStats: [{ stat: 'dex', ratio: 0.5 }],
	},
	conScore: {
		affectedStats: [{ stat: 'con', ratio: 0.5 }],
	},
	intScore: {
		affectedStats: [{ stat: 'int', ratio: 0.5 }],
	},
	wisScore: {
		affectedStats: [{ stat: 'wis', ratio: 0.5 }],
	},
	chaScore: {
		affectedStats: [{ stat: 'cha', ratio: 0.5 }],
	},
	weightBase: {
		affectedStats: ['weightTotal'],
	},
	weightCurrent: {
		affectedStats: ['weightTotal'],
		special: (buffs) => {
			const encumberance = Math.trunc(
				Math.max(
					0,
					Math.min(3, (buffs.weightCurrent.total / buffs.capacityCarrying.total) * 3),
				),
			);
			const encumberanceMultMap: Record<number, number> = {
				0: 1,
				1: 0.5,
				2: 0.25,
				3: 0,
			};
			const speedMult = encumberanceMultMap[encumberance];
			buffs.encumberance = {
				total: encumberance,
				categories: {},
				summary: buffs.encumberance.summary.splice(0, 0, ...buffs.weightCurrent.summary),
			};
			if (speedMult < 1) {
				const moveStats = [
					'actionsMoveBaseLand',
					'actionsMoveBaseSwim',
					'actionsMoveBaseFly',
					'actionsMoveBaseClimb',
				];
				moveStats.forEach((stat) => {
					const key = stat as StatName;
					if (buffs[key] !== undefined) {
						buffs[key].total *= speedMult;
						buffs[key].summary.push('Encumberance x' + speedMult);
					}
				});
			}
		},
	},
	babPerLevel: {
		affectedStats: ['bab'],
	},
	bdbPerLevel: {
		affectedStats: ['bdb'],
	},
	hpPerLevel: {
		affectedStats: ['hpMax', 'hpTempMax'],
	},
	fortPerLevel: {
		affectedStats: ['fort'],
	},
	refPerLevel: {
		affectedStats: ['ref'],
	},
	willPerLevel: {
		affectedStats: ['will'],
	},
	size: {
		affectedStats: [],
		special: (buffs) => {
			// When buffing skills is implemented, make sure to implement Stealth and Fly pls!!
			const size = buffs.size.total;
			const addAC = sizeMap[size].ac;
			const multCarrying = sizeMap[size].carryingCapacity;
			const invertedReach: Record<number, number> = {
				'-4': -4,
				'-3': -3,
				'-2': -2.5,
				'-1': 0,
				'0': 0,
				'1': 5,
				'2': 10,
				'3': 15,
				'4': 25,
				'5': 35,
			};
			const addToHit = sizeMap[size].toHit;
			// AC Distribution
			buffs.ac.total += addAC;
			if (addAC !== 0) {
				buffs.ac.summary.push('Size ' + ('+' + addAC).replace('+-', '-'));
			}
			// Carrying Capacity Distribution
			buffs.capacityCarrying.total *= multCarrying;
			buffs.capacityCarrying.summary.push('Size x' + multCarrying);
			// Reach Distribution
			buffs.reach.total += invertedReach[size];
			buffs.reach.summary.push('Size ' + ('+' + invertedReach[size]).replace('+-', '-'));
			// To Hit Distribution
			['toHitMelee', 'toHitRanged', 'toHitSpell'].forEach((item) => {
				const hit = item as StatName;
				buffs[hit].total += addToHit;
				buffs[hit].summary.push('Size ' + ('+' + addToHit).replace('+-', '-'));
			});
		},
	},
};
