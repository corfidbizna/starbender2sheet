import {
	getBuffEffects,
	tallyBuffs,
	type BuffEffect,
	type BuffInfo,
	type CharacterBuffSummary,
	type PartyBuffInfo,
} from '@/business_logic/buffs';
import { DiceFormula, getStatByCharacter } from '@/business_logic/diceFormula';
import { computed, ref, type Ref, type ComputedRef, watch } from 'vue';

// ==================================================================================================
// Sheet Types
// ==================================================================================================

// The sheet IDs for characters and their sheets' subsheets.
export type CharacterDataSource = {
	label: string;
	documentId: string;
	sheets: {
		skills: string;
		variables: string;
		buffs: string;
	};
};
// The sheet IDs for the party and DM-managed sheets. These won't vary per character.
export type PartyDataSource = {
	documentId: string;
	sheets: {
		weapons: string;
		weaponPerks: string;
		armor: string;
		abilities: string;
		buffs: string;
		quests: string;
		artifact: string;
	};
};
// Gets the names of all the characters' subsheets and makes a type for every item.
type SheetNames = keyof CharacterDataSource['sheets'];

// ==================================================================================================
// Sheet Data
// ==================================================================================================

// Character Sheet IDs (add new characters here)
export const characterDataSources: Record<string, CharacterDataSource> = {
	kara: {
		label: 'Kara',
		documentId: '1RcSqD_99aJc-gOcmJTloZ-jItp2XOTiozjNvV-nzgSI',
		sheets: {
			skills: '847620321',
			variables: '711215743',
			buffs: '1723104523',
		},
	},
	aurora: {
		label: 'Aurora',
		documentId: '12vonRcFzriWY5AjLmueqbjd6DCQCJpqiLJkDpZEDgNU',
		sheets: {
			skills: '392143893',
			variables: '1217161183',
			buffs: '900669394',
		},
	},
	mark: {
		label: 'Mark',
		documentId: '1sa9fdn6xgqjoClBUKJ1n2yZRoR5cevaK4YWwq1x2v10',
		sheets: {
			skills: '1502753776',
			variables: '769576778',
			buffs: '919733175',
		},
	},
	lewis: {
		label: 'Lewis Reed',
		documentId: '1Emn-t1tU1Ugztb3Q0PqHO6gBEcuujWP-hTYEZHzdtKc',
		sheets: {
			skills: '1546065139',
			variables: '625235028',
			buffs: '858793392',
		},
	},
};
// Party Sheet IDs
export const partyDataSources: PartyDataSource = {
	documentId: '1agznHO98JumWB896PpQZ3eJQGIJwEIivChTurlwu5H8',
	sheets: {
		weapons: '0',
		weaponPerks: '298368355',
		armor: '31916088',
		abilities: '1109846394',
		buffs: '1462505437',
		quests: '745911680',
		artifact: '187064580',
	},
};
// A list of all character names, used as keys in certian dynamic situations
// and thus needs to be a type for TypeScript reasons.
export type Characters = {
	aurora: boolean;
	kara: boolean;
	mark: boolean;
	lewis: boolean;
};
export type CharacterNames = keyof Characters;

export type GVizSheetResponse = {
	version: string;
	reqId: string;
	status: string;
	sig: string;
	table: Table;
};

export type Table = {
	cols: ColumnDef[];
	rows: Row[];
	parsedNumHeaders: number;
};

export type ColumnDef = {
	id: string;
	label: string;
	type: string;
	pattern?: string;
};

export type Row = {
	c: (ColumnValue | undefined)[];
};

export type ColumnValue = {
	v: unknown;
	f?: string;
};

// Function to make the data gathered from a spreadsheet into a shape where
// colum headers are fields in an object.
const columnsToFieldNames = (parsed: GVizSheetResponse): Record<string, unknown>[] => {
	const cols = parsed.table.cols;
	return parsed.table.rows.map((row) => {
		const result: Record<string, unknown> = {};
		row.c.forEach((column, columnIndex) => {
			const key = cols[columnIndex].label;
			if (key && column) {
				result[key] = column.v;
			}
		});
		return result;
	});
};

// ==================================================================================================
// Character Stuff
// ==================================================================================================

// Generic Stuff
export const elements = {
	Kinetic: '#FFFFFF',
	Solar: '#F16F27',
	Arc: '#7AECF3',
	Void: '#B283CC',
	Stasis: '#4D87FF',
	Strand: '#35E366',
	Prismatic: '#FFFFFF',
};
export type Element = keyof typeof elements;
type SizeEffect = {
	name: string;
	ac: number;
	stealth: number;
	carryingCapacity: number;
	reach: number;
	fly: number;
	toHit: number;
};
export type DamageComponent = {
	attackType: string; // Bullet
	hitType: string; // AC
	hitBonus: number; // 2 (to be combined with range stuff)
	critRange: number; // 1 (20 only)
	critMult: number; // 2 (x2)
	damageFormula: DiceFormula; // 2d8+(Str Mod*2) <— separate from the imported string!!!
	dmgShort: string; // 2d8+10 (calculate pls)
	dmgMin: number; // 4 (calculate pls)
	dmgAvg: number; // [whatever the average is] (calculate pls)
	dmgMax: number; // 18 (calculate pls)
	damageType: Element; // Solar
	rangeType: string; // Ranged
	range: number; // 20
	rangePenalty: number; // 2 (amount to decrease hit by)
	rangeIncrementsModifier: number; // 20 (goes down every 20ft. distance)
	size: number; // 10
	shape: string; // sphere
	duration: number; // 1
};
export const damageStringToDownstream = (damage: string, sourceStats: StatsCalculated) => {
	const statFunction = getStatByCharacter(sourceStats);
	const formula = new DiceFormula(damage);
	return {
		damageFormula: formula,
		dmgMin: formula.min(statFunction),
		dmgMax: formula.max(statFunction),
		dmgAvg: formula.mean(statFunction),
		dmgShort: formula.evaluateExceptDice(statFunction).stringify(),
	};
};
export const sizeMap: Record<number, SizeEffect> = {
	'-4': {
		name: 'Fine',
		ac: 8,
		stealth: 16,
		carryingCapacity: 0.125,
		reach: 1,
		fly: 8,
		toHit: 8,
	},
	'-3': {
		name: 'Diminuitive',
		ac: 4,
		stealth: 12,
		carryingCapacity: 0.25,
		reach: 2,
		fly: 6,
		toHit: 4,
	},
	'-2': {
		name: 'Tiny',
		ac: 2,
		stealth: 8,
		carryingCapacity: 0.5,
		reach: 2.5,
		fly: 4,
		toHit: 2,
	},
	'-1': {
		name: 'Small',
		ac: 1,
		stealth: 4,
		carryingCapacity: 0.75,
		reach: 5,
		fly: 2,
		toHit: 1,
	},
	'0': {
		name: 'Medium',
		ac: 0,
		stealth: 0,
		carryingCapacity: 1,
		reach: 5,
		fly: 0,
		toHit: 0,
	},
	'1': {
		name: 'Large',
		ac: -1,
		stealth: -2,
		carryingCapacity: 2,
		reach: 10,
		fly: -1,
		toHit: -1,
	},
	'2': {
		name: 'Huge',
		ac: -2,
		stealth: -8,
		carryingCapacity: 4,
		reach: 15,
		fly: -4,
		toHit: -2,
	},
	'3': {
		name: 'Gargantuan',
		ac: -4,
		stealth: -12,
		carryingCapacity: 8,
		reach: 20,
		fly: -6,
		toHit: -4,
	},
	'4': {
		name: 'Colossal',
		ac: -8,
		stealth: -16,
		carryingCapacity: 16,
		reach: 30,
		fly: -8,
		toHit: -8,
	},
	'5': {
		name: 'Colossal+',
		ac: -16,
		stealth: -20,
		carryingCapacity: 32,
		reach: 40,
		fly: -10,
		toHit: -16,
	},
};

// Character Stats, as imported from the sheet.
export type StatSheet = {
	// Character info
	cpl: number;
	name: string;
	race: string;
	class: string;
	colorHair: string;
	colorEye: string;
	height: string;
	weight: number;
	guardianClass: string;
	guardianSubclass: string;
	nameGhost: string;
	// Raw ability scores
	strScore: number;
	dexScore: number;
	conScore: number;
	intScore: number;
	wisScore: number;
	chaScore: number;
	// Investment per level, to be mixed later based on CPL and other math
	hpPerLevel: number;
	skillFocus: number;
	fortPerLevel: number;
	refPerLevel: number;
	willPerLevel: number;
	babPerLevel: number;
	bdbPerLevel: number;
	// Armors
	armor: number;
	armorNatural: number;
	armorShield: number;
	armorDeflection: number;
	armorDodge: number;
	// Action ecomony
	// QUESTION: how to quantify extra actions, like weapon attack actions.
	attacks: number;
	reactions: number;
	moves: number;
	// Energies
	energySuper: number;
	energyMelee: number;
	energyGrenade: number;
	energyClass: number;
	// Misc
	size: number;
};
export type StatSheetKey = keyof StatSheet;

