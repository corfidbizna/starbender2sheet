import { describe, test, expect } from 'vitest';
import { type StatsCalculated } from '@/composables/useCharacterData';
import { DiceFormula, getStatByCharacter } from './diceFormula';

const testCharacterSimple: Partial<StatsCalculated> = {
	actionsMoveLand: 10,
	ac: 20,
	str: 10,
	dex: 10,
	con: 10,
	int: 10,
	wis: 10,
	cha: 10,
	rolls: 10,
};

const getStat = getStatByCharacter(testCharacterSimple);

describe('Dice Formula Stuff', () => {
	test('1d6', () => {
		const forumla = new DiceFormula('1d6');
		for (let i = 0; i < 20; ++i) {
			const result = forumla.roll(() => 0);
			expect(result).toBeGreaterThanOrEqual(1);
			expect(result).toBeLessThanOrEqual(6);
			expect(result).toEqual(Math.floor(result));
		}
	});
	test('d6', () => {
		const forumla = new DiceFormula('d6');
		for (let i = 0; i < 20; ++i) {
			const result = forumla.roll(() => 0);
			expect(result).toBeGreaterThanOrEqual(1);
			expect(result).toBeLessThanOrEqual(6);
			expect(result).toEqual(Math.floor(result));
		}
	});
	test('4d8+6', () => {
		const forumla = new DiceFormula('4d8+6');
		for (let i = 0; i < 200; ++i) {
			const result = forumla.roll(() => 0);
			expect(result).toBeGreaterThanOrEqual(10);
			expect(result).toBeLessThanOrEqual(38);
			expect(result).toEqual(Math.floor(result));
		}
	});
	test('1d20*8', () => {
		const forumla = new DiceFormula('1d20*8');
		for (let i = 0; i < 200; ++i) {
			const result = forumla.roll(() => 0);
			expect(result).toBeGreaterThanOrEqual(8);
			expect(result).toBeLessThanOrEqual(160);
			expect(result).toEqual(Math.floor(result));
		}
	});
	test('10', () => {
		const forumla = new DiceFormula('10');
		const result = forumla.roll(() => 0);
		expect(result).toEqual(10);
		expect(result).toEqual(Math.floor(result));
	});
	test('3D6+Str Mod', () => {
		const forumla = new DiceFormula('3D6+Str Mod');
		for (let i = 0; i < 20; ++i) {
			const result = forumla.roll(getStat);
			expect(result).toBeGreaterThanOrEqual(13);
			expect(result).toBeLessThanOrEqual(28);
			expect(result).toEqual(Math.floor(result));
		}
	});
	test('4d8+8*Str Mod+Dex Mod', () => {
		const forumla = new DiceFormula('4d8+8*Str Mod+Dex Mod');
		for (let i = 0; i < 100; ++i) {
			const result = forumla.roll(getStat);
			expect(result).toBeGreaterThanOrEqual(94);
			expect(result).toBeLessThanOrEqual(122);
			expect(result).toEqual(Math.floor(result));
		}
	});
	test('2d20+2d12', () => {
		const forumla = new DiceFormula('2d20+2d12');
		for (let i = 0; i < 200; ++i) {
			const result = forumla.roll(() => 0);
			expect(result).toBeGreaterThanOrEqual(4);
			expect(result).toBeLessThanOrEqual(64);
			expect(result).toEqual(Math.floor(result));
		}
	});
	test('d20+5(d6-1)', () => {
		const forumla = new DiceFormula('d20+5(d6-1)');
		for (let i = 0; i < 200; ++i) {
			const result = forumla.roll(() => 0);
			expect(result).toBeGreaterThanOrEqual(1);
			expect(result).toBeLessThanOrEqual(45);
			expect(result).toEqual(Math.floor(result));
		}
	});
	test('d20+5*(d6-1)', () => {
		const forumla = new DiceFormula('d20+5*(d6-1)');
		for (let i = 0; i < 200; ++i) {
			const result = forumla.roll(() => 0);
			expect(result).toBeGreaterThanOrEqual(1);
			expect(result).toBeLessThanOrEqual(45);
			expect(result).toEqual(Math.floor(result));
		}
	});
	test('d6+Str Mod(d4)', () => {
		const forumla = new DiceFormula('d6+Str Mod(d4)');
		for (let i = 0; i < 200; ++i) {
			const result = forumla.roll(getStat);
			expect(result).toBeGreaterThanOrEqual(11);
			expect(result).toBeLessThanOrEqual(46);
			expect(result).toEqual(Math.floor(result));
		}
	});
	test('d6+dex mod', () => {
		const forumla = new DiceFormula('d6+dex mod');
		for (let i = 0; i < 200; ++i) {
			const result = forumla.roll(getStat);
			expect(result).toBeGreaterThanOrEqual(11);
			expect(result).toBeLessThanOrEqual(17);
			expect(result).toEqual(Math.floor(result));
		}
	});
	test('4d8 + 4 * Str Mod', () => {
		const forumla = new DiceFormula('4d8 + 4 * Str Mod');
		for (let i = 0; i < 200; ++i) {
			const result = forumla.roll(getStat);
			expect(result).toBeGreaterThanOrEqual(44);
			expect(result).toBeLessThanOrEqual(72);
			expect(result).toEqual(Math.floor(result));
		}
	});
	test('10d20*100', () => {
		const forumla = new DiceFormula('10d20*100');
		const result = forumla.min(() => 0);
		expect(result).toEqual(1000);
	});
	test('10d20*100', () => {
		const forumla = new DiceFormula('10d20*100');
		const result = forumla.max(() => 0);
		expect(result).toEqual(20000);
	});
	test('10d20*100', () => {
		const forumla = new DiceFormula('10d20*100');
		const result = forumla.mean(() => 0);
		expect(result).toEqual(10500);
	});
	test('10', () => {
		const forumla = new DiceFormula('10');
		const result = forumla.min(() => 0);
		expect(result).toEqual(10);
	});
	test('10', () => {
		const forumla = new DiceFormula('10');
		const result = forumla.max(() => 0);
		expect(result).toEqual(10);
	});
	test('10', () => {
		const forumla = new DiceFormula('10');
		const result = forumla.mean(() => 0);
		expect(result).toEqual(10);
	});
	test('AC', () => {
		const forumla = new DiceFormula('AC');
		const result = forumla.roll(getStat);
		expect(result).toEqual(20);
	});
	test('Str Mod + Dex Mod', () => {
		const forumla = new DiceFormula('Str Mod + Dex Mod');
		const result = forumla.roll(getStat);
		expect(result).toEqual(20);
	});
	test('Str Mod + Dex Mod', () => {
		const forumla = new DiceFormula('Str Mod + Dex Mod');
		const result = forumla.min(getStat);
		expect(result).toEqual(20);
	});
	test('Watermelon', () => {
		const forumla = new DiceFormula('Watermelon');
		expect(() => {
			return forumla.roll(getStat);
		}).toThrowError();
	});
	test('1d10d10', () => {
		// Die roll followed directly by a stat
		expect(() => {
			new DiceFormula('1d10d10');
		}).toThrowError();
	});
	test('(1d10)d10', () => {
		// Stray die roll
		expect(() => {
			new DiceFormula('(1d10)d10');
		}).toThrowError();
	});
	test('1d10(d10)', () => {
		const formula = new DiceFormula('1d10(d10)');
		const result = formula.roll(() => 0);
		expect(result).toBeGreaterThanOrEqual(1);
		expect(result).toBeLessThanOrEqual(100);
		expect(result).toEqual(Math.floor(result));
	});
	// test('1d6+Move (Base Land)', () => {
	// 	// This has a stat with parenthesis in the name,
	// 	// meaning it thinks 'Move' is a repetition and 'Base Land' is the thing inside
	// 	// leading to an incorrect result : T.
	// 	const formula = new DiceFormula('1d6+Move (Base Land)');
	// 	expect(formula).toEqual({
	// 		lhs: { sides: 6, count: 1 },
	// 		operator: '+',
	// 		rhs: { count: { name: 'Move' }, wat: { name: 'Base Land' } },
	// 	});
	// 	// expect(formula).toEqual({
	// 	// 	lhs: { sides: 6, count: 1 },
	// 	// 	operator: '+',
	// 	// 	rhs: { name: 'Move (Base Land)' },
	// 	// });
	// });
});
