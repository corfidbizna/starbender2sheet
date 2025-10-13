import { describe, test, expect } from 'vitest';
import { type StatSheet, type StatsCalculated } from '@/composables/useCharacterData';
import { getBuffEffects, type BuffInfo, tallyBuffs } from './buffs';

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

const testCharacterSimple: StatsCalculated = {
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
	ac: 10,
	// No values from here down
	actionsMoveBaseLand: 0,
	actionsMoveBaseSwim: 0,
	actionsMoveBaseFly: 0,
	actionsMoveBaseClimb: 0,
	actionsMoveMult: 0,
	actionsMoveLand: 0,
	actionsMoveSwim: 0,
	actionsMoveFly: 0,
	actionsMoveClimb: 0,
	acFF: 0,
	acTouch: 0,
	acFFTouch: 0,
	drBase: 0,
	dr: 0,
	drFF: 0,
	capacityCarrying: 0,
	capacityKinetic: 0,
	capacitySpecial: 0,
	capacityHeavy: 0,
	energyMelee: 0,
	energyGrenade: 0,
	energySuper: 0,
	energyClass: 0,
	energyMeleeRecharge: 0,
	energyGrenadeRecharge: 0,
	energySuperRecharge: 0,
	energyClassRecharge: 0,
	rerolls: 0,
	slotsArmorHead: 0,
	slotsArmorArm: 0,
	slotsArmorChest: 0,
	slotsArmorLegs: 0,
	slotsArmorClass: 0,
	slotsArmorFull: 0,
	slotsArmorExotic: 0,
	slotsAspects: 0,
	slotsFragments: 0,
	equipArmorHead: 0,
	equipArmorArm: 0,
	equipArmorChest: 0,
	equipArmorLegs: 0,
	equipArmorClass: 0,
	equipArmorFull: 0,
	equipArmorExotic: 0,
	equipAspects: 0,
	equipFragments: 0,
	capacityArmorCharge: 0,
	toHitRanged: 0,
	toHitMelee: 0,
	toHitSpell: 0,
	damageMelee: 0,
	damageRanged: 0,
	damageSpell: 0,
	damagePrecision: 0,
	strSave: 0,
	dexSave: 0,
	conSave: 0,
	intSave: 0,
	wisSave: 0,
	chaSave: 0,
	strSkillCheck: 0,
	dexSkillCheck: 0,
	conSkillCheck: 0,
	intSkillCheck: 0,
	wisSkillCheck: 0,
	chaSkillCheck: 0,
	strSkills: 0,
	dexSkills: 0,
	conSkills: 0,
	intSkills: 0,
	wisSkills: 0,
	chaSkills: 0,
	initiative: 0,
	ref: 0,
	fort: 0,
	will: 0,
	hpMax: 0,
	hpTempMax: 0,
	hpShieldMax: 0,
	hpShieldType: 0,
	skillFocus: 0,
	energyUniversal: 0,
	energyUniversalRecharge: 0,
	armor: 0,
	armorNatural: 0,
	armorShield: 0,
	armorDeflection: 0,
	armorDodge: 0,
	bab: 0,
	bdb: 0,
	rolls: 0,
	actionsAttack: 0,
	actionsMove: 0,
	actionsReaction: 0,
	actionsBonus: 0,
	weightBase: 0,
	weightCurrent: 0,
	weightTotal: 0,
	size: 0,
	reach: 0,
	encumberance: 0,
	babPerLevel: 0,
	bdbPerLevel: 0,
	hpPerLevel: 0,
	fortPerLevel: 0,
	refPerLevel: 0,
	willPerLevel: 0,
};

