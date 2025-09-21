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
			variables: '249151624',
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

// Character Stats, as pulled from the sheet.
export type CharacterStats = {
	str: number;
	dex: number;
	con: number;
	int: number;
	wis: number;
	cha: number;
	strScore: number;
	dexScore: number;
	conScore: number;
	intScore: number;
	wisScore: number;
	chaScore: number;
	cpl: number;
	weight: number;
	hp: number;
	skill: number;
	fort: number;
	ref: number;
	wil: number;
	bab: number;
	bdb: number;
	ac: number;
	acTouch: number;
	acFF: number;
	acTFF: number;
	dr: number;
	drFF: number;
	attackMelee: number;
	attackUnarmed: number;
	attackRanged: number;
	attackPrecision: number;
	size: number;
	reach: number;
	moveDist: number;
	weightCurrent: number;
	weightCapacity: number;
	encumbered: number;
	actionAttacks: number;
	actionReactions: number;
	actionMoves: number;
	eSuper: number;
	eMelee: number;
	eGrenade: number;
	eClass: number;
	eUniversal: number;
};
export type CharacterStatKey = keyof CharacterStats;
export const labelMap: Record<CharacterStatKey, string> = {
	str: 'Strength',
	dex: 'Dexterity',
	con: 'Constitution',
	int: 'Intelligence',
	wis: 'Wisdom',
	cha: 'Charisma',
	strScore: 'Strength Score',
	dexScore: 'Dexterity Score',
	conScore: 'constitution Score',
	intScore: 'Intelligence Score',
	wisScore: 'Wisdom Score',
	chaScore: 'Charisma Score',
	cpl: 'Character Progression Level',
	weight: 'Weight',
	hp: 'Hit Points',
	skill: 'Skill',
	fort: 'Fortitude',
	ref: 'Reflex',
	wil: 'Will',
	bab: 'Base Attack Bonus',
	bdb: 'Base Defense Bonus',
	ac: 'Armor Class',
	acTouch: 'Touch Armor Class',
	acFF: 'Flat-footed Armor Class',
	acTFF: 'Touch Flat-Footed Armor Class',
	dr: 'Damage Reduction',
	drFF: 'Flat-Footed Damage Reduction',
	attackMelee: 'Melee Attack',
	attackUnarmed: 'Unarmed Attack',
	attackRanged: 'Ranged Attack',
	attackPrecision: 'Precision Damage',
	size: 'Size',
	reach: 'Base Reach',
	moveDist: 'Move Distance',
	weightCurrent: 'Current Weight',
	weightCapacity: 'Carrying Capacity',
	encumbered: 'Encumbered Status',
	actionAttacks: 'Attacks',
	actionReactions: 'Reactions',
	actionMoves: 'Moves',
	eSuper: 'Super Energy',
	eMelee: 'Melee Energy',
	eGrenade: 'Grenade Energy',
	eClass: 'Class Energy',
	eUniversal: 'Universal Energy',
};

// All character stats, as listed by Pool-kun.
export type AllBuffableStats = {
	'Move (Base Land)': number;
	'Move (Swim)': number;
	'Move (Fly)': number;
	'Move (Climb)': number;
	AC: number;
	'FF AC': number;
	'Touch AC': number;
	'FF Touch AC': number;
	DR: number;
	'FF DR': number;
	'Carrying Capacity': number;
	'Kinetic Ammo Capacity': number;
	'Special Ammo Capacity': number;
	'Heavy Ammo Capacity': number;
	'Melee Energy': number;
	'Grenade Energy': number;
	'Super Energy': number;
	'Class Energy': number;
	Rerolls: number;
	'Head Slot': number;
	'Arms Slot': number;
	'Chest Slot': number;
	'Legs Slot': number;
	'Class Slot': number;
	'Armor Slot': number;
	'Exotic  Slot': number;
	'Aspect Slot': number;
	'Fragment Slot': number;
	'Max Armor Charge': number;
	'Ranged to hit': number;
	'Melee to hit': number;
	'Spell to hit': number;
	'Melee Damage Bonus': number;
	'Ranged Damage Bonus': number;
	'Spell Damage Bonus': number;
	'Precision Damage Bonus': number;
	'Str Save DC': number;
	'Dex Save DC': number;
	'Con Save DC': number;
	'Int Save DC': number;
	'Wis Save DC': number;
	'Cha Save DC': number;
	'Skill Str Roll': number;
	'Skill Dex Roll': number;
	'Skill Con Roll': number;
	'Skill Int Roll': number;
	'Skill Wis Roll': number;
	'Skill Cha Roll': number;
	'Skill list (List of each skill)': number;
	'Str Skills': number;
	'Dex Skills': number;
	'Con Skills': number;
	'Int Skills': number;
	'Wis Skills': number;
	'Cha Skills': number;
	Initiative: number;
	'Ref Save': number;
	'Fort Save': number;
	'Max HP': number;
	'Max Temp HP': number;
	'Max Shield HP': number;
	'Shield Type': number;
	'Skill Focus': number;
	'Max Universal Energy ': number;
	Armor: number;
	'Natural Armor': number;
	Shield: number;
	Deflection: number;
	Dodge: number;
	'Base Attack': number;
	'Base Defense': number;
	'Str Mod': number;
	'Dex Mod': number;
	'Con Mod': number;
	'Int Mod': number;
	'Wis Mod': number;
	'Cha Mod': number;
	Rolls: number;
	'Attack Action': number;
	'Movement Action': number;
	Reaction: number;
	'Bonus Action': number;
	'Str Score': number;
	'Dex Score': number;
	'Con Score': number;
	'Int Score': number;
	'Wis Score': number;
	'Cha Score': number;
	CPL: number;
	'Base Character Weight': number;
	'Weight Carried': number;
	'Total Character Weight': number;
	Size: number;
	Reach: number;
	Encumberance: number;
	'Level Up Base Attack': number;
	'Level Up Base Defense': number;
	'Level Up HP': number;
	'Level Up Fort': number;
	'Level Up Ref': number;
	'Level Up Will': number;
};

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
	stats: ComputedRef<CharacterStats>,
	tally: ComputedRef<CharacterBuffSummary>,
	label: string,
	keys: CharacterStatKey[],
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
	} = getSheetForCharacter<CharacterStats>(characterId, 'variables');
	const stats = computed<CharacterStats>(() => statsArray.value[0] || {});
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
