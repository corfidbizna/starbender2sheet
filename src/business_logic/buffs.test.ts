import { describe, test, expect } from 'vitest';
import { type CharacterStats } from '@/composables/useCharacterData';
import { getBuffEffects, type BuffInfo } from './buffs';

const testCharacterSimple: CharacterStats = {
	str: 6,
	dex: 10,
	con: 7,
	int: 1,
	wis: 0,
	cha: 4,
	strScore: 22,
	dexScore: 30,
	conScore: 24,
	intScore: 12,
	wisScore: 10,
	chaScore: 18,
	cpl: 7,
	weight: 190,
	hp: 100,
	skill: 10,
	fort: 10,
	ref: 10,
	wil: 10,
	bab: 10,
	bdb: 10,
	ac: 10,
	acTouch: 10,
	acFF: 10,
	acTFF: 10,
	dr: 10,
	drFF: 10,
	attackMelee: 10,
	attackUnarmed: 10,
	attackRanged: 10,
	attackPrecision: 10,
	size: 10,
	reach: 10,
	moveDist: 10,
	weightCurrent: 10,
	weightCapacity: 10,
	encumbered: 10,
	actionAttacks: 10,
	actionReactions: 10,
	actionMoves: 10,
	eSuper: 10,
	eMelee: 10,
	eGrenade: 10,
	eClass: 10,
	eUniversal: 10,
};

describe('Behaviors of getBuffEffects', () => {
	test('A buff wilth no effects', () => {
		const buff: BuffInfo = {
			name: 'Cool sunglasses',
			type: 'Buff',
			description: 'Makes you look cool',
		};
		const result = getBuffEffects(buff, testCharacterSimple);
		expect(result).toEqual([]);
	});
	test('The simplest strength stat boost', () => {
		const buff: BuffInfo = {
			name: 'Buff Strength',
			type: 'Buff',
			isStacking: false,
			description: 'Buffs strength by 5.',
			effects: 'str +5',
		};
		const result = getBuffEffects(buff, testCharacterSimple);
		expect(result).toEqual([
			{
				source: 'Buff Strength',
				effectedStat: 'str',
				amount: 5,
			},
		]);
	});
	test('The two-stat reducer', () => {
		const buff: BuffInfo = {
			name: 'Debuff Strength & Dexterity',
			type: 'Debuff',
			isStacking: false,
			description: 'Debuffs strength and dexterity.',
			effects: 'str -5, dex -7',
		};
		const result = getBuffEffects(buff, testCharacterSimple);
		expect(result).toEqual([
			{
				source: 'Debuff Strength & Dexterity',
				effectedStat: 'str',
				amount: -5,
			},
			{
				source: 'Debuff Strength & Dexterity',
				effectedStat: 'dex',
				amount: -7,
			},
		]);
	});
	test('Depends on another stat', () => {
		const buff: BuffInfo = {
			name: 'Buffs Something Based on Another Stat',
			type: 'Buff',
			isStacking: false,
			description: 'Buffs strength by dexterity mod.',
			effects: 'str +1*dex',
		};
		const result = getBuffEffects(buff, testCharacterSimple);
		expect(result).toEqual([
			{
				source: 'Buffs Something Based on Another Stat',
				effectedStat: 'str',
				amount: testCharacterSimple.dex,
			},
		]);
	});
	test('Depends on another stat but worse', () => {
		const buff: BuffInfo = {
			name: 'Buffs Something Based on Another Stat Two-Way',
			type: 'Buff',
			isStacking: false,
			description: 'Buffs strength by dexterity mod and vice versa.',
			effects: 'str +1*dex, dex +1*str',
		};
		const result = getBuffEffects(buff, testCharacterSimple);
		expect(result).toEqual([
			{
				source: 'Buffs Something Based on Another Stat Two-Way',
				effectedStat: 'str',
				amount: testCharacterSimple.dex,
			},
			{
				source: 'Buffs Something Based on Another Stat Two-Way',
				effectedStat: 'dex',
				amount: testCharacterSimple.str,
			},
		]);
	});
	test('Multiplies magnitude based on stacks', () => {
		const buff: BuffInfo = {
			name: 'Buff Strength based on Dex and Stack Size',
			type: 'Buff',
			isStacking: true,
			stacks: 3,
			effects: 'str +1*dex*stacks',
		};
		const result = getBuffEffects(buff, testCharacterSimple);
		expect(result).toEqual([
			{
				source: 'Buff Strength based on Dex and Stack Size',
				effectedStat: 'str',
				amount: testCharacterSimple.dex * (buff.stacks || 1),
			},
		]);
	});
	test('Multiplies some magnitudes based on stacks', () => {
		const buff: BuffInfo = {
			name: 'Buff Strength and Dex based on Stack Size',
			type: 'Buff',
			isStacking: true,
			stacks: 3,
			effects: 'str +10, dex +stacks',
		};
		const result = getBuffEffects(buff, testCharacterSimple);
		expect(result).toEqual([
			{
				source: buff.name,
				effectedStat: 'str',
				amount: 10,
			},
			{
				source: buff.name,
				effectedStat: 'dex',
				amount: buff.stacks || 0,
			},
		]);
	});
	test('Multiplies some magnitudes based on stacks ver 2', () => {
		const buff: BuffInfo = {
			name: 'Buff Strength and Dex based on Stack Size',
			type: 'Buff',
			isStacking: true,
			stacks: 3,
			effects: 'str +10, dex +1*stacks',
		};
		const result = getBuffEffects(buff, testCharacterSimple);
		expect(result).toEqual([
			{
				source: buff.name,
				effectedStat: 'str',
				amount: 10,
			},
			{
				source: buff.name,
				effectedStat: 'dex',
				amount: buff.stacks || 0,
			},
		]);
	});
	test('Negative stack magnitude, no helper', () => {
		const buff: BuffInfo = {
			name: 'Buff Strength and Dex based on Stack Size',
			type: 'Buff',
			isStacking: true,
			stacks: 3,
			effects: 'str -stacks',
		};
		const result = getBuffEffects(buff, testCharacterSimple);
		expect(result).toEqual([
			{
				source: buff.name,
				effectedStat: 'str',
				amount: -(buff.stacks || 0),
			},
		]);
	});
	test('Adds 5 to nowhere', () => {
		const buff: BuffInfo = {
			name: 'Adds 5 to nowhere',
			type: 'Debuff',
			isStacking: false,
			effects: '+5',
		};

		expect(() => {
			getBuffEffects(buff, testCharacterSimple);
		}).toThrowError('Buff must have a target!');
	});
	test('A buff that multiplies the base', () => {
		const buff: BuffInfo = {
			name: 'Multiply Dex by 3',
			type: 'Buff',
			isStacking: false,
			effects: 'dex *3',
		};
		const result = getBuffEffects(buff, testCharacterSimple);
		expect(result).toEqual([
			{
				source: buff.name,
				effectedStat: 'dex',
				amount: testCharacterSimple.dex * 2,
			},
		]);
	});
	test('Buffing the same stat twice', () => {
		const buff: BuffInfo = {
			name: 'Buffs Strength by 5 and -3',
			type: 'Buff',
			isStacking: false,
			effects: 'str +5, str -3',
		};
		const result = getBuffEffects(buff, testCharacterSimple);
		expect(result).toEqual([
			{
				source: buff.name,
				effectedStat: 'str',
				amount: 5,
			},
			{
				source: buff.name,
				effectedStat: 'str',
				amount: -3,
			},
		]);
	});
});