export type StatsCalculated = {
	actionsMoveBaseLand: number;
	actionsMoveBaseSwim: number;
	actionsMoveBaseFly: number;
	actionsMoveBaseClimb: number;
	actionsMoveMult: number;
	actionsMoveLand: number;
	actionsMoveSwim: number;
	actionsMoveFly: number;
	actionsMoveClimb: number;
	//
	ac: number;
	acFF: number;
	acTouch: number;
	acFFTouch: number;
	drBase: number;
	dr: number;
	drFF: number;
	//
	drArc: number;
	drFFArc: number;
	resistArc: number;
	drSolar: number;
	drFFSolar: number;
	resistSolar: number;
	drVoid: number;
	drFFVoid: number;
	resistVoid: number;
	drStasis: number;
	drFFStasis: number;
	resistStasis: number;
	drStrand: number;
	drFFStrand: number;
	resistStrand: number;
	drPrismatic: number;
	drFFPrismatic: number;
	resistPrismatic: number;
	drDark: number;
	drFFDark: number;
	resistDark: number;
	//
	capacityCarrying: number;
	capacityKinetic: number;
	capacitySpecial: number;
	capacityHeavy: number;
	energyMelee: number;
	energyGrenade: number;
	energySuper: number;
	energyClass: number;
	energyMeleeRecharge: number;
	energyGrenadeRecharge: number;
	energySuperRecharge: number;
	energyClassRecharge: number;
	rerolls: number;
	//
	slotsArmorHead: number;
	slotsArmorArm: number;
	slotsArmorChest: number;
	slotsArmorLegs: number;
	slotsArmorClass: number;
	slotsArmorFull: number;
	slotsArmorExotic: number;
	slotsAspects: number;
	slotsFragments: number;
	equipArmorHead: number;
	equipArmorArm: number;
	equipArmorChest: number;
	equipArmorLegs: number;
	equipArmorClass: number;
	equipArmorFull: number;
	equipArmorExotic: number;
	//
	slotsWeapon: number;
	slotsWeaponUsed: number;
	hands: number;
	handsUsed: number;
	//
	equipAspects: number;
	equipFragments: number;
	capacityArmorCharge: number;
	//
	toHitRanged: number;
	toHitMelee: number;
	toHitSpell: number;
	damageMelee: number;
	damageRanged: number;
	damageSpell: number;
	damagePrecision: number;
	//
	strSave: number;
	dexSave: number;
	conSave: number;
	intSave: number;
	wisSave: number;
	chaSave: number;
	strSkillCheck: number;
	dexSkillCheck: number;
	conSkillCheck: number;
	intSkillCheck: number;
	wisSkillCheck: number;
	chaSkillCheck: number;
	strSkills: number;
	dexSkills: number;
	conSkills: number;
	intSkills: number;
	wisSkills: number;
	chaSkills: number;
	initiative: number;
	ref: number;
	fort: number;
	will: number;
	//
	hpMax: number;
	hpRecharge: number;
	hpTempMax: number;
	hpShieldMax: number;
	hpShieldRecharge: number;
	hpShieldKinetic: number;
	hpShieldSolar: number;
	hpShieldArc: number;
	hpShieldVoid: number;
	hpShieldStasis: number;
	hpShieldStrand: number;
	hpShieldPrismatic: number;
	hpShieldType: number;
	skillFocus: number;
	//
	energyUniversal: number;
	energyUniversalRecharge: number;
	//
	armor: number;
	armorNatural: number;
	armorShield: number;
	armorDeflection: number;
	armorDodge: number;
	bab: number;
	bdb: number;
	//
	str: number;
	dex: number;
	con: number;
	int: number;
	wis: number;
	cha: number;
	rolls: number;
	//
	actionsAttack: number;
	actionsMove: number;
	actionsReaction: number;
	actionsBonus: number;
	//
	strScore: number;
	dexScore: number;
	conScore: number;
	intScore: number;
	wisScore: number;
	chaScore: number;
	//
	cpl: number;
	weightBase: number;
	weightCurrent: number;
	weightTotal: number;
	size: number;
	reach: number;
	encumberance: number;
	babPerLevel: number;
	bdbPerLevel: number;
	hpPerLevel: number;
	fortPerLevel: number;
	refPerLevel: number;
	willPerLevel: number;
	//
	artifact: number;
};
export type StatsCalculatedKey = keyof StatsCalculated;
export const labelMap: Record<StatsCalculatedKey, string> = {
	actionsMoveBaseLand: 'Move Base Land',
	actionsMoveBaseSwim: 'Move Base Swim',
	actionsMoveBaseFly: 'Move Base Fly',
	actionsMoveBaseClimb: 'Move Base Climb',
	actionsMoveMult: 'Move Mult',
	actionsMoveLand: 'Move (Base Land)',
	actionsMoveSwim: 'Move (Swim)',
	actionsMoveFly: 'Move (Fly)',
	actionsMoveClimb: 'Move (Climb)',
	ac: 'AC',
	acFF: 'FF AC',
	acTouch: 'Touch AC',
	acFFTouch: 'FF Touch AC',
	drBase: 'Base DR',
	dr: 'DR',
	drFF: 'FF DR',
	drArc: 'Arc DR',
	drFFArc: 'Arc FF DR',
	resistArc: 'Arc Resistance',
	drSolar: 'Solar DR',
	drFFSolar: 'Solar FF DR',
	resistSolar: 'Solar Resistance',
	drVoid: 'Void DR',
	drFFVoid: 'Void FF DR',
	resistVoid: 'Void Resistance',
	drStasis: 'Stasis DR',
	drFFStasis: 'Stasis FF DR',
	resistStasis: 'Stasis Resistance',
	drStrand: 'Strand DR',
	drFFStrand: 'Strand FF DR',
	resistStrand: 'Strand Resistance',
	drPrismatic: 'Prismatic DR',
	drFFPrismatic: 'Prismatic FF DR',
	resistPrismatic: 'Prismatic Resistance',
	drDark: 'Darkness DR',
	drFFDark: 'Darkness FF DR',
	resistDark: 'Darkness Resistance',
	capacityCarrying: 'Carrying Capacity',
	capacityKinetic: 'Kinetic Ammo Capacity',
	capacitySpecial: 'Special Ammo Capacity',
	capacityHeavy: 'Heavy Ammo Capacity',
	energyMelee: 'Melee Energy',
	energyGrenade: 'Grenade Energy',
	energySuper: 'Super Energy',
	energyClass: 'Class Energy',
	energyMeleeRecharge: 'Melee Energy Recharge',
	energyGrenadeRecharge: 'Grenade Energy Recharge',
	energySuperRecharge: 'Super Energy Recharge',
	energyClassRecharge: 'Class Energy Recharge',
	rerolls: 'Rerolls',
	slotsArmorHead: 'Head Slot',
	slotsArmorArm: 'Arm Slot',
	slotsArmorChest: 'Chest Slot',
	slotsArmorLegs: 'Leg Slot',
	slotsArmorClass: 'Class Slot',
	slotsArmorFull: 'Armor Slot',
	slotsArmorExotic: 'Exotic  Slot',
	slotsAspects: 'Aspect Slot',
	slotsFragments: 'Fragment Slot',
	equipArmorHead: 'Head Equipment',
	equipArmorArm: 'Arm Equipment',
	equipArmorChest: 'Chest Equipment',
	equipArmorLegs: 'Leg Equipment',
	equipArmorClass: 'Class Equipment',
	equipArmorFull: 'Full Armor Equipment',
	equipArmorExotic: 'Exotic Equipment',
	slotsWeapon: 'Weapon Slots',
	slotsWeaponUsed: 'Weapons Equipped',
	hands: 'Hands',
	handsUsed: 'Hands Used',
	equipAspects: 'Aspect Slots',
	equipFragments: 'Fragment Slots',
	capacityArmorCharge: 'Max Armor Charge',
	toHitRanged: 'Ranged to hit',
	toHitMelee: 'Melee to hit',
	toHitSpell: 'Spell to hit',
	damageMelee: 'Melee Damage Bonus',
	damageRanged: 'Ranged Damage Bonus',
	damageSpell: 'Spell Damage Bonus',
	damagePrecision: 'Precision Damage Bonus',
	strSave: 'Str Save DC',
	dexSave: 'Dex Save DC',
	conSave: 'Con Save DC',
	intSave: 'Int Save DC',
	wisSave: 'Wis Save DC',
	chaSave: 'Cha Save DC',
	strSkillCheck: 'Skill Str Roll',
	dexSkillCheck: 'Skill Dex Roll',
	conSkillCheck: 'Skill Con Roll',
	intSkillCheck: 'Skill Int Roll',
	wisSkillCheck: 'Skill Wis Roll',
	chaSkillCheck: 'Skill Cha Roll',
	strSkills: 'Str Skills',
	dexSkills: 'Dex Skills',
	conSkills: 'Con Skills',
	intSkills: 'Int Skills',
	wisSkills: 'Wis Skills',
	chaSkills: 'Cha Skills',
	initiative: 'Initiative',
	ref: 'Ref Save',
	fort: 'Fort Save',
	will: 'Will Save',
	hpMax: 'Max HP',
	hpRecharge: 'HP Recharge',
	hpTempMax: 'Max Temp HP',
	hpShieldMax: 'Max Shield HP',
	hpShieldRecharge: 'Shield Recharge',
	hpShieldKinetic: 'Kinetic Overshield',
	hpShieldSolar: 'Solar Overshield',
	hpShieldArc: 'Arc Overshield',
	hpShieldVoid: 'Void Overshield',
	hpShieldStasis: 'Stasis Overshield',
	hpShieldStrand: 'Strand Overshield',
	hpShieldPrismatic: 'Prismatic Overshield',
	hpShieldType: 'Shield Type',
	skillFocus: 'Skill Focus',
	energyUniversal: 'Max Universal Energy',
	energyUniversalRecharge: 'Universal Energy Recharge',
	armor: 'Armor',
	armorNatural: 'Natural Armor',
	armorShield: 'Shield',
	armorDeflection: 'Deflection',
	armorDodge: 'Dodge',
	bab: 'Base Attack',
	bdb: 'Base Defense',
	str: 'Str Mod',
	dex: 'Dex Mod',
	con: 'Con Mod',
	int: 'Int Mod',
	wis: 'Wis Mod',
	cha: 'Cha Mod',
	rolls: 'Rolls',
	actionsAttack: 'Attack Action',
	actionsMove: 'Movement Action',
	actionsReaction: 'Reaction',
	actionsBonus: 'Bonus Action',
	strScore: 'Str Score',
	dexScore: 'Dex Score',
	conScore: 'Con Score',
	intScore: 'Int Score',
	wisScore: 'Wis Score',
	chaScore: 'Cha Score',
	cpl: 'CPL',
	weightBase: 'Base Character Weight',
	weightCurrent: 'Weight Carried',
	weightTotal: 'Total Character Weight',
	size: 'Size',
	reach: 'Reach',
	encumberance: 'Encumberance',
	babPerLevel: 'Level Up Base Attack',
	bdbPerLevel: 'Level Up Base Defense',
	hpPerLevel: 'Level Up HP',
	fortPerLevel: 'Level Up Fort',
	refPerLevel: 'Level Up Ref',
	willPerLevel: 'Level Up Will',
	artifact: 'Artifact Points',
};
export const labelToStatName: Record<string, string> = {};
// Object.entries(labelMap).forEach((stringPair) => labelToStatName[stringPair[1].toLocaleLowerCase()] = stringPair[0]);
// These two lines ^^^^ vvvv do the same work.
Object.entries(labelMap).forEach(
	([stat, label]) => (labelToStatName[label.toLocaleLowerCase()] = stat),
);
export const makeEmptyStats = () => {
	const result: Record<string, number> = {};
	Object.keys(labelToStatName).forEach((key) => {
		result[key] = 0;
	});
	return result as Record<StatsCalculatedKey, number>;
};
export const statsDistribute = (source: StatsCalculated) => {
	source.str = Math.floor((source.strScore - 10) / 2);
	source.dex = Math.floor((source.dexScore - 10) / 2);
	source.con = Math.floor((source.conScore - 10) / 2);
	source.int = Math.floor((source.intScore - 10) / 2);
	source.wis = Math.floor((source.wisScore - 10) / 2);
	source.cha = Math.floor((source.chaScore - 10) / 2);
	source.actionsMoveLand = source.actionsMoveBaseLand * source.actionsMoveMult;
	source.actionsMoveSwim = source.actionsMoveBaseSwim * source.actionsMoveMult;
	source.actionsMoveFly = source.actionsMoveBaseFly * source.actionsMoveMult;
	source.actionsMoveClimb = source.actionsMoveBaseClimb * source.actionsMoveMult;
	source.ac =
		10 +
		source.armor +
		source.armorNatural +
		source.armorShield +
		source.armorDeflection +
		source.armorDodge +
		source.dex +
		source.bdb +
		sizeMap[source.size || 0].ac;
	source.acFF = 10 + source.armor + source.armorNatural + source.armorDeflection + source.bdb;
	source.acTouch = 10 + source.armorDeflection + source.armorDodge + source.bdb + source.dex;
	source.acFFTouch = 10 + source.armorDeflection + source.bdb;
	source.dr =
		source.armor + source.armorNatural + source.armorShield + source.drBase + source.con;
	source.drFF = source.armor + source.armorNatural + source.drBase + source.con;
	source.capacityCarrying =
		25 *
		Math.floor(Math.pow(4, Math.max(source.strScore / 10, 0))) *
		sizeMap[source.size || 0].carryingCapacity;
	source.toHitRanged = source.bab + source.dex;
	source.toHitMelee = source.bab + source.str;
	source.toHitSpell = source.bab + source.cha;
	source.strSave = 10 + Math.floor(source.cpl / 2) + source.str;
	source.dexSave = 10 + Math.floor(source.cpl / 2) + source.dex;
	source.conSave = 10 + Math.floor(source.cpl / 2) + source.con;
	source.intSave = 10 + Math.floor(source.cpl / 2) + source.int;
	source.wisSave = 10 + Math.floor(source.cpl / 2) + source.wis;
	source.chaSave = 10 + Math.floor(source.cpl / 2) + source.cha;
	source.initiative = source.dex;
	source.ref = Math.floor(source.cpl * source.refPerLevel + source.dex);
	source.fort = Math.floor(source.cpl * source.fortPerLevel + source.con);
	source.will = Math.floor(source.cpl * source.willPerLevel + source.wis);
	source.hpMax = (source.hpPerLevel + source.con) * source.cpl;
	source.energyUniversal = Math.floor((2 + source.cha) * source.cpl);
};

