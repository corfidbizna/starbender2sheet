import {
	getBuffEffects,
	tallyBuffs,
	type BuffEffect,
	type BuffInfo,
	type CharacterBuffSummary,
	type PartyBuffInfo,
} from '@/business_logic/buffs';
import { DiceFormula, getStatByCharacter } from '@/business_logic/diceFormula';
import { updateLog } from '@/sharedState';
import { computed, ref, type Ref, type ComputedRef } from 'vue';

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
		armor: string;
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
			skills: '544688264',
			variables: '1217161183',
			buffs: '-1',
		},
	},
};
// Party Sheet IDs
export const partyDataSources: PartyDataSource = {
	documentId: '1agznHO98JumWB896PpQZ3eJQGIJwEIivChTurlwu5H8',
	sheets: {
		weapons: '0',
		armor: '31916088',
		buffs: '1462505437',
		quests: '745911680',
		artifact: '187064580',
	},
};
// A list of all character names, used as keys in certian dynamic situations
// and thus needs to be a type for TypeScript reasons.
export type CharacterNames = 'aurora' | 'kara' | 'mark' | 'lewis';

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
	Kinetic: 0,
	Solar: 1,
	Arc: 2,
	Void: 3,
	Stasis: 4,
	Strand: 5,
	Prismatic: 6,
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
	ac: number;
	acFF: number;
	acTouch: number;
	acFFTouch: number;
	drBase: number;
	dr: number;
	drFF: number;
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
	equipAspects: number;
	equipFragments: number;
	capacityArmorCharge: number;
	toHitRanged: number;
	toHitMelee: number;
	toHitSpell: number;
	damageMelee: number;
	damageRanged: number;
	damageSpell: number;
	damagePrecision: number;
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
	hpMax: number;
	hpTempMax: number;
	hpShieldMax: number;
	hpShieldType: number;
	skillFocus: number;
	energyUniversal: number;
	energyUniversalRecharge: number;
	armor: number;
	armorNatural: number;
	armorShield: number;
	armorDeflection: number;
	armorDodge: number;
	bab: number;
	bdb: number;
	str: number;
	dex: number;
	con: number;
	int: number;
	wis: number;
	cha: number;
	rolls: number;
	actionsAttack: number;
	actionsMove: number;
	actionsReaction: number;
	actionsBonus: number;
	strScore: number;
	dexScore: number;
	conScore: number;
	intScore: number;
	wisScore: number;
	chaScore: number;
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
	equipAspects: 'number',
	equipFragments: 'number',
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
	hpTempMax: 'Max Temp HP',
	hpShieldMax: 'Max Shield HP',
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
};
export type CapacityBoxStatField = {
	label: string;
	stat: string;
	color?: string;
	hovertext?: string;
	max: number;
	current: number;
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
};

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
	knowledge: number;
	knowledgeArcana: number;
	knowledgeDungeoneering: number;
	knowledgeEngineering: number;
	knowledgeGeography: number;
	knowledgeHistory: number;
	knowledgeLocal: number;
	knowledgeNature: number;
	knowledgeNobility: number;
	knowledgePlanes: number;
	knowledgeReligion: number;
	linguistics: number;
	spellcraft: number;
	// Wis Skills
	wis: number;
	heal: number;
	perception: number;
	profession: number;
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
		description: 'Climb Surfaces, Catch from falling',
	},
	swim: {
		label: 'Swim',
		baseStat: 'str',
		description: 'text',
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
		description: 'text',
	},
	disableDevice: {
		label: 'Disable Device',
		baseStat: 'dex',
		description: 'text',
	},
	escapeArtist: {
		label: 'Escape Artist',
		baseStat: 'dex',
		description: 'text',
	},
	fly: {
		label: 'Fly',
		baseStat: 'dex',
		description: 'text',
	},
	ride: {
		label: 'Ride',
		baseStat: 'dex',
		description: 'text',
	},
	sleightOfHand: {
		label: 'Sleight of Hand',
		baseStat: 'dex',
		description: 'text',
	},
	stealth: {
		label: 'Stealth',
		baseStat: 'dex',
		description: 'text',
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
		description: 'text',
	},
	craft: {
		label: 'Craft',
		baseStat: 'int',
		description: 'text',
	},
	knowledge: {
		label: 'Knowledge',
		baseStat: 'int',
		description: 'text',
	},
	knowledgeArcana: {
		label: 'Knowledge (Arcana)',
		baseStat: 'int',
		description: 'text',
	},
	knowledgeDungeoneering: {
		label: 'Knowledge (Dungeoneering)',
		baseStat: 'int',
		description: 'text',
	},
	knowledgeEngineering: {
		label: 'Knowledge (Engineering)',
		baseStat: 'int',
		description: 'text',
	},
	knowledgeGeography: {
		label: 'Knowledge (Geography)',
		baseStat: 'int',
		description: 'text',
	},
	knowledgeHistory: {
		label: 'Knowledge (History)',
		baseStat: 'int',
		description: 'text',
	},
	knowledgeLocal: {
		label: 'Knowledge (Local)',
		baseStat: 'int',
		description: 'text',
	},
	knowledgeNature: {
		label: 'Knowledge (Nature)',
		baseStat: 'int',
		description: 'text',
	},
	knowledgeNobility: {
		label: 'Knowledge (Nobility)',
		baseStat: 'int',
		description: 'text',
	},
	knowledgePlanes: {
		label: 'Knowledge (Planes)',
		baseStat: 'int',
		description: 'text',
	},
	knowledgeReligion: {
		label: 'Knowledge (Religion)',
		baseStat: 'int',
		description: 'text',
	},
	linguistics: {
		label: 'Linguistics',
		baseStat: 'int',
		description: 'text',
	},
	spellcraft: {
		label: 'Spellcraft',
		baseStat: 'int',
		description: 'text',
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
		description: 'text',
	},
	perception: {
		label: 'Perception',
		baseStat: 'wis',
		description: 'text',
	},
	profession: {
		label: 'Profession',
		baseStat: 'wis',
		description: 'text',
	},
	senseMotive: {
		label: 'Sense Motive',
		baseStat: 'wis',
		description: 'text',
	},
	survival: {
		label: 'Survival',
		baseStat: 'wis',
		description: 'text',
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
		description: 'text',
	},
	diplomacy: {
		label: 'Diplomacy',
		baseStat: 'cha',
		description: 'text',
	},
	disguise: {
		label: 'Disguise',
		baseStat: 'cha',
		description: 'text',
	},
	handleAnimal: {
		label: 'Handle Animal',
		baseStat: 'cha',
		description: 'text',
	},
	intimidate: {
		label: 'Intimidate',
		baseStat: 'cha',
		description: 'text',
	},
	perform: {
		label: 'Perform',
		baseStat: 'cha',
		description: 'text',
	},
	useMagicDevice: {
		label: 'Use Magic Device',
		baseStat: 'cha',
		description: 'text',
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
export type ImportedWeapon = {
	aurora: boolean;
	kara: boolean;
	mark: boolean;
	lewis: boolean;
	Name: string;
	Flavortext?: string;
	Rarity: Rarity;
	Element: Element;
	WeaponClass: WeaponClasses;
	AttackType: string;
	HitType: string;
	HitBonus?: number;
	CritRange?: number;
	CritMult?: number;
	Damage: string;
	DamageType: Element;
	RangeType: string;
	Range: number;
	Handed: number;
	Size?: number;
	Shape?: string;
	Duration?: number;
	Ammo: number;
	AmmoCapacity: number;
	AmmoType: string;
	IsMagic: boolean;
	Perks?: string;
};
export type Weapon = ImportedWeapon & {
	DamageFormula: DiceFormula;
	DmgMin: number;
	DmgMax: number;
	DmgAvg: number;
	DmgShort: string;
	AmmoCurrent: number;
};
// The types describing armor.
export type Armor = {
	aurora: boolean;
	kara: boolean;
	mark: boolean;
	lewis: boolean;
	name: string;
	flavortext?: string;
	description?: string;
	rarity: Rarity;
	chargesMax?: number;
	coverage?: string;
	slots?: string;
	buffs?: string;
	buffCategory?: string;
	//
	equipped: boolean;
};

// The type describing a quest info block.
export type Quest = {
	name: string;
	iconURL: string;
	isMajor: boolean;
	description: string;
	progressValue: number;
	progressMax: number;
};

// The type describing a Seasonal Artifact thingey.
export type ArtifactMod = {
	stage: number;
	name: string;
	description: string;
	buffs: string;
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
			activeSkills[skillKey] = focus * getFinalStat('cpl') + abilityMod + (focus > 0 ? 3 : 0);
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
		const result = [...filteredPartyBuffs, ...playerBuffs.value];
		// for (let i = 0; i < result.length; i++) {
		// 	result[i].stacks = ref<number>(490);
		// 	if (result[i].isPassive) {
		// 		result[i].active = true;
		// 	} else result[i].active = false;
		// 	return result;
		// }
		// return result;
		return result.map((buff) => {
			buff.stacks = 0;
			if (buff.isPassive) {
				buff.active = true;
			} else buff.active = false;
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
		const addThese = namesOfActivatedBuffs.value;
		const buffs = partyBuffs.value;
		return buffs.filter((buff) => buff.isPassive || addThese.includes(buff.name));
	});

	const buffArrayFlat = computed<BuffEffect[]>(() => {
		const allBuffs = activatedPartyBuffs.value;
		const allArmors = armorsAsBuffs.value;
		const result = [
			...allBuffs.map((buff) => getBuffEffects(buff, stats.value)),
			...allArmors.map((buff) => getBuffEffects(buff, stats.value)),
		];
		return result.flat();
		// return buffs.map((buff) => getBuffEffects(buff, stats.value)).flat();
	});
	const buffsTallied = computed<CharacterBuffSummary>(() => {
		return tallyBuffs(buffArrayFlat.value, stats.value);
	});
	const buffsAsStats = computed<StatsCalculated>(() => {
		const newStats: StatsCalculated = {
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
			artifact: 0,
		};
		const statNames = Object.keys(newStats);
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
	} = getNetworkDataStateForSheet<Weapon>(
		partyDataSources.documentId,
		partyDataSources.sheets.weapons,
	);
	const weapons = computed<Weapon[]>(() => {
		const filteredWeapons = weaponsForFiltering.value.filter(
			(item) => item[characterId as CharacterNames],
		);
		const statFunction = getStatByCharacter(buffsAsStats.value);
		// const statFunction = getStatByCharacter(stats.value);
		return filteredWeapons.map((weapon) => {
			const damageBonus = computed<number>(() => {
				let result = 0;
				if (weapon.RangeType === 'Melee') {
					result += getFinalStat('damageMelee');
				} else if (weapon.RangeType === 'Ranged') {
					result += getFinalStat('damageRanged');
				} else if (weapon.RangeType === 'Spell') {
					result += getFinalStat('damageSpell');
				}
				return result + (getFinalStat('damagePrecision') || 0);
			});
			// const formula = new DiceFormula(weapon.Damage);
			const formula = new DiceFormula(weapon.Damage + '+' + damageBonus.value);
			// const formula = new DiceFormula(
			// 	weapon.Damage + '+' + damageBonus.value,
			// ).evaluateExceptDice((name: string) => getFinalStat(name as StatsCalculatedKey));
			weapon.DamageFormula = formula;
			weapon.DmgMin = formula.min(statFunction);
			weapon.DmgMax = formula.max(statFunction);
			weapon.DmgAvg = formula.mean(statFunction);
			weapon.DmgShort = formula.evaluateExceptDice(statFunction).stringify();
			weapon.AmmoCurrent = weapon.AmmoCapacity;
			return weapon;
		});
	});
	const weaponAmmoUpdate = (name: string, changeAmount: number) => {
		const targetWeapon: Weapon | undefined = weapons.value.find(
			(weapon) => weapon.Name === name,
		);
		if (targetWeapon) {
			targetWeapon.AmmoCurrent += changeAmount;
			return targetWeapon.AmmoCurrent;
		} else {
			console.error('The weapon ' + name + " didn't exist when we tried to change its ammo.");
			return 0;
		}
	};
	type WeaponSlot = 'a' | 'b' | 'c';
	const weaponSlots = ref<Record<WeaponSlot, string>>({
		a: '',
		b: '',
		c: '',
	});
	const weaponSlotUpdate = (slot: WeaponSlot, name: string) => {
		const otherKeys = Object.keys(weaponSlots);
		otherKeys.forEach((key) => {
			if (weaponSlots.value[key as WeaponSlot] === name) {
				if (key !== slot) {
					// The weapon was already in a slot and it wasn't the target one.
					const register = weaponSlots.value[slot];
					weaponSlots.value[slot] = name;
					weaponSlots.value[key as WeaponSlot] = register;
					updateLog(
						'The weapon ' +
							name +
							' transferred to slot ' +
							slot +
							' from slot ' +
							key +
							(register === '')
							? '.'
							: ', swapping with ' + register + '.',
					);
				} else {
					updateLog('The weapon ' + name + ' was already in slot ' + slot + '!');
				}
			}
		});
		weaponSlots.value[slot] = name;
		updateLog('The weapon ' + name + ' was added to slot ' + slot + '.');
	};
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
			item.equipped = false;
			return item;
		});
	});
	const namesOfEquippedArmor = ref<string[]>([]);
	const armorsAsBuffs = computed<BuffInfo[]>(() => {
		const result = armor.value.map((armor) => {
			const buffString = armor.buffs
				? armor.buffs + (armor.slots ? ', ' + armor.slots : '')
				: armor.slots;
			const newBuff: BuffInfo = {
				name: armor.name,
				type: 'Buff',
				category: armor.buffCategory,
				stacks: 0,
				effects: buffString,
				active: true,
			};
			return newBuff;
		});
		return result.filter((armor) => namesOfEquippedArmor.value.includes(armor.name));
	});

	// ARMOR END

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
		return questsThatNeedToBeFiltered.value.filter((item) => item.name);
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
			return {
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
				artifact: 0,
			};
		}
		// Buff tallying goes here
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
			hpTempMax: 0,
			hpShieldMax: 0,
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
	const actionResources = ref<Record<string, number>>({
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
	});
	const actionResourceUpdate = (destination: keyof ActionResource, amount: number) => {
		actionResources.value[destination] += amount;
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
		weaponSlotUpdate,
		weaponsLoading,
		weaponsRefresh,
		// Armors
		armor,
		namesOfEquippedArmor,
		armorLoading,
		armorRefresh,
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
