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
	};
};
// The sheet IDs for the party and DM-managed sheets. These won't vary per character.
export type PartyDataSource = {
	documentId: string;
	sheets: {
		weapons: string;
		buffs: string;
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
		},
	},
	aurora: {
		label: 'Aurora',
		documentId: '12vonRcFzriWY5AjLmueqbjd6DCQCJpqiLJkDpZEDgNU',
		sheets: {
			skills: '544688264',
			variables: '0',
		},
	},
};
// Party Sheet IDs
export const partyDataSources: PartyDataSource = {
	documentId: '1agznHO98JumWB896PpQZ3eJQGIJwEIivChTurlwu5H8',
	sheets: {
		weapons: '0',
		buffs: '1800',
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

// The type describing the components of a character stat.
export type CharacterStat<T> = {
	key: string;
	label: string;
	value: T;
	comments?: string;
};
// The type that defines the nature of all character stats.
export type CharacterStats = {
	str: CharacterStat<number>;
	dex: CharacterStat<number>;
	con: CharacterStat<number>;
	int: CharacterStat<number>;
	wis: CharacterStat<number>;
	cha: CharacterStat<number>;
	strScore: CharacterStat<number>;
	dexScore: CharacterStat<number>;
	conScore: CharacterStat<number>;
	intScore: CharacterStat<number>;
	wisScore: CharacterStat<number>;
	chaScore: CharacterStat<number>;
	name: CharacterStat<string>;
	race: CharacterStat<string>;
	class: CharacterStat<string>;
	cpl: CharacterStat<number>;
	colorHair: CharacterStat<string>;
	colorEye: CharacterStat<string>;
	height: CharacterStat<string>;
	weight: CharacterStat<number>;
	gClass: CharacterStat<string>;
	gSubclass: CharacterStat<string>;
	ghost: CharacterStat<string>;
	description: CharacterStat<string>;
	hp: CharacterStat<number>;
	skill: CharacterStat<number>;
	fort: CharacterStat<number>;
	ref: CharacterStat<number>;
	wil: CharacterStat<number>;
	bab: CharacterStat<number>;
	bdb: CharacterStat<number>;
	ac: CharacterStat<number>;
	acTouch: CharacterStat<number>;
	acFF: CharacterStat<number>;
	acTFF: CharacterStat<number>;
	dr: CharacterStat<number>;
	drFF: CharacterStat<number>;
	attackMelee: CharacterStat<number>;
	attackUnarmed: CharacterStat<number>;
	attackRanged: CharacterStat<number>;
	attackPrecision: CharacterStat<number>;
	size: CharacterStat<number>;
	reach: CharacterStat<number>;
	moveDist: CharacterStat<number>;
	weightCurrent: CharacterStat<number>;
	weightCapacity: CharacterStat<number>;
	encumbered: CharacterStat<number>;
	encumberedAllowed: CharacterStat<boolean>;
	actionAttacks: CharacterStat<number>;
	actionReactions: CharacterStat<number>;
	actionMoves: CharacterStat<number>;
	eSuper: CharacterStat<number>;
	eMelee: CharacterStat<number>;
	eGrenade: CharacterStat<number>;
	eClass: CharacterStat<number>;
	eUniversal: CharacterStat<number>;
};

export type CharacterStatKey = keyof CharacterStats;

// The type to be handed to a `StatBoxInfo` component, used for making
// horizontal bar graphs of numerical character stats.
export type StatBoxInfo = {
	label: string;
	data: CharacterStat<number>[];
};
//
export const makeComputedOfStats = (
	stats: ComputedRef<CharacterStats>,
	label: string,
	keys: CharacterStatKey[],
): (() => StatBoxInfo) => {
	return (): StatBoxInfo => {
		const statsValue = stats.value;
		return {
			label,
			data: keys.map((key) => statsValue[key] as CharacterStat<number>),
		};
	};
};
export const abilityScores: Partial<CharacterStats> = {
	str: {
		key: 'str',
		label: 'Strength',
		value: 6,
	},
	dex: {
		key: 'dex',
		label: 'Dexterity',
		value: 10,
	},
	con: {
		key: 'dex',
		label: 'Constitution',
		value: 7,
	},
};

const processCharacterStats = (stats: CharacterStat<unknown>[]): CharacterStats => {
	const result: Record<string, CharacterStat<unknown>> = {};
	stats.forEach((item) => {
		result[item.key] = item;
	});
	return result as CharacterStats;
};

// The type describing a character's skill.
export type SkillsTableItem = {
	Bonus: number;
	Name: string;
	Score: string;
	Focused: boolean;
	Notes: string | null;
};
// The type describing a weapon
export type Weapon = {
	aurora: boolean;
	kara: boolean;
	mark: boolean;
	lewis: boolean;
	Name: string;
	Flavortext?: string;
	Rarity: string;
	Element: string; // <-- Please change the "DamageType" at the beginning of the list to "Element" on the sheet!!!
	WeaponClass: string;
	AttackType: string;
	HitType: string;
	HitBonus: number;
	CritRange?: number;
	CritMult?: number;
	Damage: string;
	DamageType: string;
	RangeType: string;
	Range: number;
	Handed: number;
	Shape?: string;
	Duration?: number;
	Ammo: number;
	AmmoCapacity: number;
	AmmoType: string;
	IsMagic: boolean;
	Perks?: string;
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
export default function useCharacterData(characterId: string) {
	return {
		getSkillsTable() {
			const { data, isLoading, refresh } = getSheetForCharacter<SkillsTableItem>(
				characterId,
				'skills',
			);
			return {
				data: computed<SkillsTableItem[]>(() => {
					// Removes items if there's nothing in the name field.
					return data.value.filter((item) => !!item.Name);
				}),
				isLoading,
				refresh,
			};
		},
		getWeaponsTable(): NetworkDataState<Weapon> {
			const {
				data: weapons,
				isLoading: weaponsLoading,
				refresh: refreshWeapons,
			} = getNetworkDataStateForSheet<Weapon>(
				partyDataSources.documentId,
				partyDataSources.sheets.weapons,
			);
			const filteredWeapons = computed<Weapon[]>(() => {
				return weapons.value.filter((item) => item[characterId as CharacterNames]);
			});
			return {
				data: filteredWeapons,
				isLoading: weaponsLoading,
				refresh: refreshWeapons,
			};
		},
		getStats() {
			const { data, isLoading, refresh } = getSheetForCharacter<CharacterStat<unknown>>(
				characterId,
				'variables',
			);
			return {
				data: computed<CharacterStats>(() => processCharacterStats(data.value)),
				isLoading,
				refresh,
			};
		},
	};
}