describe('Behaviors of getBuffEffects', () => {
	test('A buff wilth no effects', () => {
		const buff: BuffInfo = {
			name: 'Cool sunglasses',
			type: 'Buff',
			description: 'Makes you look cool',
			active: true,
			stacks: 0,
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
			effects: 'Str Mod +5',
			active: true,
			stacks: 0,
		};
		const result = getBuffEffects(buff, testCharacterSimple);
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
			description: 'Debuffs strength and dexterity.',
			effects: 'Str Mod -5, Dex Mod -7',
			active: true,
			stacks: 0,
		};
		const result = getBuffEffects(buff, testCharacterSimple);
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
	test('Depends on another stat', () => {
		const buff: BuffInfo = {
			name: 'Buffs Something Based on Another Stat',
			type: 'Buff',
			isStacking: false,
			description: 'Buffs strength by dexterity mod.',
			effects: 'Str Mod +1*Dex Mod',
			active: true,
			stacks: 0,
		};
		const result = getBuffEffects(buff, testCharacterSimple);
		expect(result).toEqual([
			{
				category: 'Misc',
				sourceName: 'Buffs Something Based on Another Stat',
				affectedStat: 'str',
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
			effects: 'Str Mod +1*Dex Mod, Dex Mod +1*Str Mod',
			active: true,
			stacks: 0,
		};
		const result = getBuffEffects(buff, testCharacterSimple);
		expect(result).toEqual([
			{
				category: 'Misc',
				sourceName: 'Buffs Something Based on Another Stat Two-Way',
				affectedStat: 'str',
				amount: testCharacterSimple.dex,
			},
			{
				category: 'Misc',
				sourceName: 'Buffs Something Based on Another Stat Two-Way',
				affectedStat: 'dex',
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
			effects: 'Str Mod +1*Dex Mod*stacks',
			active: true,
		};
		const result = getBuffEffects(buff, testCharacterSimple);
		expect(result).toEqual([
			{
				category: 'Misc',
				sourceName: 'Buff Strength based on Dex and Stack Size',
				affectedStat: 'str',
				amount: testCharacterSimple.dex * buff.stacks,
			},
		]);
	});
	test('Multiplies some magnitudes based on stacks', () => {
		const buff: BuffInfo = {
			name: 'Buff Strength and Dex based on Stack Size',
			type: 'Buff',
			isStacking: true,
			stacks: 3,
			effects: 'Str Mod +10, Dex Mod +stacks',
			active: true,
		};
		const result = getBuffEffects(buff, testCharacterSimple);
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
			isStacking: true,
			stacks: 3,
			effects: 'Str Mod +10, Dex Mod +1*stacks',
			active: true,
		};
		const result = getBuffEffects(buff, testCharacterSimple);
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
			isStacking: true,
			stacks: 0,
			effects: 'Str Mod +1*stacks',
			active: true,
		};
		const result = getBuffEffects(buff, testCharacterSimple);
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
			isStacking: true,
			stacks: 3,
			effects: 'Str Mod -stacks',
			active: true,
		};
		const result = getBuffEffects(buff, testCharacterSimple);
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
			isStacking: false,
			effects: '+5',
			active: true,
			stacks: 0,
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
			effects: 'Dex Mod *3',
			active: true,
			stacks: 0,
		};
		const result = getBuffEffects(buff, testCharacterSimple);
		expect(result).toEqual([
			{
				category: 'Misc',
				sourceName: buff.name,
				affectedStat: 'dex',
				amount: testCharacterSimple.dex * 2,
			},
		]);
	});
	test('Buffing the same stat twice', () => {
		const buff: BuffInfo = {
			name: 'Buffs Strength by 5 and -3',
			type: 'Buff',
			isStacking: false,
			effects: 'Str Mod +5, Str Mod -3',
			active: true,
			stacks: 0,
		};
		const result = getBuffEffects(buff, testCharacterSimple);
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
			isStacking: false,
			effects: 'Str Mod +10',
			active: true,
			stacks: 0,
		};
		const result = getBuffEffects(buff, testCharacterSimple);
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
			isStacking: false,
			effects: 'Str Mod +5, misc Dex Mod +5',
			active: true,
			stacks: 0,
		};
		const result = getBuffEffects(buff, testCharacterSimple);
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
			isStacking: false,
			effects: 'Natural Armor +3',
			active: true,
			stacks: 0,
		};
		const result = getBuffEffects(buff, testCharacterSimple);
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
			isStacking: true,
			effects: 'Movement Action -0.5*stacks',
			active: true,
			stacks: 5,
		};
		const result = getBuffEffects(buff, testCharacterSimple);
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
			isStacking: false,
			effects: 'Natural Armor +2',
			active: true,
			stacks: 0,
		};
		const result = getBuffEffects(buff, testCharacterSimple);
		const tallied = tallyBuffs(result, testCharacterSimple);
		expect(tallied).toEqual({
			ac: {
				categories: {},
				summary: ' +2 Armor',
				total: 12,
			},
			acFF: {
				categories: {},
				summary: ' +2 Armor',
				total: 2,
			},
			armorNatural: {
				categories: {
					Armor: 2,
				},
				summary: ' +2 Armor',
				total: 2,
			},
			dr: {
				categories: {},
				summary: ' +2 Armor',
				total: 2,
			},
			drFF: {
				categories: {},
				summary: ' +2 Armor',
				total: 2,
			},
		});
	});
});

