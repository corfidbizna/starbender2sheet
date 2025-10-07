// Example formulas:
// d20
// 1d20
// 4d8+6
// 10
// 3D6+Str Mod
// 4d8+8*Str Mod+Dex Mod
// 2d20+2d12
// d20+5(d6-1) // does the roll 5 times
// d20+5*(d6-1) // multiplies one roll by 5
// d6+Str Mod(d4)
// d6+dex mod
// 4d8 + 4 * Str Mod

import {
	labelToStatName,
	type StatsCalculated,
	type StatsCalculatedKey,
} from '@/composables/useCharacterData';

// What is a dice formula?
// FORMULA ::= ELEMENT [OPERATOR ELEMENT]*
// OPERATOR ::= `+` | `-` | `*`
// ELEMENT ::= UNIT | REPETITION
// UNIT ::= DIEROLL | NUMBER | STAT | GROUP
// REPETITION ::= UNIT GROUP
// GROUP ::= `(` FORMULA `)`
// DIEROLL ::= /([0-9]*)[dD]([0-9]+)/
// NUMBER ::= /([0-9]+)/
// STAT ::= /[A-Za-z][ A-Za-z]*/

const isOperator = (ch: string) => /^[-+*]$/.test(ch);
const isDigit = (ch: string) => /^[0-9]$/.test(ch);
const isD = (ch: string) => /^[dD]$/.test(ch);
const isLetter = (ch: string) => /^[A-Za-z]$/.test(ch);
const isLetterOrSpace = (ch: string) => /^[A-Za-z ]$/.test(ch);

// A UnitNode is something that knows how to "become a number".
abstract class UnitNode {
	abstract evaluate(roller: (sides: number) => number, getStat: (name: string) => number): number;
	/// Returns a string that can be used to create a DiceFormula equivalent to
	/// this node (and any children it might have).
	abstract stringify(): string;
	/// Returns a version of this UnitNode (and any children it might have)
	/// where all nodes that do not involve a DierollNode have been evaluated
	/// and replaced with NumberNodes.
	abstract evaluateExceptDice(getStat: (name: string) => number): UnitNode;
	/// Returns true if this node, or any of its children, are a DierollNode.
	involvesDice(): boolean {
		return false;
	}
	static fromFormula(formula: any[]): UnitNode {
		console.assert(formula.length % 2 === 1);
		const nodes: UnitNode[] = [];
		for (let i = 0; i < formula.length; i += 2) {
			const raw = formula[i];
			console.assert(raw.type === 'unit');
			switch (raw.subtype) {
				case 'dieroll':
					nodes.push(new DierollNode(raw.numSides, raw.quantity));
					break;
				case 'number':
					nodes.push(new NumberNode(raw.theNumber));
					break;
				case 'stat':
					nodes.push(new StatNode(raw.statName));
					break;
				case 'group':
					nodes.push(UnitNode.fromFormula(raw.subformula));
					break;
				case 'repetition':
					nodes.push(
						new RepetitionNode(
							UnitNode.fromFormula([raw.count]),
							UnitNode.fromFormula(raw.subformula),
						),
					);
					break;
				default:
					throw new Error('INTERNAL ERROR: unknown subtype "' + raw.subtype + '"');
			}
		}
		const operators: Operator[] = [];
		for (let i = 1; i < formula.length; i += 2) {
			console.assert(formula[i].type === 'operator');
			operators.push(formula[i].op as Operator);
		}
		console.assert(operators.length === nodes.length - 1);
		while (nodes.length > 1) {
			let bestOpIndex = 0;
			let bestPrecedence = OPERATOR_PRIORITIES[operators[0]];
			for (let n = 1; n < operators.length; ++n) {
				const precedence = OPERATOR_PRIORITIES[operators[n]];
				if (precedence > bestPrecedence) {
					bestPrecedence = precedence;
					bestOpIndex = n;
				}
			}
			const [bestOp] = operators.splice(bestOpIndex, 1);
			const [lhs, rhs] = nodes.splice(bestOpIndex, 2);
			nodes.splice(bestOpIndex, 0, new BinaryOpNode(lhs, rhs, bestOp));
		}
		return nodes[0];
	}
}

class DierollNode extends UnitNode {
	sides: number;
	count: number;
	constructor(sides: number, count: number) {
		super(); // <— Calls the constructor of the parent class. Currently doesn't do anything, but _could_ do something.
		this.sides = sides;
		this.count = count;
	}
	evaluate(roller: (sides: number) => number): number {
		let result = 0;
		for (let n = 0; n < this.count; n++) {
			result += roller(this.sides);
		}
		return result;
	}
	stringify(): string {
		return this.count + 'd' + this.sides;
	}
	evaluateExceptDice(): UnitNode {
		return this;
	}
	involvesDice(): boolean {
		return true;
	}
}

