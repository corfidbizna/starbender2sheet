import {
	getBuffEffects,
	tallyBuffs,
	type BuffEffect,
	type BuffInfo,
	type CharacterBuffSummary,
	type PartyBuffInfo,
} from '@/business_logic/buffs';
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
const sizeMap: Record<string, SizeEffect> = {
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
console.log('sizeMap', sizeMap);

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
	skillTotal: number;
	fortPerLevel: number;
	refPerLevel: number;
	willPerLevel: number;
	babPerLevel: number;
	bdbPerLevel: number;
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
	actionsMoveLand: number;
	actionsMoveSwim: number;
	actionsMoveFly: number;
	actionsMoveClimb: number;
	ac: number;
	acFF: number;
	acTouch: number;
	acFFTouch: number;
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
	attack: number;
	defense: number;
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
	actionsMoveLand: 'Move (Base Land)',
	actionsMoveSwim: 'Move (Swim)',
	actionsMoveFly: 'Move (Fly)',
	actionsMoveClimb: 'Move (Climb)',
	ac: 'AC',
	acFF: 'FF AC',
	acTouch: 'Touch AC',
	acFFTouch: 'FF Touch AC',
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
	attack: 'Base Attack',
	defense: 'Base Defense',
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
console.log('labelToStatName', labelToStatName);

// Character Stat Destinations

// The type to be handed to a `StatBoxInfo` component, used for making
// horizontal bar graphs of numerical character stats.
export type StatBoxInfo = {
	label: string;
	data: StatBoxField[];
};
export type StatBoxField = {
	label: string;
	hovertext?: string;
	value: number;
	value2?: number;
};

//
export const makeComputedOfStats = (
	stats: ComputedRef<StatsCalculated>,
	tally: ComputedRef<CharacterBuffSummary>,
	label: string,
	keys: StatsCalculatedKey[],
): (() => StatBoxInfo) => {
	return (): StatBoxInfo => {
		const statsValue = stats.value;
		const buffsValue = tally.value;
		return {
			label,
			data: keys.map((key) => ({
				key,
				label: labelMap[key],
				hovertext: buffsValue[key]?.summary,
				value: statsValue[key],
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
	Notes: string | null;
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
export type Weapon = {
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
	HitBonus: number;
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
		const characterStats = stats.value;
		const buffs = activatedPartyBuffs.value;
		return buffs.map((buff) => getBuffEffects(buff, characterStats)).flat();
	});
	const buffsTallied = computed<CharacterBuffSummary>(() => {
		return tallyBuffs(buffArrayFlat.value, stats.value);
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
		return weaponsForFiltering.value.filter((item) => item[characterId as CharacterNames]);
	});
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
	} = getSheetForCharacter<StatsCalculated>(characterId, 'variables');
	const stats = computed<StatsCalculated>(() => statsArray.value[0] || {});
	// STATS

	const composable = {
		// Characters
		character,
		// Buffs
		namesOfActivatedBuffs,
		activatablePartyBuffs,
		activatedPartyBuffs,
		buffArrayFlat,
		buffsTallied,
		buffsLoading,
		buffsRefresh,
		// Skills
		skills,
		skillsLoading,
		skillsRefresh,
		// Weapons
		weapons,
		weaponsLoading,
		weaponsRefresh,
		// Quests
		quests,
		questsLoading,
		questsRefresh,
		// Stats
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