// Character Stat Destinations

// The type to be handed to a `StatBoxInfo` component, used for making
// horizontal bar graphs of numerical character stats.
export type StatBoxInfo = {
	label: string;
	data: BarBoxStatField[];
	noRoll?: boolean;
};
export type BarBoxStatField = {
	label: string;
	stat: string;
	hovertext?: string;
	description?: string;
	value: number;
	value2?: number;
};
export type CapacityBoxInfo = {
	label: string;
	data: CapacityBoxStatField[];
	hideRefillAll?: boolean;
	noInteract?: boolean;
};
export type CapacityBoxStatField = {
	label: string;
	stat: string;
	color?: string;
	colorMax?: string;
	hovertext?: string;
	max: number;
	current: number;
	current2?: number;
};

//
export const makeComputedOfStats = (
	stats: ComputedRef<StatsCalculated>,
	buffs: ComputedRef<CharacterBuffSummary>,
	label: string,
	keys: StatsCalculatedKey[],
	noRoll?: boolean,
): (() => StatBoxInfo) => {
	return (): StatBoxInfo => {
		const buffsValue = buffs.value;
		return {
			label,
			data: keys.map((key) => ({
				key,
				label: labelMap[key],
				stat: key,
				hovertext: buffsValue[key]?.summary,
				value: stats.value[key],
				value2: buffsValue[key]?.total,
			})),
			noRoll,
		};
	};
};

// The type and destination of character stats that describe "capacities" rather than straight-up values.
export type ActionResource = {
	turns: number;
	health: number;
	shields: number;
	//
	actionMoves: number;
	actionAttacks: number;
	actionReactions: number;
	actionOthers: number;
	ammoKinetic: number;
	ammoSpecial: number;
	ammoHeavy: number;
	energySuper: number;
	energyMelee: number;
	energyGrenade: number;
	energyClass: number;
	energyUniversal: number;
	armorCharges: number;
	rerolls: number;
};
export type ActionResourceKey = keyof ActionResource;

//
export const makeComputedOfCapacities = (
	stats: ComputedRef<StatsCalculated>,
	tally: ComputedRef<CharacterBuffSummary>,
	label: string,
	keys: StatsCalculatedKey[],
): (() => StatBoxInfo) => {
	return (): StatBoxInfo => {
		const buffsValue = tally.value;
		return {
			label,
			data: keys.map((key) => ({
				key,
				label: labelMap[key],
				stat: key,
				hovertext: buffsValue[key]?.summary,
				value: stats.value[key],
				value2: buffsValue[key]?.total,
			})),
		};
	};
};