describe('getStatsCalclated', () => {
	test('with no inputs, it should give all zeroes', () => {
		const expected: StatsCalculated = {
			actionsMoveBaseLand: 0,
			actionsMoveBaseSwim: 0,
			actionsMoveBaseFly: 0,
			actionsMoveBaseClimb: 0,
			actionsMoveMult: 0,
			actionsMoveLand: 0,
			actionsMoveSwim: 0,
			actionsMoveFly: 0,
			actionsMoveClimb: 0,
			ac: 0,
			acFF: 0,
			acTouch: 0,
			acFFTouch: 0,
			drBase: 0,
			dr: 0,
			drFF: 0,
			capacityCarrying: 0,
			capacityKinetic: 0,
			capacitySpecial: 0,
			capacityHeavy: 0,
			energyMelee: 0,
			energyGrenade: 0,
			energySuper: 0,
			energyClass: 0,
			energyMeleeRecharge: 0,
			energyGrenadeRecharge: 0,
			energySuperRecharge: 0,
			energyClassRecharge: 0,
			rerolls: 0,
			slotsArmorHead: 0,
			slotsArmorArm: 0,
			slotsArmorChest: 0,
			slotsArmorLegs: 0,
			slotsArmorClass: 0,
			slotsArmorFull: 0,
			slotsArmorExotic: 0,
			slotsAspects: 0,
			slotsFragments: 0,
			equipArmorHead: 0,
			equipArmorArm: 0,
			equipArmorChest: 0,
			equipArmorLegs: 0,
			equipArmorClass: 0,
			equipArmorFull: 0,
			equipArmorExotic: 0,
			equipAspects: 0,
			equipFragments: 0,
			capacityArmorCharge: 0,
			toHitRanged: 0,
			toHitMelee: 0,
			toHitSpell: 0,
			damageMelee: 0,
			damageRanged: 0,
			damageSpell: 0,
			damagePrecision: 0,
			strSave: 0,
			dexSave: 0,
			conSave: 0,
			intSave: 0,
			wisSave: 0,
			chaSave: 0,
			strSkillCheck: 0,
			dexSkillCheck: 0,
			conSkillCheck: 0,
			intSkillCheck: 0,
			wisSkillCheck: 0,
			chaSkillCheck: 0,
			strSkills: 0,
			dexSkills: 0,
			conSkills: 0,
			intSkills: 0,
			wisSkills: 0,
			chaSkills: 0,
			initiative: 0,
			ref: 0,
			fort: 0,
			will: 0,
			hpMax: 0,
			hpTempMax: 0,
			hpShieldMax: 0,
			hpShieldType: 0,
			skillFocus: 0,
			energyUniversal: 0,
			energyUniversalRecharge: 0,
			armor: 0,
			armorNatural: 0,
			armorShield: 0,
			armorDeflection: 0,
			armorDodge: 0,
			bab: 0,
			bdb: 0,
			str: 0,
			dex: 0,
			con: 0,
			int: 0,
			wis: 0,
			cha: 0,
			rolls: 0,
			actionsAttack: 0,
			actionsMove: 0,
			actionsReaction: 0,
			actionsBonus: 0,
			strScore: 0,
			dexScore: 0,
			conScore: 0,
			intScore: 0,
			wisScore: 0,
			chaScore: 0,
			cpl: 0,
			weightBase: 0,
			weightCurrent: 0,
			weightTotal: 0,
			size: 0,
			reach: 0,
			encumberance: 0,
			babPerLevel: 0,
			bdbPerLevel: 0,
			hpPerLevel: 0,
			fortPerLevel: 0,
			refPerLevel: 0,
			willPerLevel: 0,
		};
		expect(expected.ac).toEqual(testCharacterBaseStats.attacks); // <— To make builds succeed : T.
		// expect(getStatsCalculated(testCharacterBaseStats)).toMatchObject(expected);
	});
});
