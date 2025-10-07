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
		const formula = new DiceFormula('1d6');
		for (let i = 0; i < 20; ++i) {
			const result = formula.roll(getStat);
			expect(result).toBeGreaterThanOrEqual(1);
			expect(result).toBeLessThanOrEqual(6);
			expect(result).toEqual(Math.floor(result));
		}
	});
	test('d6', () => {
		const formula = new DiceFormula('d6');
		for (let i = 0; i < 20; ++i) {
			const result = formula.roll(getStat);
			expect(result).toBeGreaterThanOrEqual(1);
			expect(result).toBeLessThanOrEqual(6);
			expect(result).toEqual(Math.floor(result));
		}
	});
	test('4d8+6', () => {
		const formula = new DiceFormula('4d8+6');
		for (let i = 0; i < 200; ++i) {
			const result = formula.roll(getStat);
			expect(result).toBeGreaterThanOrEqual(10);
			expect(result).toBeLessThanOrEqual(38);
			expect(result).toEqual(Math.floor(result));
		}
	});
	test('1d20*8', () => {
		const formula = new DiceFormula('1d20*8');
		for (let i = 0; i < 200; ++i) {
			const result = formula.roll(getStat);
			expect(result).toBeGreaterThanOrEqual(8);
			expect(result).toBeLessThanOrEqual(160);
			expect(result).toEqual(Math.floor(result));
		}
	});
	test('10', () => {
		const formula = new DiceFormula('10');
		const result = formula.roll(getStat);
		expect(result).toEqual(10);
		expect(result).toEqual(Math.floor(result));
	});
	test('3D6+Str Mod', () => {
		const formula = new DiceFormula('3D6+Str Mod');
		for (let i = 0; i < 20; ++i) {
			const result = formula.roll(getStat);
			expect(result).toBeGreaterThanOrEqual(13);
			expect(result).toBeLessThanOrEqual(28);
			expect(result).toEqual(Math.floor(result));
		}
	});
	test('3D6+2*Str Mod, min', () => {
		const formula = new DiceFormula('3D6+2*Str Mod');
		expect(formula.min(getStat)).toEqual(23);
	});
	test('4d8+8*Str Mod+Dex Mod', () => {
		const formula = new DiceFormula('4d8+8*Str Mod+Dex Mod');
		for (let i = 0; i < 100; ++i) {
			const result = formula.roll(getStat);
			expect(result).toBeGreaterThanOrEqual(94);
			expect(result).toBeLessThanOrEqual(122);
			expect(result).toEqual(Math.floor(result));
		}
	});
	test('2d20+2d12', () => {
		const formula = new DiceFormula('2d20+2d12');
		for (let i = 0; i < 200; ++i) {
			const result = formula.roll(getStat);
			expect(result).toBeGreaterThanOrEqual(4);
			expect(result).toBeLessThanOrEqual(64);
			expect(result).toEqual(Math.floor(result));
		}
	});
	test('d20+5(d6-1)', () => {
		const formula = new DiceFormula('d20+5(d6-1)');
		for (let i = 0; i < 200; ++i) {
			const result = formula.roll(getStat);
			expect(result).toBeGreaterThanOrEqual(1);
			expect(result).toBeLessThanOrEqual(45);
			expect(result).toEqual(Math.floor(result));
		}
	});
	test('d20+5*(d6-1)', () => {
		const formula = new DiceFormula('d20+5*(d6-1)');
		for (let i = 0; i < 200; ++i) {
			const result = formula.roll(getStat);
			expect(result).toBeGreaterThanOrEqual(1);
			expect(result).toBeLessThanOrEqual(45);
			expect(result).toEqual(Math.floor(result));
		}
	});
	test('d6+Str Mod(d4)', () => {
		const formula = new DiceFormula('d6+Str Mod(d4)');
		for (let i = 0; i < 200; ++i) {
			const result = formula.roll(getStat);
			expect(result).toBeGreaterThanOrEqual(11);
			expect(result).toBeLessThanOrEqual(46);
			expect(result).toEqual(Math.floor(result));
		}
	});
	test('d6+dex mod', () => {
		const formula = new DiceFormula('d6+dex mod');
		for (let i = 0; i < 200; ++i) {
			const result = formula.roll(getStat);
			expect(result).toBeGreaterThanOrEqual(11);
			expect(result).toBeLessThanOrEqual(17);
			expect(result).toEqual(Math.floor(result));
		}
	});
	test('4d8 + 4 * Str Mod', () => {
		const formula = new DiceFormula('4d8 + 4 * Str Mod');
		for (let i = 0; i < 200; ++i) {
			const result = formula.roll(getStat);
			expect(result).toBeGreaterThanOrEqual(44);
			expect(result).toBeLessThanOrEqual(72);
			expect(result).toEqual(Math.floor(result));
		}
	});
	test('10d20*100', () => {
		const formula = new DiceFormula('10d20*100');
		const result = formula.min(getStat);
		expect(result).toEqual(1000);
	});
	test('10d20*100', () => {
		const formula = new DiceFormula('10d20*100');
		const result = formula.max(getStat);
		expect(result).toEqual(20000);
	});
	test('10d20*100', () => {
		const formula = new DiceFormula('10d20*100');
		const result = formula.mean(getStat);
		expect(result).toEqual(10500);
	});
	test('10', () => {
		const formula = new DiceFormula('10');
		const result = formula.min(getStat);
		expect(result).toEqual(10);
	});
	test('10', () => {
		const formula = new DiceFormula('10');
		const result = formula.max(getStat);
		expect(result).toEqual(10);
	});
	test('10', () => {
		const formula = new DiceFormula('10');
		const result = formula.mean(getStat);
		expect(result).toEqual(10);
	});
	test('AC', () => {
		const formula = new DiceFormula('AC');
		const result = formula.roll(getStat);
		expect(result).toEqual(20);
	});
	test('Str Mod + Dex Mod', () => {
		const formula = new DiceFormula('Str Mod + Dex Mod');
		const result = formula.roll(getStat);
		expect(result).toEqual(20);
	});
	test('Str Mod + Dex Mod', () => {
		const formula = new DiceFormula('Str Mod + Dex Mod');
		const result = formula.min(getStat);
		expect(result).toEqual(20);
	});
	test('Watermelon', () => {
		const formula = new DiceFormula('Watermelon');
		expect(() => {
			return formula.roll(getStat);
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
		const result = formula.roll(getStat);
		expect(result).toBeGreaterThanOrEqual(1);
		expect(result).toBeLessThanOrEqual(100);
		expect(result).toEqual(Math.floor(result));
	});
	test('kill the parents', () => {
		const formula = new DiceFormula('(5+5+5+10*20+30)*40');
		const reformula = formula.stringify();
		expect(reformula).toEqual('(5+5+5+10*20+30)*40');
	});
	test('kill the parents 2: homer aloner', () => {
		const formula = new DiceFormula('(5(5)+5+5+10*20+30)*40');
		const reformula = formula.stringify();
		expect(reformula).toEqual('(5(5)+5+5+10*20+30)*40');
	});
	test('kill the parents 3: parensistence', () => {
		const formula = new DiceFormula('(((((((3+3))))+3)))');
		const reformula = formula.stringify();
		expect(reformula).toEqual('3+3+3');
	});
	test('Evaluate stat correctly?', () => {
		const formula = new DiceFormula('1d6+Str Mod');
		const reformula = formula.evaluateExceptDice(getStat).stringify();
		expect(reformula).toEqual('1d6+10');
	});
	test('Evaluate repetition correctly?', () => {
		const formula = new DiceFormula('2(1+4)');
		const reformula = formula.evaluateExceptDice(getStat).stringify();
		expect(reformula).toEqual('10');
	});
	test('Evaluate repetition correctly?', () => {
		const formula = new DiceFormula('2(1d4)');
		const reformula = formula.evaluateExceptDice(getStat).stringify();
		expect(reformula).toEqual('2(1d4)');
	});
	test('Evaluate binary operation correctly?', () => {
		const formula = new DiceFormula('1d4+(2*2)');
		const reformula = formula.evaluateExceptDice(getStat).stringify();
		expect(reformula).toEqual('1d4+4');
	});
	test('Strings of additions', () => {
		const formula = new DiceFormula('1d4+4+15');
		const reformula = formula.evaluateExceptDice(getStat).stringify();
		expect(reformula).toEqual('1d4+19');
	});
	test('4d8+8*Str Mod+Dex Mod', () => {
		const formula = new DiceFormula('4d8+8*Str Mod+Dex Mod');
		const evaluated = formula.evaluateExceptDice(getStat).stringify();
		expect(evaluated).toEqual('4d8+90');
	});
	test('Strings of raw additions', () => {
		const formula = new DiceFormula('5+5+5');
		const reformula = formula.evaluateExceptDice(getStat).stringify();
		expect(reformula).toEqual('15');
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
