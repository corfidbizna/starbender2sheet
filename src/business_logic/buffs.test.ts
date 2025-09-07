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
});
