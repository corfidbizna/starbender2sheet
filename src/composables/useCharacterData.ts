import {
	getBuffEffects,
	tallyBuffs,
	type BuffEffect,
	type BuffInfo,
	type CharacterBuffSummary,
	type PartyBuffInfo,
} from '@/business_logic/buffs';
import { DiceFormula, getStatByCharacter } from '@/business_logic/diceFormula';
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
		buffs: string;
		quests: string;
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
			skills: '544688264',
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
		buffs: '1462505437',
		quests: '745911680',
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
type Elements = 'Kinetic' | 'Solar' | 'Void' | 'Arc' | 'Stasis' | 'Strand' | 'Prismatic';
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
	rerolls: 'Rerolls',
	slotsArmorHead: 'Head Slot',
	slotsArmorArm: 'Arms Slot',
	slotsArmorChest: 'Chest Slot',
	slotsArmorLegs: 'Legs Slot',
	slotsArmorClass: 'Class Slot',
	slotsArmorFull: 'Armor Slot',
	slotsArmorExotic: 'Exotic  Slot',
	slotsAspects: 'Aspect Slot',
	slotsFragments: 'Fragment Slot',
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
	energyUniversal: 'Max Universal Energy ',
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
		sizeMap[source.size || 0].ac;
	source.acFF = 10 + source.armor + source.armorNatural + source.armorDeflection + source.bdb;
	source.acTouch = 10 + source.armorDeflection + source.armorDodge + source.bdb + source.dex;
	source.acFFTouch = 10 + source.armorDeflection + source.bdb + source.dex;
	source.dr = source.armor + source.armorNatural + source.armorShield + source.drBase;
	source.drFF = source.armor + source.armorNatural + source.drBase;
	source.capacityCarrying = source.strScore * 30 * sizeMap[source.size || 0].carryingCapacity;
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
};
export type BarBoxStatField = {
	label: string;
	stat: string;
	hovertext?: string;
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
export type SkillsTableItem = {
	Bonus: number;
	Name: string;
	Score: string;
	Focused: boolean;
};

// Weapon Types
type WeaponRarities = 'Common' | 'Uncommon' | 'Rare' | 'Legendary' | 'Exotic';
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
	Rarity: WeaponRarities;
	Element: Elements;
	WeaponClass: WeaponClasses;
	AttackType: string;
	HitType: string;
	HitBonus?: number;
	CritRange?: number;
	CritMult?: number;
	Damage: string;
	DamageType: Elements;
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
// The type describing a quest info block.
export type Quest = {
	name: string;
	iconURL: string;
	isMajor: boolean;
	description: string;
	progressValue: number;
	progressMax: number;
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
	} = getSheetForCharacter<SkillsTableItem>(characterId, 'skills');
	const skills = computed<SkillsTableItem[]>(() => {
		// Removes items if there's nothing in the name field.
		return skillsThatNeedToBeFiltered.value.filter((item) => !!item.Name);
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
		return [...filteredPartyBuffs, ...playerBuffs.value];
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
		const buffs = activatedPartyBuffs.value;
		return buffs.map((buff) => getBuffEffects(buff, stats.value)).flat();
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
		const buffedStatNames = Object.keys(buffsTallied);
		buffedStatNames.forEach((name) => {
			newStats[name as StatsCalculatedKey] =
				buffsTallied.value[name as StatsCalculatedKey]?.total || 0;
		});
		statsDistribute(newStats);
		return newStats;
	});
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
		const statFunction = getStatByCharacter(stats.value);
		return filteredWeapons.map((weapon) => {
			const formula = new DiceFormula(weapon.Damage);
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
	// WEAPONS END

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
			rerolls: 0,
			slotsArmorHead: 3,
			slotsArmorArm: 3,
			slotsArmorChest: 3,
			slotsArmorLegs: 3,
			slotsArmorClass: 1,
			slotsArmorFull: 1,
			slotsArmorExotic: 1,
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
		};
		statsDistribute(result);
		return result;
	});
	const actionResources = ref<Record<string, number>>({
		actionsMove: stats.value.actionsMove,
		actionsAttack: stats.value.actionsAttack,
		actionsReaction: stats.value.actionsReaction,
		actionsOther: stats.value.actionsBonus,
		ammoKinetic: stats.value.capacityKinetic,
		ammoSpecial: stats.value.capacitySpecial,
		ammoHeavy: stats.value.capacityHeavy,
		energySuper: stats.value.energySuper,
		energyMelee: stats.value.energyMelee,
		energyGrenade: stats.value.energyGrenade,
		energyClass: stats.value.energyClass,
		energyUniversal: stats.value.energyUniversal,
	});
	const actionResourceUpdate = (destination: keyof ActionResource, amount: number) => {
		actionResources.value[destination] += amount;
	};
	// STATS END

	const composable = {
		// Characters
		character,
		// Buffs
		namesOfActivatedBuffs,
		activatablePartyBuffs,
		activatedPartyBuffs,
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
		weaponsLoading,
		weaponsRefresh,
		// Quests
		quests,
		questsLoading,
		questsRefresh,
		// Stats
		statsBase: statsImported,
		actionResources,
		actionResourceUpdate,
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
