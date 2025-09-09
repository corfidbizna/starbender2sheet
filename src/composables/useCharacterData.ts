import type { BuffInfo, PartyBuffInfo } from '@/business_logic/buffs';
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
			buffs: '-1',
		},
	},
	aurora: {
		label: 'Aurora',
		documentId: '12vonRcFzriWY5AjLmueqbjd6DCQCJpqiLJkDpZEDgNU',
		sheets: {
			skills: '544688264',
			variables: '0',
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

// The type that defines the nature of all character stats.
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

// The type to be handed to a `StatBoxInfo` component, used for making
// horizontal bar graphs of numerical character stats.
export type StatBoxInfo = {
	label: string;
	data: StatBoxField[];
};
export type StatBoxField = {
	label: string;
	value: number;
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
			data: keys.map((key) => ({
				key,
				label: labelMap[key],
				value: statsValue[key],
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
export default function useCharacterData(characterId: string) {
	return {
		character: computed<CharacterDataSource | undefined>(
			() => characterDataSources[characterId],
		),
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
		getQuests(): NetworkDataState<Quest> {
			const {
				data: quests,
				isLoading: questsLoading,
				refresh: refreshQuests,
			} = getNetworkDataStateForSheet<Quest>(
				partyDataSources.documentId,
				partyDataSources.sheets.quests,
			);
			const filteredQuests = computed<Quest[]>(() => {
				return quests.value.filter((item) => item.name);
			});
			return { data: filteredQuests, isLoading: questsLoading, refresh: refreshQuests };
		},
		getPartyBuffs(): NetworkDataState<BuffInfo> {
			const {
				data: partyBuffs,
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
			const filteredBuffs = computed<BuffInfo[]>(() => {
				const filteredPartyBuffs: BuffInfo[] = partyBuffs.value.filter(
					(item) => item[characterId as CharacterNames],
				);
				return [...filteredPartyBuffs, ...playerBuffs.value];
			});
			const isLoading = computed<boolean>(() => {
				return playerBuffsLoading.value || partyBuffsLoading.value;
			});
			return {
				data: filteredBuffs,
				isLoading,
				refresh: () => {
					refreshPartyBuffs();
					refreshPlayerBuffs();
				},
			};
		},
		getStats() {
			const { data, isLoading, refresh } = getSheetForCharacter<CharacterStats>(
				characterId,
				'variables',
			);
			return {
				data: computed<CharacterStats>(() => data.value[0] || {}),
				isLoading,
				refresh,
			};
		},
	};
}