// The type describing a character's skill.
export type Skill = {
	// Str Skills
	str: number;
	climb: number;
	swim: number;
	// Dex Skills
	dex: number;
	acrobatics: number;
	disableDevice: number;
	escapeArtist: number;
	fly: number;
	ride: number;
	sleightOfHand: number;
	stealth: number;
	// Con Skills
	con: number;
	concentration: number;
	// Int Skills
	int: number;
	appraise: number;
	craft: number;
	craftCooking: number;
	craftElectronic: number;
	craftExplosives: number;
	craftMechanical: number;
	craftSculpture: number;
	knowledge: number;
	knowledgeAgriculture: number;
	knowledgeArcana: number;
	knowledgeAll: number;
	knowledgeBiologyNature: number;
	knowledgeDungeoneering: number;
	knowledgeEngineering: number;
	knowledgeFinance: number;
	knowledgeGeography: number;
	knowledgeHistory: number;
	knowledgeLocal: number;
	knowledgeNature: number;
	knowledgeNobility: number;
	knowledgePhysicalEdHealthNutrition: number;
	knowledgePhysicalSciEngineering: number;
	knowledgePlanes: number;
	knowledgeReligion: number;
	knowledgeTactics: number;
	knowledgeTechnology: number;
	linguistics: number;
	spellcraft: number;
	// Wis Skills
	wis: number;
	heal: number;
	perception: number;
	profession: number;
	professionAdmin: number;
	professionAll: number;
	professionGuard: number;
	professionTeacher: number;
	senseMotive: number;
	survival: number;
	// Cha Skills
	cha: number;
	bluff: number;
	diplomacy: number;
	disguise: number;
	handleAnimal: number;
	intimidate: number;
	perform: number;
	performSingingAndDancing: number;
	useMagicDevice: number;
	//
};
export type SkillKey = keyof Skill;
export type SkillInfoKey = {
	label: string;
	baseStat: StatsCalculatedKey;
	description: string;
};
export const skillsInfoMap: Record<SkillKey, Record<string, string>> = {
	// Str Skills
	str: {
		label: 'Str Roll',
		baseStat: 'str',
		description: 'text',
	},
	climb: {
		label: 'Climb',
		baseStat: 'str',
		description: 'Climb, Make Handholds, Catch Yourself',
	},
	swim: {
		label: 'Swim',
		baseStat: 'str',
		description: 'Swim at half Speed',
	},
	// Dex Skills
	dex: {
		label: 'Dex Roll',
		baseStat: 'dex',
		description: 'text',
	},
	acrobatics: {
		label: 'Acrobatics',
		baseStat: 'dex',
		description:
			'Cross Narrow Surfaces/Uneven Ground, Move Through Threatened Squares, Jumping and Falling',
	},
	disableDevice: {
		label: 'Disable Device',
		baseStat: 'dex',
		description: 'Disarm Device, Open Lock, Sabotage Mechanical Item',
	},
	escapeArtist: {
		label: 'Escape Artist',
		baseStat: 'dex',
		description: 'slip bonds, escape grapples, Move Through Tight Space',
	},
	fly: {
		label: 'Fly',
		baseStat: 'dex',
		description: 'Tight Turns, Avoid Falls, Handle Wind',
	},
	ride: {
		label: 'Ride',
		baseStat: 'dex',
		description: 'Do special manuvers, Tricks, or actions, Ride, Drive, Pilot',
	},
	sleightOfHand: {
		label: 'Sleight of Hand',
		baseStat: 'dex',
		description: 'Take Something Unnoticed, Hide or Retrieve an Object, Entertain',
	},
	stealth: {
		label: 'Stealth',
		baseStat: 'dex',
		description: 'Hide',
	},
	// Con Skills
	con: {
		label: 'Con Roll',
		baseStat: 'con',
		description: 'text',
	},
	concentration: {
		label: 'Concentration',
		baseStat: 'con',
		description: 'text',
	},
	// Int Skills
	int: {
		label: 'Int Roll',
		baseStat: 'int',
		description: 'text',
	},
	appraise: {
		label: 'Appraise',
		baseStat: 'int',
		description: 'Appraise Value of Item, Identify its properties',
	},
	craft: {
		label: 'Craft',
		baseStat: 'int',
		description: 'Practice a Trade, Make Something, Identify properties of your craft',
	},
	craftCooking: {
		label: 'Craft (Cooking)',
		baseStat: 'int',
		description: 'Practice a Trade, Make Something, Identify properties of your craft',
	},
	craftElectronic: {
		label: 'Craft (Electronic)',
		baseStat: 'int',
		description: 'Practice a Trade, Make Something, Identify properties of your craft',
	},
	craftExplosives: {
		label: 'Craft (Explosives)',
		baseStat: 'int',
		description: 'Practice a Trade, Make Something, Identify properties of your craft',
	},
	craftMechanical: {
		label: 'Craft (Mechanical)',
		baseStat: 'int',
		description: 'Practice a Trade, Make Something, Identify properties of your craft',
	},
	craftSculpture: {
		label: 'Craft (Sculpture)',
		baseStat: 'int',
		description: 'Practice a Trade, Make Something, Identify properties of your craft',
	},
	knowledge: {
		label: 'Knowledge',
		baseStat: 'int',
		description: 'Identify Effects, Hazards, Lore, Monsters',
	},
	knowledgeAll: {
		label: 'Knowledge (All)',
		baseStat: 'int',
		description: 'Identify Effects, Hazards, Lore, Monsters',
	},
	knowledgeAgriculture: {
		label: 'Knowledge (Agriculture)',
		baseStat: 'int',
		description: 'Identify Effects, Hazards, Lore, Monsters',
	},
	knowledgeArcana: {
		label: 'Knowledge (Arcana)',
		baseStat: 'int',
		description: 'Identify Effects, Hazards, Lore, Monsters',
	},
	knowledgeBiologyNature: {
		label: 'Knowledge (Biology & Nature)',
		baseStat: 'int',
		description: 'Identify Effects, Hazards, Lore, Monsters',
	},
	knowledgeDungeoneering: {
		label: 'Knowledge (Dungeoneering)',
		baseStat: 'int',
		description: 'Identify Effects, Hazards, Lore, Monsters',
	},
	knowledgeEngineering: {
		label: 'Knowledge (Engineering)',
		baseStat: 'int',
		description: 'Identify Effects, Hazards, Lore, Monsters',
	},
	knowledgeFinance: {
		label: 'Knowledge (Finance)',
		baseStat: 'int',
		description: 'Identify Effects, Hazards, Lore, Monsters',
	},
	knowledgeGeography: {
		label: 'Knowledge (Geography)',
		baseStat: 'int',
		description: 'Identify Effects, Hazards, Lore, Monsters',
	},
	knowledgeHistory: {
		label: 'Knowledge (History)',
		baseStat: 'int',
		description: 'Identify Effects, Hazards, Lore, Monsters',
	},
	knowledgeLocal: {
		label: 'Knowledge (Local)',
		baseStat: 'int',
		description: 'Identify Effects, Hazards, Lore, Monsters',
	},
	knowledgeNature: {
		label: 'Knowledge (Nature)',
		baseStat: 'int',
		description: 'Identify Effects, Hazards, Lore, Monsters',
	},
	knowledgeNobility: {
		label: 'Knowledge (Nobility)',
		baseStat: 'int',
		description: 'Identify Effects, Hazards, Lore, Monsters',
	},
	knowledgePhysicalEdHealthNutrition: {
		label: 'Knowledge (Physical Ed & Health & Nutrition)',
		baseStat: 'int',
		description: 'Identify Effects, Hazards, Lore, Monsters',
	},
	knowledgePhysicalSciEngineering: {
		label: 'Knowledge (Physical Sci & Engeneering)',
		baseStat: 'int',
		description: 'Identify Effects, Hazards, Lore, Monsters',
	},
	knowledgePlanes: {
		label: 'Knowledge (Planes)',
		baseStat: 'int',
		description: 'Identify Effects, Hazards, Lore, Monsters',
	},
	knowledgeReligion: {
		label: 'Knowledge (Religion)',
		baseStat: 'int',
		description: 'Identify Effects, Hazards, Lore, Monsters',
	},
	knowledgeTactics: {
		label: 'Knowledge (Tactics)',
		baseStat: 'int',
		description: 'Identify Effects, Hazards, Lore, Monsters',
	},
	knowledgeTechnology: {
		label: 'Knowledge (Technology)',
		baseStat: 'int',
		description: 'Identify Effects, Hazards, Lore, Monsters',
	},
	linguistics: {
		label: 'Linguistics',
		baseStat: 'int',
		description: 'Decypher Language, Create or Detect Forgeries, Codes and Cyphers',
	},
	spellcraft: {
		label: 'Spellcraft',
		baseStat: 'int',
		description: 'Identify Spell, Determine Properties of Magic item',
	},
	// Wis Skills
	wis: {
		label: 'Wis Roll',
		baseStat: 'wis',
		description: 'text',
	},
	heal: {
		label: 'Heal',
		baseStat: 'wis',
		description: 'Treat ailment, Identify drugs',
	},
	perception: {
		label: 'Perception',
		baseStat: 'wis',
		description: 'Notice Something',
	},
	profession: {
		label: 'Profession',
		baseStat: 'wis',
		description: 'Earn a Living, Complete Tasks',
	},
	professionAdmin: {
		label: 'Profession (Admin)',
		baseStat: 'wis',
		description: 'Earn a Living, Complete Tasks',
	},
	professionAll: {
		label: 'Profession (All)',
		baseStat: 'wis',
		description: 'Earn a Living, Complete Tasks',
	},
	professionGuard: {
		label: 'Profession (Guard)',
		baseStat: 'wis',
		description: 'Earn a Living, Complete Tasks',
	},
	professionTeacher: {
		label: 'Profession (Teacher)',
		baseStat: 'wis',
		description: 'Earn a Living, Complete Tasks',
	},
	senseMotive: {
		label: 'Sense Motive',
		baseStat: 'wis',
		description: 'Hunch, Sense Enchantment, Discern Secret Message',
	},
	survival: {
		label: 'Survival',
		baseStat: 'wis',
		description: 'Tracking, Find your way, Avoid Hazards',
	},
	// Cha Skills
	cha: {
		label: 'Cha Roll',
		baseStat: 'cha',
		description: 'text',
	},
	bluff: {
		label: 'Bluff',
		baseStat: 'cha',
		description:
			'Deceive or Lie, Convey Secret Message, Feint or Diversions in Combat, Suggest an Action',
	},
	diplomacy: {
		label: 'Diplomacy',
		baseStat: 'cha',
		description: 'Influence Attitude, Gather Information, Make Request, Suggest an Action',
	},
	disguise: {
		label: 'Disguise',
		baseStat: 'cha',
		description: 'change your appearance',
	},
	handleAnimal: {
		label: 'Handle Animal',
		baseStat: 'cha',
		description: 'teach tricks, Give Commandes, Tame',
	},
	intimidate: {
		label: 'Intimidate',
		baseStat: 'cha',
		description: 'Demoralize, Influence, Coerce',
	},
	perform: {
		label: 'Perform',
		baseStat: 'cha',
		description: 'Entertain, Inspire, Destract, Earn Money',
	},
	performSingingAndDancing: {
		label: 'Perform (Singing and Dancing)',
		baseStat: 'cha',
		description: 'Entertain, Inspire, Destract, Earn Money',
	},
	useMagicDevice: {
		label: 'Use Magic Device',
		baseStat: 'cha',
		description: 'Activate magical Device, Cause Mishap',
	},
	//
};
export const labelToSkillName: Record<string, string> = {};
Object.entries(skillsInfoMap).forEach(
	([stat, info]) => (labelToSkillName[info.label.toLocaleLowerCase()] = stat),
);

export type SkillsTableItem = {
	Bonus: number;
	Name: string;
	Score: string;
	Focused: boolean;
};

// Weapon Types
export const rarities = {
	Common: 0,
	Uncommon: 1,
	Rare: 2,
	Legendary: 3,
	Exotic: 4,
};
export type Rarity = keyof typeof rarities;
type WeaponClasses =
	| 'Bow'
	| 'Auto Rifle'
	| 'Pulse Rifle'
	| 'Scout Rifle'
	| 'Hand Cannon'
	| 'Submachine Gun'
	| 'Sidearm'
	| 'Shotgun'
	| 'Sniper Rifle'
	| 'Fusion Rifle'
	| 'Breech-Loading Grenade Launcher'
	| 'Trace Rifle'
	| 'Glaive'
	| 'Rocket Launcher'
	| 'Drum-Loading Grenade Launcher'
	| 'Linear Fusion Rifle'
	| 'Sword'
	| 'Machine Gun';
// The type describing a weapon
export type ImportedWeapon = Characters & {
	name: string;
	flavortext?: string;
	rarity: Rarity;
	element: Element;
	weaponClass: WeaponClasses;
	slots: number;
	attackType: string;
	hitType: string;
	hitBonus?: number;
	critRange?: number;
	critMult?: number;
	damage: string;
	damagePrecision?: string;
	damageType: Element;
	rangeType: string;
	range: number;
	rangePenalty: number;
	rangeIncrementsModifier: number;
	handed: number;
	size?: number;
	shape?: string;
	duration?: number;
	ammo: number;
	ammoCapacity: number;
	ammoReloadAmount: number;
	ammoType: string;
	isMagic: boolean;
	ranks?: number;
	buffsEquipped?: string;
	buffsActive?: string;
	perks?: string;
};
export type Weapon = DamageComponent & {
	name: string;
	flavortext: string;
	rarity: Rarity;
	element: Element;
	weaponClass: WeaponClasses;
	slots: number;
	handed: number;
	ammo: number;
	ammoCurrent: number;
	ammoCapacity: number;
	ammoReloadAmount: number;
	ammoType: string;
	isMagic: boolean;
	ranks: number;
	buffsEquipped: string;
	buffsActive: string;
	isEquipped: boolean;
	isActive: boolean;
	perks: Record<string, WeaponPerk>;
};
// Weapon Perks
type ImportedWeaponPerk = {
	name: string;
	description: string;
	passive: boolean;
	stacking: boolean;
	stacksMax: number;
	stackAffectedStats: string;
	replaceStats: boolean;
	attackType: string;
	hitType: string;
	hitBonus: number;
	critRange: number;
	critMult: number;
	damage: string;
	damagePrecision: string;
	damageType: Element;
	rangeType: string;
	range: number;
	rangePenalty: number;
	rangeIncrementsModifier: number;
	size: number;
	shape: string;
	duration: number;
	handed: number;
	ammo: number;
	ammoCapacity: number;
	ammoReloadAmount: number;
	ammoType: string;
	isMagic: boolean;
	buffs: string;
};
export type WeaponPerk = DamageComponent & {
	name: string;
	description: string;
	passive: boolean;
	isActive: boolean;
	stacking: boolean;
	stacksMax: number;
	stackAffectedStats: string[];
	stacks: number;
	replaceStats: boolean;
	ammo: number;
	ammoCapacity: number;
	ammoReloadAmount: number;
	ammoType: string;
	isMagic: boolean;
	buffs?: string;
};

