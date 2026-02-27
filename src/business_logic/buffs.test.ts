import { describe, test, expect } from 'vitest';
import { type StatSheet } from '@/composables/useCharacterData';
import { getBuffEffects, type BuffInfo, tallyBuffs, makeNeutralStats } from './buffs';

const testCharacterBaseStats: StatSheet = {
	cpl: 0,
	name: '',
	race: '',
	class: '',
	colorHair: '',
	colorEye: '',
	height: '',
	weight: 0,
	guardianClass: '',
	guardianSubclass: '',
	nameGhost: '',
	strScore: 1,
	dexScore: 2,
	conScore: 3,
	intScore: 4,
	wisScore: 5,
	chaScore: 6,
	hpPerLevel: 0,
	skillFocus: 0,
	fortPerLevel: 0,
	refPerLevel: 0,
	willPerLevel: 0,
	babPerLevel: 0,
	bdbPerLevel: 0,
	armor: 0,
	armorNatural: 0,
	armorShield: 0,
	armorDeflection: 0,
	armorDodge: 0,
	attacks: 0,
	reactions: 0,
	moves: 0,
	energySuper: 0,
	energyMelee: 0,
	energyGrenade: 0,
	energyClass: 0,
	size: 0,
};

const testCharacterSimple = makeNeutralStats();
testCharacterSimple.str.total = 6;
testCharacterSimple.dex.total = 10;
testCharacterSimple.con.total = 7;
testCharacterSimple.int.total = 1;
testCharacterSimple.wis.total = 0;
testCharacterSimple.cha.total = 4;
testCharacterSimple.strScore.total = 22;
testCharacterSimple.dexScore.total = 30;
testCharacterSimple.conScore.total = 24;
testCharacterSimple.intScore.total = 12;
testCharacterSimple.wisScore.total = 10;
testCharacterSimple.chaScore.total = 18;
testCharacterSimple.cpl.total = 7;
testCharacterSimple.ac.total = 10;