class NumberNode extends UnitNode {
	value: number;
	constructor(value: number) {
		super();
		this.value = value;
	}
	evaluate(): number {
		return this.value;
	}
	stringify(): string {
		return this.value + '';
	}
	evaluateExceptDice(): UnitNode {
		return this;
	}
}

class StatNode extends UnitNode {
	name: string;
	constructor(name: string) {
		super();
		this.name = name;
	}
	evaluate(roller: (sides: number) => number, getStat: (name: string) => number): number {
		return getStat(this.name);
	}
	stringify(): string {
		return this.name;
	}
	evaluateExceptDice(getStat: (name: string) => number): UnitNode {
		return new NumberNode(getStat(this.name));
	}
}

const OPERATORS: Record<Operator, (lhs: number, rhs: number) => number> = {
	'+': (lhs: number, rhs: number) => lhs + rhs,
	'-': (lhs: number, rhs: number) => lhs - rhs,
	'*': (lhs: number, rhs: number) => lhs * rhs,
};
const OPERATOR_PRIORITIES: Record<Operator, number> = {
	'+': 0,
	'-': 0,
	'*': 1,
};
type Operator = '-' | '+' | '*';

class BinaryOpNode extends UnitNode {
	// Left Hand Side
	lhs: UnitNode;
	// Right Hand Side
	rhs: UnitNode;
	// the operator
	operator: Operator;
	constructor(lhs: UnitNode, rhs: UnitNode, operator: Operator) {
		super();
		this.lhs = lhs;
		this.rhs = rhs;
		this.operator = operator;
	}
	evaluate(roller: (sides: number) => number, getStat: (name: string) => number): number {
		const lhsValue = this.lhs.evaluate(roller, getStat);
		const rhsValue = this.rhs.evaluate(roller, getStat);
		const op = OPERATORS[this.operator];
		return op(lhsValue, rhsValue);
	}
	stringify(): string {
		let lhsString = this.lhs.stringify();
		let rhsString = this.rhs.stringify();
		// TODO: ask Meiko or Admiral the less clumsy way to do this
		if (this.lhs instanceof BinaryOpNode) {
			const lhsOp = this.lhs as BinaryOpNode;
			if (OPERATOR_PRIORITIES[lhsOp.operator] < OPERATOR_PRIORITIES[this.operator]) {
				lhsString = '(' + lhsString + ')';
			}
		}
		if (this.rhs instanceof BinaryOpNode) {
			const rhsOp = this.rhs as BinaryOpNode;
			if (OPERATOR_PRIORITIES[rhsOp.operator] < OPERATOR_PRIORITIES[this.operator]) {
				rhsString = '(' + rhsString + ')';
			}
		}
		return lhsString + this.operator + rhsString;
	}
	involvesDice(): boolean {
		return this.lhs.involvesDice() || this.rhs.involvesDice();
	}
	evaluateExceptDice(getStat: (name: string) => number): UnitNode {
		let newLHS: NumberNode | undefined;
		let newRHS: NumberNode | undefined;
		if (!this.lhs.involvesDice()) {
			newLHS = new NumberNode(this.lhs.evaluate(() => 0, getStat));
		}
		if (!this.rhs.involvesDice()) {
			newRHS = new NumberNode(this.rhs.evaluate(() => 0, getStat));
		}
		if (!this.involvesDice()) {
			return new NumberNode(
				this.evaluate(() => {
					throw new Error('UNREACHABLE');
				}, getStat),
			);
		} else {
			return new BinaryOpNode(newLHS || this.lhs, newRHS || this.rhs, this.operator);
		}
	}
}