// Armor Types
export type Armor = Characters & {
	name: string;
	flavortext?: string;
	description?: string;
	rarity: Rarity;
	isActivatable: boolean;
	isStacking: boolean;
	stacks: number;
	stacksMax?: number;
	stacksName?: string;
	coverage?: string;
	slots?: string;
	buffs?: string;
	buffCategory?: string;
	buffsCharged?: string;
	buffsChargedCategory?: string;
	//
	equipped: boolean;
	active: boolean;
};

// ABility Types
export type AbilityClass = 'Super' | 'Grenade' | 'Melee' | 'Class Ability' | 'Subcomponent';
type ImportedAbility = Characters &
	Ability & {
		groupNameList: string;
		prerequisiteList: string;
		buffList: string;
		partialPowerStatsList: string;
		partialPowerStepMultList: string;
		// For the damage stuff
		hitType: string;
		hitBonus: number;
		critRange: number;
		critMult: number;
		element: Element;
		range: number;
		size: number;
		shape: string;
		duration: number;
	};
export type Ability = {
	name: string;
	groupNames: string[];
	type: AbilityClass;
	flavortext: string;
	description: string;
	specialProperties: string;
	element: Element;
	prerequisites: string[];
	buffs: string[];
	damageStatsBase: DamageComponent;
	dmgDieQuantity: number;
	dmgDieFormula: string;
	dmg: DiceFormula;
	energyMax: number;
	partialPowerSteps: number;
	partialPowerStats: string[];
	partialPowerStepMults: number[];
	partialPowerAllowed: boolean;
	rangeType: string;
	handed: number;
};

// Quest Types
export type Quest = {
	name: string;
	iconURL: string;
	isMajor: boolean;
	description: string;
	progressValue?: number;
	progressMax?: number;
};

// Seasonal Artifact Types
export type ArtifactMod = {
	stage: number;
	name: string;
	description: string;
	buffs?: string;
	buffCategory?: string;
	hidden?: boolean;
	active: boolean;
};

const unwrapJSONPRegex = /google\.visualization\.Query\.setResponse\((.+)\);/;
const getSheetForCharacter = <T>(
	characterId: string,
	sheetName: SheetNames,
): NetworkDataState<T> => {
	const character = characterDataSources[characterId];
	if (!character) {
		throw new Error(`Invalid Character ID: ${characterId}`);
	}
	const { documentId, sheets } = character;
	const sheetKey = sheets[sheetName];
	return getNetworkDataStateForSheet(documentId, sheetKey);
};
type NetworkDataState<T> = {
	data: Ref<T[]>;
	isLoading: Ref<boolean>;
	refresh: VoidFunction;
};