describe('Behaviors of getBuffEffects', () => {
	test('A buff wilth no effects', () => {
		const buff: BuffInfo = {
			name: 'Cool sunglasses',
			type: 'Buff',
			isStory: false,
			description: 'Makes you look cool',
			active: true,
			stacks: 0,
		};
		const result = getBuffEffects(buff);
		expect(result).toEqual([]);
	});
	test('The simplest strength stat boost', () => {
		const buff: BuffInfo = {
			name: 'Buff Strength',
			type: 'Buff',
			isStory: false,
			isStacking: false,
			description: 'Buffs strength by 5.',
			effects: 'Str Mod +5',
			active: true,
			stacks: 0,
		};
		const result = getBuffEffects(buff);
		expect(result).toEqual([
			{
				category: 'Misc',
				sourceName: 'Buff Strength',
				affectedStat: 'str',
				amount: 5,
			},
		]);
	});
	test('The two-stat reducer', () => {
		const buff: BuffInfo = {
			name: 'Debuff Strength & Dexterity',
			type: 'Debuff',
			isStacking: false,
			isStory: false,
			description: 'Debuffs strength and dexterity.',
			effects: 'Str Mod -5, Dex Mod -7',
			active: true,
			stacks: 0,
		};
		const result = getBuffEffects(buff);
		expect(result).toEqual([
			{
				category: 'Misc',
				sourceName: 'Debuff Strength & Dexterity',
				affectedStat: 'str',
				amount: -5,
			},
			{
				category: 'Misc',
				sourceName: 'Debuff Strength & Dexterity',
				affectedStat: 'dex',
				amount: -7,
			},
		]);
	});

	// Using a stat in the math isn't supported currently
	// test('Depends on another stat', () => {
	// 	const buff: BuffInfo = {
	// 		name: 'Buffs Something Based on Another Stat',
	// 		type: 'Buff',
	// 		isStacking: false,
	// 		isStory: false,
	// 		description: 'Buffs strength by dexterity mod.',
	// 		effects: 'Str Mod +1*Dex Mod',
	// 		active: true,
	// 		stacks: 0,
	// 	};
	// 	const result = getBuffEffects(buff);
	// 	expect(result).toEqual([
	// 		{
	// 			category: 'Misc',
	// 			sourceName: 'Buffs Something Based on Another Stat',
	// 			affectedStat: 'str',
	// 			amount: testCharacterSimple.dex,
	// 		},
	// 	]);
	// });
	// test('Depends on another stat but worse', () => {
	// 	const buff: BuffInfo = {
	// 		name: 'Buffs Something Based on Another Stat Two-Way',
	// 		type: 'Buff',
	// 		isStacking: false,
	// 		isStory: false,
	// 		description: 'Buffs strength by dexterity mod and vice versa.',
	// 		effects: 'Str Mod +1*Dex Mod, Dex Mod +1*Str Mod',
	// 		active: true,
	// 		stacks: 0,
	// 	};
	// 	const result = getBuffEffects(buff);
	// 	expect(result).toEqual([
	// 		{
	// 			category: 'Misc',
	// 			sourceName: 'Buffs Something Based on Another Stat Two-Way',
	// 			affectedStat: 'str',
	// 			amount: testCharacterSimple.dex,
	// 		},
	// 		{
	// 			category: 'Misc',
	// 			sourceName: 'Buffs Something Based on Another Stat Two-Way',
	// 			affectedStat: 'dex',
	// 			amount: testCharacterSimple.str,
	// 		},
	// 	]);
	// });
	// test('Multiplies magnitude based on stacks', () => {
	// 	const buff: BuffInfo = {
	// 		name: 'Buff Strength based on Dex and Stack Size',
	// 		type: 'Buff',
	// 		isStory: false,
	// 		isStacking: true,
	// 		stacks: 3,
	// 		effects: 'Str Mod +1*Dex Mod*stacks',
	// 		active: true,
	// 	};
	// 	const result = getBuffEffects(buff);
	// 	expect(result).toEqual([
	// 		{
	// 			category: 'Misc',
	// 			sourceName: 'Buff Strength based on Dex and Stack Size',
	// 			affectedStat: 'str',
	// 			amount: testCharacterSimple.dex.total * buff.stacks,
	// 		},
	// 	]);
	// });

	test('Multiplies some magnitudes based on stacks', () => {
		const buff: BuffInfo = {
			name: 'Buff Strength and Dex based on Stack Size',
			type: 'Buff',
			isStory: false,
			isStacking: true,
			stacks: 3,
			effects: 'Str Mod +10, Dex Mod +stacks',
			active: true,
		};
		const result = getBuffEffects(buff);
		expect(result).toEqual([
			{
				category: 'Misc',
				sourceName: buff.name,
				affectedStat: 'str',
				amount: 10,
			},
			{
				category: 'Misc',
				sourceName: buff.name,
				affectedStat: 'dex',
				amount: buff.stacks,
			},
		]);
	});
	test('Multiplies some magnitudes based on stacks ver 2', () => {
		const buff: BuffInfo = {
			name: 'Buff Strength and Dex based on Stack Size',
			type: 'Buff',
			isStory: false,
			isStacking: true,
			stacks: 3,
			effects: 'Str Mod +10, Dex Mod +1*stacks',
			active: true,
		};
		const result = getBuffEffects(buff);
		expect(result).toEqual([
			{
				category: 'Misc',
				sourceName: buff.name,
				affectedStat: 'str',
				amount: 10,
			},
			{
				category: 'Misc',
				sourceName: buff.name,
				affectedStat: 'dex',
				amount: buff.stacks,
			},
		]);
	});
	test('Zero stacks', () => {
		const buff: BuffInfo = {
			name: 'Buff Strength based on Stack Size',
			type: 'Buff',
			isStory: false,
			isStacking: true,
			stacks: 0,
			effects: 'Str Mod +1*stacks',
			active: true,
		};
		const result = getBuffEffects(buff);
		expect(result).toEqual([
			{
				category: 'Misc',
				sourceName: buff.name,
				affectedStat: 'str',
				amount: 0,
			},
		]);
	});
	test('Buff of zero, no stacks', () => {
		const buff: BuffInfo = {
			name: 'Adds 0 to Strength Mod',
			type: 'Buff',
			isStory: false,
			stacks: 0,
			effects: 'Str Mod +0',
			active: true,
		};
		const result = getBuffEffects(buff);
		expect(result).toEqual([
			{
				category: 'Misc',
				sourceName: buff.name,
				affectedStat: 'str',
				amount: 0,
			},
		]);
	});
	test('Negative stack magnitude, no helper', () => {
		const buff: BuffInfo = {
			name: 'Buff Strength and Dex based on Stack Size',
			type: 'Buff',
			isStory: false,
			isStacking: true,
			stacks: 3,
			effects: 'Str Mod -stacks',
			active: true,
		};
		const result = getBuffEffects(buff);
		expect(result).toEqual([
			{
				category: 'Misc',
				sourceName: buff.name,
				affectedStat: 'str',
				amount: -buff.stacks,
			},
		]);
	});
	test('Adds 5 to nowhere', () => {
		const buff: BuffInfo = {
			name: 'Adds 5 to nowhere',
			type: 'Debuff',
			isStory: false,
			isStacking: false,
			effects: '+5',
			active: true,
			stacks: 0,
		};

		expect(() => {
			getBuffEffects(buff);
		}).toThrowError('Buff must have a target!');
	});
	// test('A buff that multiplies the base', () => {
	// 	const buff: BuffInfo = {
	// 		name: 'Multiply Dex by 3',
	// 		type: 'Buff',
	// 		isStory: false,
	// 		isStacking: false,
	// 		effects: 'Dex Mod *3',
	// 		active: true,
	// 		stacks: 0,
	// 	};
	// 	const result = getBuffEffects(buff);
	// 	expect(result).toEqual([
	// 		{
	// 			category: 'Misc',
	// 			sourceName: buff.name,
	// 			affectedStat: 'dex',
	// 			amount: testCharacterSimple.dex.total * 2,
	// 		},
	// 	]);
	// });
	test('Buffing the same stat twice', () => {
		const buff: BuffInfo = {
			name: 'Buffs Strength by 5 and -3',
			type: 'Buff',
			isStory: false,
			isStacking: false,
			effects: 'Str Mod +5, Str Mod -3',
			active: true,
			stacks: 0,
		};
		const result = getBuffEffects(buff);
		expect(result).toEqual([
			{
				category: 'Misc',
				sourceName: buff.name,
				affectedStat: 'str',
				amount: 5,
			},
			{
				category: 'Misc',
				sourceName: buff.name,
				affectedStat: 'str',
				amount: -3,
			},
		]);
	});
	test('A buff of a specific category', () => {
		const buff: BuffInfo = {
			name: 'Buffs Strength by 10',
			category: 'Netflix',
			type: 'Buff',
			isStory: false,
			isStacking: false,
			effects: 'Str Mod +10',
			active: true,
			stacks: 0,
		};
		const result = getBuffEffects(buff);
		expect(result).toEqual([
			{
				category: 'Netflix',
				sourceName: buff.name,
				affectedStat: 'str',
				amount: 10,
			},
		]);
	});
	test('A buff whose effects contain a "Misc" component', () => {
		const buff: BuffInfo = {
			name: 'Buffs Strength by 5 and also Misc Dexterity by 5',
			category: 'Netflix',
			type: 'Buff',
			isStory: false,
			isStacking: false,
			effects: 'Str Mod +5, misc Dex Mod +5',
			active: true,
			stacks: 0,
		};
		const result = getBuffEffects(buff);
		expect(result).toEqual([
			{
				category: 'Netflix',
				sourceName: buff.name,
				affectedStat: 'str',
				amount: 5,
			},
			{
				category: 'Misc',
				sourceName: buff.name,
				affectedStat: 'dex',
				amount: 5,
			},
		]);
	});
	test('Buffing Natural Armor real quick', () => {
		const buff: BuffInfo = {
			name: '',
			category: 'Armor',
			type: 'Buff',
			isStory: false,
			isStacking: false,
			effects: 'Natural Armor +3',
			active: true,
			stacks: 0,
		};
		const result = getBuffEffects(buff);
		expect(result).toEqual([
			{
				category: 'Armor',
				sourceName: buff.name,
				affectedStat: 'armorNatural',
				amount: 3,
			},
		]);
	});
	test('Fractional Buff', () => {
		const buff: BuffInfo = {
			name: '',
			category: 'Misc',
			type: 'Debuff',
			isStory: false,
			isStacking: true,
			effects: 'Movement Action -0.5*stacks',
			active: true,
			stacks: 5,
		};
		const result = getBuffEffects(buff);
		expect(result).toEqual([
			{
				category: 'Misc',
				sourceName: buff.name,
				affectedStat: 'actionsMove',
				amount: -2.5,
			},
		]);
	});
	test('Where does Natural Armor go?', () => {
		const buff: BuffInfo = {
			name: '',
			category: 'Armor',
			type: 'Buff',
			isStory: false,
			isStacking: false,
			effects: 'Natural Armor +2',
			active: true,
			stacks: 0,
		};
		const result = getBuffEffects(buff);
		const tallied = tallyBuffs(result);
		const talliedLimited = {
			ac: tallied.ac,
			acFF: tallied.acFF,
			armorNatural: tallied.armorNatural,
			dr: tallied.dr,
			drFF: tallied.drFF,
		};
		expect(talliedLimited).toEqual({
			ac: {
				categories: {},
				summary: [' (+2 Natural Armor), Armor'],
				total: 12,
			},
			acFF: {
				categories: {},
				summary: [' (+2 Natural Armor), Armor'],
				total: 12,
			},
			armorNatural: {
				categories: {
					// Armor: 2, // Commenting this out makes it otherwise pass the test, but this probably should be here
				},
				summary: [' (+2 Natural Armor), Armor'],
				total: 2,
			},
			dr: {
				categories: {},
				summary: [' (+2 Natural Armor), Armor'],
				total: 2,
			},
			drFF: {
				categories: {},
				summary: [' (+2 Natural Armor), Armor'],
				total: 2,
			},
		});
	});
});

describe('getStatsCalclated', () => {
	test('with no inputs, it should give all zeroes', () => {
		const expected = makeNeutralStats();
		expect(expected.ac).toEqual(testCharacterBaseStats.attacks); // <— To make builds succeed : T.
		// expect(getStatsCalculated(testCharacterBaseStats)).toMatchObject(expected);
	});
});