class RepetitionNode extends UnitNode {
	count: UnitNode;
	wat: UnitNode;
	constructor(count: UnitNode, wat: UnitNode) {
		super();
		this.count = count;
		this.wat = wat;
	}
	evaluate(roller: (sides: number) => number, getStat: (name: string) => number): number {
		let count = this.count.evaluate(roller, getStat);
		const countSign = Math.sign(count);
		count = Math.abs(count);
		let result = 0;
		for (let n = 0; n < count; ++n) {
			result += this.wat.evaluate(roller, getStat);
		}
		return result * countSign;
	}
	stringify(): string {
		return this.count.stringify() + '(' + this.wat.stringify() + ')';
	}
	involvesDice(): boolean {
		return this.count.involvesDice() || this.wat.involvesDice();
	}
	evaluateExceptDice(getStat: (name: string) => number): UnitNode {
		let newCount: NumberNode | undefined | RepetitionNode | BinaryOpNode;
		let newWat: NumberNode | undefined | RepetitionNode | BinaryOpNode;
		// let newLHS: RepetitionNode | BinaryOpNode | undefined;
		// let newRHS: RepetitionNode | BinaryOpNode | undefined;
		//
		if (!this.count.involvesDice()) {
			newCount = new NumberNode(this.count.evaluate(() => 0, getStat));
		} else if (this.count instanceof RepetitionNode) {
			newCount = new RepetitionNode(
				this.count.count.evaluateExceptDice(getStat),
				this.count.wat.evaluateExceptDice(getStat),
			);
		} else if (this.count instanceof BinaryOpNode) {
			newCount = new BinaryOpNode(
				this.count.lhs.evaluateExceptDice(getStat),
				this.count.rhs.evaluateExceptDice(getStat),
				this.count.operator,
			);
		}
		if (!this.wat.involvesDice()) {
			newWat = new NumberNode(this.wat.evaluate(() => 0, getStat));
		} else if (this.wat instanceof RepetitionNode) {
			newWat = new RepetitionNode(
				this.wat.count.evaluateExceptDice(getStat),
				this.wat.wat.evaluateExceptDice(getStat),
			);
		} else if (this.wat instanceof BinaryOpNode) {
			newWat = new BinaryOpNode(
				this.wat.lhs.evaluateExceptDice(getStat),
				this.wat.rhs.evaluateExceptDice(getStat),
				this.wat.operator,
			);
		}
		//
		// if (this.count instanceof RepetitionNode) {
		// 	let newChildCount: NumberNode | undefined;
		// 	let newChildWat: NumberNode | undefined;
		// 	if (!this.count.count.involvesDice()) {
		// 		newChildCount = new NumberNode(this.count.count.evaluate(() => 0, getStat));
		// 	}
		// 	if (!this.count.wat.involvesDice()) {
		// 		newChildWat = new NumberNode(this.count.wat.evaluate(() => 0, getStat));
		// 	}
		// 	newCount = new RepetitionNode(newChildCount || this.count.count, newChildWat || this.count.wat);
		// }
		// if (this.count instanceof BinaryOpNode) {
		// 	let newChildLHS: NumberNode | undefined;
		// 	let newChildRHS: NumberNode | undefined;
		// 	if (!this.count.lhs.involvesDice()) {
		// 		newChildLHS = new NumberNode(this.count.lhs.evaluate(() => 0, getStat));
		// 	}
		// 	if (!this.count.rhs.involvesDice()) {
		// 		newChildRHS = new NumberNode(this.count.rhs.evaluate(() => 0, getStat));
		// 	}
		// 	newWat = new RepetitionNode(newChildLHS || this.count.lhs, newChildRHS || this.count.rhs);
		// }
		if (!this.involvesDice()) {
			return new NumberNode(
				this.evaluate(() => {
					throw new Error('UNREACHABLE');
				}, getStat),
			);
		} else {
			return new RepetitionNode(newCount || this.count, newWat || this.wat);
		}
	}
}