let sheetCache: Record<string, NetworkDataState<unknown>> = {};
export const refreshCaches = () => (sheetCache = {});
const getNetworkDataStateForSheet = <T>(
	documentId: string,
	sheetKey: string,
	// todo: how to process the parameter before working with it.
): NetworkDataState<T> => {
	const cacheKey = documentId + ',' + sheetKey;
	if (sheetCache[cacheKey]) {
		// Return early if cached.
		return sheetCache[cacheKey] as NetworkDataState<T>;
	}
	const data = ref<T[]>([]) as Ref<T[]>;
	const isLoading = ref<boolean>(true);
	const refresh = () => {
		isLoading.value = true;
		getSheet<T>(documentId, sheetKey).then((networkResult) => {
			data.value = networkResult;
			isLoading.value = false;
		});
	};
	refresh();
	const result: NetworkDataState<T> = {
		data,
		isLoading,
		refresh,
	};
	sheetCache[cacheKey] = result;
	return result;
};
const getSheet = async <T>(documentId: string, sheetKey: string): Promise<T[]> => {
	const source = `https://docs.google.com/spreadsheets/d/${documentId}/gviz/tq?gid=${sheetKey}`;

	const text = await (await fetch(source)).text();
	const execResult = unwrapJSONPRegex.exec(text);
	if (!execResult) {
		throw new Error('Could not fetch properly shaped data from Google Sheets API');
	}
	const data = execResult[1];
	// console.log('data', data);
	const parsed = JSON.parse(data);
	// console.log('parsed', parsed);
	const flattened = columnsToFieldNames(parsed);
	// console.log('flattened', flattened);
	return flattened as T[];
};
function useCharacterDataUncached(characterId: string) {
	const character = computed<CharacterDataSource | undefined>(
		() => characterDataSources[characterId],
	);

	// ==================================================================================================
	// SKILLS START
	const {
		data: skillsThatNeedToBeFiltered,
		isLoading: skillsLoading,
		refresh: skillsRefresh,
	} = getSheetForCharacter<Skill>(characterId, 'skills');
	const skills = computed<Partial<Skill>>(() => {
		const activeSkills: Partial<Skill> = {};
		const skillList = Object.keys(skillsThatNeedToBeFiltered.value[0]);
		for (let i = 0; i < skillList.length; i++) {
			const skill = skillList[i];
			// const skillShortName = skill
			// 	.toLocaleLowerCase()
			// 	.slice(0, skill.indexOf('(') < 0 ? skill.length : skill.indexOf('('))
			// 	.trim();
			const skillKey = labelToSkillName[skill.toLocaleLowerCase()] as SkillKey;
			if (skillKey === undefined) {
				console.warn("Couldn't find the skill " + skill);
				continue;
			}
			const focus = skillsThatNeedToBeFiltered.value[0][skill as SkillKey];
			const skillInfo = skillsInfoMap[skillKey];
			const abilityMod =
				getFinalStat((skillInfo.baseStat + 'Skills') as StatsCalculatedKey) +
				getFinalStat(skillInfo.baseStat as StatsCalculatedKey);
			activeSkills[skillKey] = Math.trunc(
				focus * getFinalStat('cpl') + abilityMod + (focus > 0 ? 3 : 0),
			);
		}
		return activeSkills;
	});
	// SKILLS END

	// ==================================================================================================
	// BUFFS START
	const {
		data: allPartyBuffs,
		isLoading: partyBuffsLoading,
		refresh: refreshPartyBuffs,
	} = getNetworkDataStateForSheet<PartyBuffInfo>(
		partyDataSources.documentId,
		partyDataSources.sheets.buffs,
	);
	const {
		data: playerBuffs,
		isLoading: playerBuffsLoading,
		refresh: refreshPlayerBuffs,
	} = getSheetForCharacter<BuffInfo>(characterId, 'buffs');

	const partyBuffs = computed<BuffInfo[]>(() => {
		const filteredPartyBuffs: BuffInfo[] = allPartyBuffs.value.filter(
			(item) => item[characterId as CharacterNames],
		);
		const result = [
			...filteredPartyBuffs,
			...playerBuffs.value.map((buff) => {
				buff.isStory = buff.isStory || false;
				return buff;
			}),
			...weaponsAsBuffs.value,
			...armorsAsBuffs.value,
			...artifactAsBuffs.value,
		];
		return result.map((buff) => {
			buff.stacks = buff.stacks || 0;
			buff.active = buff.isPassive || buff.active || false;
			buff.type = buff.type || 'Buff';
			return buff;
		});
	});
	const buffsLoading = computed<boolean>(() => {
		return playerBuffsLoading.value || partyBuffsLoading.value;
	});
	const buffsRefresh = () => {
		refreshPartyBuffs();
		refreshPlayerBuffs();
	};

	const namesOfActivatedBuffs = ref<string[]>([]);
	const activatablePartyBuffs = computed<BuffInfo[]>(() =>
		partyBuffs.value.filter((buff) => !buff.isPassive),
	);
	const activatedPartyBuffs = computed<BuffInfo[]>(() => {
		const addThese = [
			...namesOfActivatedBuffs.value,
			...weapons.value
				.filter((weapon) => weapon.isEquipped)
				.map((weapon) => weapon.name + ' (Equipped)'),
			...weapons.value
				.filter((weapon) => weapon.isActive)
				.map((weapon) => weapon.name + ' (Active)'),
			...weapons.value
				.filter((weapon) => weapon.isActive)
				.map((weapon) => {
					const keys = Object.keys(weapon.perks);
					return keys.map((key) => {
						return weapon.name + ': ' + weapon.perks[key].name;
					});
				})
				.flat()
				.filter((item) => !!item),
			...namesOfEquippedArmor.value,
			...namesOfActiveArmor.value,
			...namesOfActiveArtifactMods.value,
		];
		const buffs = partyBuffs.value;
		buffs.forEach((buff) => {
			if (buff.isPassive || addThese.includes(buff.name)) {
				buff.active = true;
			} else {
				buff.active = false;
			}
		});
		return buffs.filter((buff) => buff.isPassive || addThese.includes(buff.name));
	});

	const buffArrayFlat = computed<BuffEffect[]>(() => {
		const allBuffs = activatedPartyBuffs.value;
		const result = allBuffs.map((buff) => getBuffEffects(buff, stats.value));
		return result.flat();
		// return buffs.map((buff) => getBuffEffects(buff, stats.value)).flat();
	});
	const buffsTallied = computed<CharacterBuffSummary>(() => {
		return tallyBuffs(buffArrayFlat.value, stats.value);
	});
	const buffsAsStats = computed<StatsCalculated>(() => {
		const statNames = Object.keys(labelMap);
		const newStats: StatsCalculated = Object.fromEntries(
			statNames.map((key) => [key, 0]),
		) as StatsCalculated;
		statNames.forEach((name) => {
			newStats[name as StatsCalculatedKey] = getFinalStat(name as StatsCalculatedKey);
		});
		return newStats;
	});
	const buffsStackUpdate = (name: string, amount: number) => {
		const targetBuff: BuffInfo | undefined = partyBuffs.value.find(
			(buff) => buff.name === name,
		);
		if (targetBuff !== undefined) {
			// If the buff was found...
			if (targetBuff.isStacking) {
				// ...and it stacks...
				targetBuff.stacks = amount;
				return targetBuff.stacks;
			}
			// The buff doesn't stack.
			console.error(
				'The buff ' + name + " doesn't stack but we tried to change its stack amount.",
			);
			return 0;
		}
		// The buff was not found.
		console.error(
			'The buff ' + name + " didn't exist when we tried to change its stack amount.",
		);
		return 0;
	};
	// BUFFS END

	// ==================================================================================================
	// WEAPONS START
	const {
		data: weaponsForFiltering,
		isLoading: weaponsLoading,
		refresh: weaponsRefresh,
	} = getNetworkDataStateForSheet<ImportedWeapon>(
		partyDataSources.documentId,
		partyDataSources.sheets.weapons,
	);
	const weapons = ref<Weapon[]>([]);
	const weaponEquip = (name: string, status: boolean) => {
		const target = weapons.value.find((weapon) => weapon.name === name);
		if (!!target) {
			target.isEquipped = status;
		}
	};
	const weaponActivate = (name: string, status: boolean) => {
		const target = weapons.value.find((weapon) => weapon.name === name);
		if (!!target) {
			target.isActive = status;
		}
	};
	const weaponPerkActivate = (weaponName: string, perkName: string, status: boolean) => {
		const targetWeapon = weapons.value.find((weapon) => weapon.name === weaponName);
		if (targetWeapon) {
			const targetPerk = targetWeapon.perks[perkName];
			if (targetPerk) {
				targetPerk.isActive = status;
			}
		}
	};
	const weaponPerkStackUpdate = (weaponName: string, perkName: string, stackCount: number) => {
		const targetWeapon = weapons.value.find((weapon) => weapon.name === weaponName);
		if (targetWeapon) {
			const targetPerk = targetWeapon.perks[perkName];
			if (targetPerk) {
				targetPerk.stacks = stackCount;
			}
		}
	};
	const weaponAmmoUpdate = (name: string, changeAmount: number) => {
		const targetWeapon: Weapon | undefined = weapons.value.find(
			(weapon) => weapon.name === name,
		);
		if (targetWeapon) {
			targetWeapon.ammoCurrent += changeAmount;
			return targetWeapon.ammoCurrent;
		} else {
			console.error('The weapon ' + name + " didn't exist when we tried to change its ammo.");
			return 0;
		}
	};
	const {
		data: weaponPerksForProcessing,
		isLoading: weaponPerksLoading,
		refresh: weaponPerksRefresh,
	} = getNetworkDataStateForSheet<ImportedWeaponPerk>(
		partyDataSources.documentId,
		partyDataSources.sheets.weaponPerks,
	);
	const weaponPerks = computed<WeaponPerk[]>(() => {
		return weaponPerksForProcessing.value.map((p: ImportedWeaponPerk) => {
			const damageStats = damageStringToDownstream(p.damage || '0', stats.value);
			const resultPerk: WeaponPerk = {
				name: p.name,
				description: p.description,
				passive: p.passive,
				isActive: p.passive,
				stacking: p.stacking,
				stacksMax: p.stacksMax,
				stackAffectedStats: (p.stackAffectedStats || '').split(', '),
				stacks: 0,
				replaceStats: p.replaceStats,
				// Damage Component
				attackType: p.attackType,
				hitType: p.hitType,
				hitBonus: p.hitBonus,
				critRange: p.critRange,
				critMult: p.critMult,
				damageFormula: damageStats.damageFormula,
				dmgShort: damageStats.dmgShort,
				dmgMin: damageStats.dmgMin,
				dmgAvg: damageStats.dmgAvg,
				dmgMax: damageStats.dmgMax,
				damageType: p.damageType,
				rangeType: p.rangeType,
				range: p.range,
				rangePenalty: p.rangePenalty || 2,
				rangeIncrementsModifier: p.rangeIncrementsModifier || p.range,
				size: p.size,
				shape: p.shape,
				duration: p.duration,
				//
				ammo: p.ammo,
				ammoCapacity: p.ammoCapacity,
				ammoReloadAmount: p.ammoReloadAmount || p.ammoCapacity,
				ammoType: p.ammoType,
				isMagic: p.isMagic,
				buffs: p.buffs,
			};
			return resultPerk;
		});
	});
	watch([weaponsForFiltering, weaponPerks], () => {
		weapons.value = weaponsForFiltering.value
			.filter((item) => item[characterId as CharacterNames])
			.map((ogWeapon) => {
				const damageBonus = computed<number>(() => {
					let result = 0;
					if (buffsTallied.value === undefined) {
						return result;
					}
					if (ogWeapon.rangeType === 'Melee') {
						result += getFinalStat('damageMelee');
					} else if (ogWeapon.rangeType === 'Ranged') {
						result += getFinalStat('damageRanged');
					} else if (ogWeapon.rangeType === 'Spell') {
						result += getFinalStat('damageSpell');
					}
					return result + (getFinalStat('damagePrecision') || 0);
				});
				const dmgStatStuff = damageStringToDownstream(
					(ogWeapon.damage || '0') + '+' + damageBonus.value,
					buffsAsStats.value,
				);
				const perkNameList = ogWeapon.perks?.split(', ') || [];
				const perkList: Record<string, WeaponPerk> = {};
				for (let i = 0; i < perkNameList.length; i++) {
					const targetPerk = weaponPerks.value.find(
						(perk) => perk.name === perkNameList[i],
					);
					if (targetPerk) {
						// It needs to be a copy of the perk or else it references
						// the original perk.
						perkList[perkNameList[i]] = { ...targetPerk };
					}
				}
				const weapon: Weapon = {
					name: ogWeapon.name,
					flavortext: ogWeapon.flavortext || '',
					rarity: ogWeapon.rarity,
					element: ogWeapon.element,
					weaponClass: ogWeapon.weaponClass,
					slots: ogWeapon.slots,
					// Damage Component
					attackType: ogWeapon.attackType,
					hitType: ogWeapon.hitType,
					hitBonus: ogWeapon.hitBonus || 0,
					critRange: ogWeapon.critRange || 0,
					critMult: ogWeapon.critMult || 0,
					damageFormula: dmgStatStuff.damageFormula,
					dmgShort: dmgStatStuff.dmgShort,
					dmgMin: dmgStatStuff.dmgMin,
					dmgAvg: dmgStatStuff.dmgAvg,
					dmgMax: dmgStatStuff.dmgMax,
					damageType: ogWeapon.damageType,
					rangeType: ogWeapon.rangeType,
					range: ogWeapon.range,
					rangePenalty: ogWeapon.rangePenalty || 2,
					rangeIncrementsModifier:
						ogWeapon.rangeIncrementsModifier || ogWeapon.range || 1,
					size: ogWeapon.size || 0,
					shape: ogWeapon.shape || '',
					duration: ogWeapon.duration || 0,
					//
					handed: ogWeapon.handed,
					ammo: ogWeapon.ammo,
					ammoCurrent: ogWeapon.ammoCapacity,
					ammoCapacity: ogWeapon.ammoCapacity,
					ammoReloadAmount: ogWeapon.ammoReloadAmount || ogWeapon.ammoCapacity,
					ammoType: ogWeapon.ammoType,
					isMagic: ogWeapon.isMagic,
					ranks: ogWeapon.ranks || 0,
					buffsEquipped: ogWeapon.buffsEquipped || '',
					buffsActive: ogWeapon.buffsActive || '',
					isEquipped: false,
					isActive: false,
					perks: perkList,
				};
				// Put whether or not the weapon is active / equipped from Local Storage here!!
				return weapon;
			});
	});
	const weaponsAsBuffs = computed<BuffInfo[]>(() => {
		// using the weapons computed from above causes a cyclic dependency,
		// thankfully we don't need those buffs, or even character filtering here.
		const weaponsList = weapons.value;
		// if (!namesOfEquippedWeapons.value.length && !namesOfActiveWeapons.value.length) {
		// 	return [];
		// }
		const resultEquipped = weaponsList
			.filter((weapon) => weapon.isEquipped)
			.map((weapon) => {
				const buffString =
					'Weapons Equipped +' +
					weapon.slots +
					(!!weapon.buffsEquipped ? ', ' + weapon.buffsEquipped : '');
				const newBuff: BuffInfo = {
					name: weapon.name + ' (Equipped)',
					type: 'Hidden',
					category: 'Misc',
					isStory: false,
					stacks: 0,
					effects: buffString || '',
					active: true,
				};
				return newBuff;
			});
		const resultActive = weaponsList
			.filter((weapon) => weapon.isEquipped)
			.map((weapon) => {
				const buffString =
					'Hands Used +' +
					weapon.handed +
					(!!weapon.buffsActive ? ', ' + weapon.buffsActive : '');
				const newBuff: BuffInfo = {
					name: weapon.name + ' (Active)',
					type: 'Hidden',
					category: 'Misc',
					isStory: false,
					stacks: 0,
					effects: buffString || '',
					active: true,
				};
				return newBuff;
			});
		const fromPerks = weaponsList
			.filter((weapon) => weapon.isActive)
			.map((weapon) => {
				const keys = Object.keys(weapon.perks).filter(
					(key) => weapon.perks[key].isActive && weapon.perks[key].buffs,
				);
				return keys.map((key) => {
					const perk = weapon.perks[key];
					return <BuffInfo>{
						name: weapon.name + ': ' + perk.name,
						type: 'Hidden',
						category: 'Misc',
						isStory: false,
						stacks: perk.stacks || 0,
						effects: perk.buffs,
						active: true,
					};
				});
			})
			.flat()
			.filter((item) => item !== undefined);
		return [...resultEquipped, ...resultActive, ...fromPerks];
	});
	// WEAPONS END

	// ==================================================================================================
	// ARMOR START
	const {
		data: armorForFiltering,
		isLoading: armorLoading,
		refresh: armorRefresh,
	} = getNetworkDataStateForSheet<Armor>(
		partyDataSources.documentId,
		partyDataSources.sheets.armor,
	);
	const armor = computed<Armor[]>(() => {
		const filteredArmors = armorForFiltering.value.filter(
			(item) => item[characterId as CharacterNames],
		);
		return filteredArmors.map((item) => {
			if (item.stacks === undefined) {
				item.stacks = 0;
			}
			if (item.rarity === undefined) {
				item.rarity = 'Common';
			}
			if (item.coverage === undefined) {
				item.coverage = (item.slots || '').match(/^[A-Za-z]+ /)?.join('') || '';
			}
			//
			if (namesOfEquippedArmor.value.includes(item.name + ' (Equipped)')) {
				item.equipped = true;
			} else {
				item.equipped = false;
			}
			if (namesOfActiveArmor.value.includes(item.name + ' (Active)')) {
				item.active = true;
			} else {
				item.active = false;
			}
			//
			if (item.buffs) {
				item.buffs.replace(/charges/g, actionResources.value.armorCharges + '');
			}
			if (item.buffsCharged) {
				item.buffsCharged.replace(/charges/g, actionResources.value.armorCharges + '');
			}
			return item;
		});
	});
	const namesOfEquippedArmor = ref<string[]>([]);
	const namesOfActiveArmor = ref<string[]>([]);
	const armorsAsBuffs = computed<BuffInfo[]>(() => {
		const passive = armor.value
			.filter((buff) => namesOfEquippedArmor.value.includes(buff.name + ' (Equipped)'))
			.map((armor) => {
				const buffString = armor.buffs
					? armor.buffs + (armor.slots ? ', ' + armor.slots : '')
					: armor.slots;
				const newBuff: BuffInfo = {
					name: armor.name + ' (Equipped)',
					type: 'Hidden',
					category: armor.buffCategory,
					isStory: false,
					isStacking: !!armor.stacksMax || armor.isStacking,
					stacks: armor.stacks,
					effects: buffString || '',
					active: true,
				};
				return newBuff;
			});
		const active = armor.value
			.filter((buff) => namesOfActiveArmor.value.includes(buff.name + ' (Active)'))
			.map((armor) => {
				const newBuff: BuffInfo = {
					name: armor.name + ' (Active)',
					type: 'Hidden',
					category: armor.buffsChargedCategory || 'Misc',
					isStory: false,
					isStacking: !!armor.stacksMax || armor.isStacking,
					stacks: armor.stacks,
					effects: armor.buffsCharged || '',
					active: true,
				};
				return newBuff;
			});
		return [...passive, ...active];
	});
	const armorStackUpdate = (name: string, amount: number) => {
		const targetArmor = armor.value.find((armor) => armor.name === name);
		if (targetArmor !== undefined) {
			targetArmor.stacks = amount;
		} else {
			console.error(
				'The armor ' + name + " didn't exist when we tried to change its stack amount.",
			);
		}
		const downstreamBuffs = partyBuffs.value.filter(
			(buff) => buff.name === name + ' (Equipped)' || buff.name === name + ' (Active)',
		);
		downstreamBuffs.forEach((targetBuff) => {
			if (targetBuff !== undefined) {
				// If the buff was found...
				if (targetBuff.isStacking) {
					// ...and it stacks...
					targetBuff.stacks = amount;
					return targetBuff.stacks;
				}
				// The buff doesn't stack.
				console.error(
					'The buff ' + name + " doesn't stack but we tried to change its stack amount.",
				);
			} else {
				// The buff was not found.
				console.error(
					'The buff ' + name + " didn't exist when we tried to change its stack amount.",
				);
			}
		});
	};

	// ARMOR END

	// ==================================================================================================
	// ABILITIES START
	const {
		data: abilitiesThatNeedToBeFiltered,
		isLoading: abilitiesLoading,
		refresh: abilitiesRefresh,
	} = getNetworkDataStateForSheet<ImportedAbility>(
		partyDataSources.documentId,
		partyDataSources.sheets.abilities,
	);
	const abilities = computed<Ability[]>(() => {
		return abilitiesThatNeedToBeFiltered.value
			.filter((item) => item[characterId as CharacterNames] && item.name)
			.map((ability) => {
				const parsedAbility = { ...ability };
				// Defaults
				parsedAbility.groupNames = parsedAbility.groupNames || [];
				parsedAbility.type = parsedAbility.type || 'Melee';
				parsedAbility.flavortext = parsedAbility.flavortext || '';
				parsedAbility.description = parsedAbility.description || '';
				parsedAbility.specialProperties = parsedAbility.specialProperties || '';
				parsedAbility.element = parsedAbility.element || 'Kinetic';
				parsedAbility.prerequisites = parsedAbility.prerequisites || [];
				// parsedAbility.damageStatsBase = parsedAbility.damageStatsBase || {};
				parsedAbility.dmgDieQuantity = parsedAbility.dmgDieQuantity || 0;
				parsedAbility.dmgDieFormula = parsedAbility.dmgDieFormula || '';
				// parsedAbility.dmg = parsedAbility.dmg || ;
				parsedAbility.energyMax = parsedAbility.energyMax || 0;
				parsedAbility.partialPowerSteps = parsedAbility.partialPowerSteps || 0;
				parsedAbility.partialPowerStats = parsedAbility.partialPowerStats || [];
				parsedAbility.partialPowerStepMults = parsedAbility.partialPowerStepMults || [];
				parsedAbility.partialPowerAllowed = parsedAbility.partialPowerAllowed || false;
				parsedAbility.rangeType = parsedAbility.rangeType || 'Melee';
				parsedAbility.handed = parsedAbility.handed || 0;
				//
				parsedAbility.groupNames = (ability.groupNameList || ability.name)
					.split(', ')
					.filter((item) => !!item);
				parsedAbility.prerequisites = (ability.prerequisiteList || '')
					.split(', ')
					.filter((item) => !!item);
				parsedAbility.buffs = (ability.buffList || '').split(', ').filter((item) => !!item);
				parsedAbility.partialPowerStats = (ability.partialPowerStatsList || '')
					.split(', ')
					.filter((item) => !!item);
				parsedAbility.partialPowerStepMults = (ability.partialPowerStepMultList || '')
					.split(', ')
					.filter((item) => !!item)
					.map((num) => parseFloat(num));
				const newDamage = parsedAbility.dmgDieQuantity + parsedAbility.dmgDieFormula;
				parsedAbility.damageStatsBase = {
					...damageStringToDownstream(newDamage, stats.value),
					attackType: 'Ability',
					hitType: ability.hitType,
					hitBonus: ability.hitBonus,
					critRange: ability.critRange,
					critMult: ability.critMult,
					damageType: ability.element,
					rangeType: 'Spell',
					range: ability.range,
					rangePenalty: 2,
					rangeIncrementsModifier: ability.range,
					size: ability.size,
					shape: ability.shape,
					duration: ability.duration,
				};
				parsedAbility.dmg = new DiceFormula(newDamage);
				return parsedAbility;
			});
	});
	const abilityGroups = computed<Record<string, string[]>>(() => {
		const groups: Record<string, string[]> = {};
		abilities.value.forEach((ability) => {
			ability.groupNames.forEach((groupName) => {
				if (ability.type !== 'Subcomponent') {
					if (groups[ability.name] === undefined) {
						groups[ability.name] = [];
					}
				} else {
					if (groups[groupName] === undefined) {
						groups[groupName] = [ability.name];
					} else {
						groups[groupName].push(ability.name);
					}
				}
			});
		});
		return groups;
	});

	// ABILITIES END

	// ==================================================================================================
	// QUESTS START
	const {
		data: questsThatNeedToBeFiltered,
		isLoading: questsLoading,
		refresh: questsRefresh,
	} = getNetworkDataStateForSheet<Quest>(
		partyDataSources.documentId,
		partyDataSources.sheets.quests,
	);
	const quests = computed<Quest[]>(() => {
		return questsThatNeedToBeFiltered.value
			.filter((item) => item.name)
			.map((quest) => {
				if (!quest.iconURL) {
					quest.iconURL =
						'https://destiny.wiki.gallery/images/7/71/Vanguard_elite_daily_bounty1.jpg';
				}
				return quest;
			});
	});
	// QUESTS END

	// ==================================================================================================
	// ARTIFACT START

	const {
		data: artifactModsForProcessing,
		isLoading: artifactLoading,
		refresh: artifactRefresh,
	} = getNetworkDataStateForSheet<ArtifactMod>(
		partyDataSources.documentId,
		partyDataSources.sheets.artifact,
	);
	const namesOfActiveArtifactMods = ref<string[]>([]);
	const artifactMods = computed<ArtifactMod[]>(() => {
		return artifactModsForProcessing.value.map((item) => {
			if (namesOfActiveArtifactMods.value.includes(item.name)) {
				item.active = true;
			} else {
				item.active = false;
			}
			return item;
		});
	});
	const artifactAsBuffs = computed<BuffInfo[]>(() => {
		const result = artifactMods.value
			.filter((artifactMod) => artifactMod.active)
			.map((artifactMod) => {
				const newBuff: BuffInfo = {
					name: artifactMod.name,
					type: 'Hidden',
					category: artifactMod.buffCategory || 'Misc',
					isStory: false,
					stacks: 0,
					effects: artifactMod.buffs || '',
					active: true,
				};
				return newBuff;
			});
		return result;
	});
	// ARTIFACT END

	// ==================================================================================================
	// STATS START
	const {
		data: statsArray,
		isLoading: statsLoading,
		refresh: statsRefresh,
	} = getSheetForCharacter<StatSheet>(characterId, 'variables');
	const statsImported = computed<StatSheet>(() => statsArray.value[0]);
	const stats = computed<StatsCalculated>(() => {
		const source = statsImported.value;
		if (!source) {
			return Object.fromEntries(
				Object.keys(labelMap).map((key) => [key, 0]),
			) as StatsCalculated;
		}
		// Buff tallying goes here.
		// The object below is where "default values" live.
		const result: StatsCalculated = {
			actionsMoveBaseLand: 30,
			actionsMoveBaseSwim: 0,
			actionsMoveBaseFly: 0,
			actionsMoveBaseClimb: 0,
			actionsMoveMult: 1,
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
			drArc: 0,
			drFFArc: 0,
			resistArc: 0,
			drSolar: 0,
			drFFSolar: 0,
			resistSolar: 0,
			drVoid: 0,
			drFFVoid: 0,
			resistVoid: 0,
			drStasis: 0,
			drFFStasis: 0,
			resistStasis: 0,
			drStrand: 0,
			drFFStrand: 0,
			resistStrand: 0,
			drPrismatic: 0,
			drFFPrismatic: 0,
			resistPrismatic: 0,
			drDark: 0,
			drFFDark: 0,
			resistDark: 0,
			capacityCarrying: 0,
			capacityKinetic: 0,
			capacitySpecial: 18,
			capacityHeavy: 8,
			energyMelee: source.energyMelee,
			energyGrenade: source.energyGrenade,
			energySuper: source.energySuper,
			energyClass: source.energyClass,
			energyMeleeRecharge: 1,
			energyGrenadeRecharge: 1,
			energySuperRecharge: 1,
			energyClassRecharge: 1,
			rerolls: 0,
			slotsArmorHead: 3,
			slotsArmorArm: 3,
			slotsArmorChest: 3,
			slotsArmorLegs: 3,
			slotsArmorClass: 1,
			slotsArmorFull: 1,
			slotsArmorExotic: 1,
			equipArmorHead: 0,
			equipArmorArm: 0,
			equipArmorChest: 0,
			equipArmorLegs: 0,
			equipArmorClass: 0,
			equipArmorFull: 0,
			equipArmorExotic: 0,
			slotsWeapon: 3,
			slotsWeaponUsed: 0,
			hands: 2,
			handsUsed: 0,
			equipAspects: 0,
			equipFragments: 0,
			slotsAspects: 0,
			slotsFragments: 0,
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
			hpRecharge: 0,
			hpTempMax: 0,
			hpShieldMax: 0,
			hpShieldRecharge: 0,
			hpShieldKinetic: 0,
			hpShieldSolar: 0,
			hpShieldArc: 0,
			hpShieldVoid: 0,
			hpShieldStasis: 0,
			hpShieldStrand: 0,
			hpShieldPrismatic: 0,
			hpShieldType: 0,
			skillFocus: source.skillFocus,
			energyUniversal: 0,
			energyUniversalRecharge: 0,
			armor: source.armor,
			armorNatural: source.armorNatural,
			armorShield: source.armorShield,
			armorDeflection: source.armorDeflection,
			armorDodge: source.armorDodge,
			bab: source.babPerLevel * source.cpl,
			bdb: source.bdbPerLevel * source.cpl,
			str: 0,
			dex: 0,
			con: 0,
			int: 0,
			wis: 0,
			cha: 0,
			rolls: 0,
			actionsAttack: source.attacks,
			actionsMove: source.moves,
			actionsReaction: source.reactions,
			actionsBonus: 0,
			strScore: source.strScore,
			dexScore: source.dexScore,
			conScore: source.conScore,
			intScore: source.intScore,
			wisScore: source.wisScore,
			chaScore: source.chaScore,
			cpl: source.cpl,
			weightBase: 0, // ???
			weightCurrent: 0, // ???
			weightTotal: 0, // ???
			size: source.size,
			reach: sizeMap[source.size || 0].reach,
			encumberance: 0, // ???
			babPerLevel: source.babPerLevel,
			bdbPerLevel: source.bdbPerLevel,
			hpPerLevel: source.hpPerLevel,
			fortPerLevel: source.fortPerLevel,
			refPerLevel: source.refPerLevel,
			willPerLevel: source.willPerLevel,
			artifact: 0,
		};
		statsDistribute(result);
		return result;
	});
	const getFinalStat = (name: StatsCalculatedKey) => {
		if (buffsTallied.value[name] === undefined) {
			if (stats.value[name] === undefined) {
				return 0;
			} else {
				return stats.value[name];
			}
		} else {
			return buffsTallied.value[name].total;
		}
	};
	const actionResourcesLocal = JSON.parse(
		localStorage.getItem(characterId + '_actionResources') || 'null',
	);
	const actionResources = ref<Record<string, number>>(
		!!actionResourcesLocal
			? { ...actionResourcesLocal }
			: {
					subclassIndex: 0,
					turns: 0,
					health: getFinalStat('hpMax'),
					shields: getFinalStat('hpShieldMax'),
					actionsMove: getFinalStat('actionsMove'),
					actionsAttack: getFinalStat('actionsAttack'),
					actionsReaction: getFinalStat('actionsReaction'),
					actionsOther: getFinalStat('actionsBonus'),
					ammoKinetic: getFinalStat('capacityKinetic'),
					ammoSpecial: getFinalStat('capacitySpecial'),
					ammoHeavy: getFinalStat('capacityHeavy'),
					energySuper: getFinalStat('energySuper'),
					energyMelee: getFinalStat('energyMelee'),
					energyGrenade: getFinalStat('energyGrenade'),
					energyClass: getFinalStat('energyClass'),
					energyUniversal: getFinalStat('energyUniversal'),
					armorCharges: getFinalStat('capacityArmorCharge'),
					targetRange: 0,
				},
	);
	// const actionResources = ref<Record<string, number>>({
	// 	subclassIndex: 0,
	// 	turns: 0,
	// 	health: getFinalStat('hpMax'),
	// 	shields: getFinalStat('hpShieldMax'),
	// 	actionsMove: getFinalStat('actionsMove'),
	// 	actionsAttack: getFinalStat('actionsAttack'),
	// 	actionsReaction: getFinalStat('actionsReaction'),
	// 	actionsOther: getFinalStat('actionsBonus'),
	// 	ammoKinetic: getFinalStat('capacityKinetic'),
	// 	ammoSpecial: getFinalStat('capacitySpecial'),
	// 	ammoHeavy: getFinalStat('capacityHeavy'),
	// 	energySuper: getFinalStat('energySuper'),
	// 	energyMelee: getFinalStat('energyMelee'),
	// 	energyGrenade: getFinalStat('energyGrenade'),
	// 	energyClass: getFinalStat('energyClass'),
	// 	energyUniversal: getFinalStat('energyUniversal'),
	// 	armorCharges: getFinalStat('capacityArmorCharge'),
	// 	targetRange: 0,
	// });
	watch(statsImported, () => {
		if (!localStorage.getItem(characterId + '_actionResources')) {
			const elementKeys = Object.keys(elements);
			actionResources.value.subclassIndex = elementKeys.findIndex(
				// Update what subclass you are when data's done being imported.
				(element) => element === statsImported.value.guardianSubclass,
			);
		}
	});
	watch(actionResources.value, () => {
		// Store the current state of `actionResources` to Local Storage whenever it changes.
		console.log('Action resources changed!');
		localStorage.setItem(
			characterId + '_actionResources',
			JSON.stringify(actionResources.value),
		);
	});
	const actionResourceUpdate = (destination: keyof ActionResource, amount: number) => {
		actionResources.value[destination] += amount;
	};
	const subclassGet = computed<Element>(
		() => Object.keys(elements)[actionResources.value.subclassIndex] as Element,
	);
	const subclassSet = (element: Element) => {
		actionResources.value.subclassIndex = Math.max(
			0,
			Object.keys(elements).findIndex((a) => a === element),
		);
	};

	// STATS END

	// ==================================================================================================
	// Export Stuff
	const composable = {
		// Characters
		character,
		// Buffs
		buffs: partyBuffs,
		namesOfActivatedBuffs,
		activatablePartyBuffs,
		activatedPartyBuffs,
		buffsStackUpdate,
		buffArrayFlat,
		buffsTallied,
		buffsAsStats,
		buffsLoading,
		buffsRefresh,
		// Skills
		skills,
		skillsLoading,
		skillsRefresh,
		// Weapons
		weapons,
		weaponAmmoUpdate,
		weaponEquip,
		weaponActivate,
		weaponPerkActivate,
		weaponPerkStackUpdate,
		weaponsLoading: weaponsLoading && weaponPerksLoading,
		weaponsRefresh,
		weaponPerks,
		weaponPerksLoading,
		weaponPerksRefresh,
		damageStringToDownstream,
		// Armors
		armor,
		namesOfEquippedArmor,
		namesOfActiveArmor,
		armorStackUpdate,
		armorLoading,
		armorRefresh,
		// Abilities
		abilities,
		abilityGroups,
		abilitiesLoading,
		abilitiesRefresh,
		// Quests
		quests,
		questsLoading,
		questsRefresh,
		// Artifact
		artifactMods,
		namesOfActiveArtifactMods,
		artifactLoading,
		artifactRefresh,
		// Stats
		statsBase: statsImported,
		actionResources,
		actionResourceUpdate,
		subclassGet,
		subclassSet,
		getFinalStat,
		stats,
		statsLoading,
		statsRefresh,
	};
	return composable;
}

const characterDataComposableForEachCharacter: Record<
	string,
	ReturnType<typeof useCharacterDataUncached>
> = {};
export default function useCharacterData(
	characterId: string,
): ReturnType<typeof useCharacterDataUncached> {
	if (characterDataComposableForEachCharacter[characterId]) {
		return characterDataComposableForEachCharacter[characterId];
	}
	const composable = useCharacterDataUncached(characterId);
	characterDataComposableForEachCharacter[characterId] = composable;
	return composable;
}
