import type { Stats } from './buffs';

type DiceFormula = {
	quantity: number;
	faceCount: number;
	additional: number;
	multiplier: number;
};

const parseDiceFormula = (formula: string, stats?: Stats): DiceFormula => {
	// Example formulas:
	// 1d20
	// 4d8+6
	// 10
	// 3D6+Str Mod
	// 4d8+8*Str Mod+Dex Mod
	// 2d20+2d12
	// d20+5(d6-1)
	// d6+Str Mod(d4)
	const result = {
		//                2d8+8*Str Mod
		quantity: 0, //   ^ ^ ^    ^
		faceCount: 0, //  __/ |    |
		additional: 0, // ____/    /
		multiplier: 1, // ________/
	};
	if (!isNaN(parseInt(formula))) {
		// If the formula is just a number...
		result.additional = parseInt(formula);
		return result;
	}
	const parsed = formula.replace('D', 'd').replace('+', '¶').replace('-', '¶-').split('¶');
	if (parsed.length === 1) {
		const current = parsed[0];
		// If the formula split on ¶ only has one component...
		if (/[0-9]?d[0-9]?/.test(current)) {
			// ...see if it matches the 'XdN' pattern.
			const dice = current.split('d');
			result.quantity = parseInt(dice[0]);
			result.faceCount = parseInt(dice[1]);
		} else {
			// Otherwise it's not a dice pattern.
			if (isNaN(parseInt(current))) {
				// If it's just a number by itself, then we're fine.
				result.additional = parseInt(current);
			} else {
				// Otherwise, we're in a little bit of trouble now >_<
				//
				// Basically, the "additional" statement now might look like something like '-2*Str Mod'
				// or it might look like '+10+Str Mod' or ' + Str Mod + Dex Mod' or maybe even like '+Str Mod+Dex Mod'
				// What I want to do is find any instance of a key in AllBuffableStats and replace that with the stat.
				// Then I can just parse it as math from there.
			}
		}
	}
	return result;
};

const getAverage = (formula: DiceFormula): number => {
	return 0;
};
const getMin = (formula: DiceFormula): number => {
	return 0;
};
const getMax = (formula: DiceFormula): number => {
	return 0;
};

const rollDice = (formula: DiceFormula): number => {
	return 0;
};