export class DiceFormula {
	tree: UnitNode;
	constructor(formula: UnitNode | string) {
		if (formula instanceof UnitNode) {
			this.tree = formula as UnitNode;
			return;
		}
		const formulaStack: object[][] = [];
		let currentFormula: object[] = [];
		let pos = 0;
		let curChar;
		while (true) {
			// skip any leading whitespace
			while (formula[pos] === ' ') ++pos;
			if (pos === formula.length) break;
			curChar = formula[pos];
			// TODO: allow negative numbers
			if (isOperator(curChar)) {
				if (currentFormula.length % 2 !== 1) {
					throw new Error('stray operator');
				}
				pos += 1;
				currentFormula.push({ type: 'operator', op: curChar });
			} else if (isDigit(curChar)) {
				if (currentFormula.length % 2 !== 0) {
					throw new Error('stray number');
				}
				const startPos = pos;
				pos += 1;
				while (pos < formula.length && isDigit(formula[pos])) {
					pos += 1;
				}
				const endPos = pos;
				const theNumber = parseInt(formula.substring(startPos, endPos));
				if (pos < formula.length) {
					curChar = formula[pos];
					if (isD(curChar) && pos + 1 < formula.length && isDigit(formula[pos + 1])) {
						pos += 1;
						const startPosSides = pos;
						pos += 1;
						while (pos < formula.length && isDigit(formula[pos])) {
							pos += 1;
						}
						const endPosSides = pos;
						if (pos < formula.length && isLetter(formula[pos])) {
							throw new Error('die roll followed directly by stat');
						}
						const numSides = parseInt(formula.substring(startPosSides, endPosSides));
						currentFormula.push({
							type: 'unit',
							subtype: 'dieroll',
							quantity: theNumber,
							numSides,
						});
						continue; // don't also push it as a number
					} else if (isLetter(curChar)) {
						throw new Error('number followed directly by stat');
					}
				}
				currentFormula.push({ type: 'unit', subtype: 'number', theNumber });
			} else if (isD(curChar) && pos + 1 < formula.length && isDigit(formula[pos + 1])) {
				if (currentFormula.length % 2 !== 0) {
					throw new Error('stray die roll');
				}
				pos += 1;
				const startPos = pos;
				pos += 1;
				while (pos < formula.length && isDigit(formula[pos])) {
					pos += 1;
				}
				const endPos = pos;
				if (pos < formula.length && isLetter(formula[pos])) {
					throw new Error('die roll followed directly by stat');
				}
				const numSides = formula.substring(startPos, endPos);
				currentFormula.push({ type: 'unit', subtype: 'dieroll', quantity: 1, numSides });
			} else if (isLetter(curChar)) {
				if (currentFormula.length % 2 !== 0) {
					throw new Error('stray stat');
				}
				const startPos = pos;
				pos += 1;
				while (pos < formula.length && isLetterOrSpace(formula[pos])) {
					pos += 1;
				}
				const endPos = pos;
				if (pos < formula.length && isDigit(formula[pos])) {
					throw new Error('stat followed directly by number');
				}
				const statName = formula.substring(startPos, endPos).trimEnd();
				currentFormula.push({ type: 'unit', subtype: 'stat', statName });
			} else if (curChar == '(') {
				formulaStack.push(currentFormula);
				if (currentFormula.length % 2 === 0) {
					// we are our own unit, not a repetition
					const oldCurrentFormula = currentFormula;
					currentFormula = [];
					//                                                    vvv This is the thing we're gonna put
					//                                                        the stuff we put into `currentFormula` into.
					oldCurrentFormula.push({
						type: 'unit',
						subtype: 'group',
						subformula: currentFormula,
					});
				} else {
					// we are a repetition, not our own unit
					const oldUnit = currentFormula.pop();
					if (oldUnit === undefined) {
						throw new Error('UNREACHABLE');
					}
					const oldCurrentFormula = currentFormula;
					currentFormula = [];
					oldCurrentFormula.push({
						type: 'unit',
						subtype: 'repetition',
						count: oldUnit,
						subformula: currentFormula,
					});
				}
				pos += 1;
			} else if (curChar == ')') {
				const blah = formulaStack.pop();
				if (blah === undefined) {
					throw new Error('unexpected ")"');
				}
				currentFormula = blah;
				pos += 1;
			} else {
				throw new Error('don\'t know what "' + curChar + '" is');
			}
		}
		if (currentFormula.length === 0) {
			throw new Error('empty subformula');
		}
		if (formulaStack.length !== 0) {
			throw new Error('unterminated group (missing ")")');
		}
		this.tree = UnitNode.fromFormula(currentFormula);
	}
	min(getStat: (name: string) => number): number {
		return this.execute(() => 1, getStat);
	}
	max(getStat: (name: string) => number): number {
		return this.execute((sides) => sides, getStat);
	}
	mean(getStat: (name: string) => number): number {
		return this.execute((sides) => (sides + 1) / 2, getStat);
	}
	roll(getStat: (name: string) => number): number {
		// Admiral's question:
		// this feels gross that all these methods take getStat as an argument
		// it feels like getStat should be a method on the class,
		// and that the character stats should have been passed into the constructor
		// but I would also love to understand if/why this choice was more relevant to Corfid's use-case
		return this.execute(
			(sides) => Math.min(Math.floor(Math.random() * sides + 1), sides),
			getStat,
		);
	}
	stringify(): string {
		return this.tree.stringify();
	}
	evaluateExceptDice(getStat: (name: string) => number): DiceFormula {
		return new DiceFormula(this.tree.evaluateExceptDice(getStat));
	}
	private execute(roller: (sides: number) => number, getStat: (name: string) => number): number {
		return this.tree.evaluate(roller, getStat);
	}
}

export const getStatByCharacter = (stats: Partial<StatsCalculated>) => {
	return (name: string): number => {
		// name may be 'Str Mod' or 'str mod' or 'sTr MoD' or whatver
		const propertyName = labelToStatName[name.toLocaleLowerCase()];
		if (!propertyName) {
			throw new Error(`Invalid property name: ${name}`);
		}
		return stats[propertyName as StatsCalculatedKey] || 0;
	};
};
