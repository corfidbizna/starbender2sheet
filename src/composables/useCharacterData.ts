import { ref, type Ref } from 'vue';

export type CharacterDataSource = {
	label: string;
	documentId: string;
	sheets: {
		skills: string;
		variables: string;
	};
};
export type PartyDataSource = {
	documentId: string;
	sheets: {
		weapons: string;
		buffs: string;
	};
};
type SheetNames = keyof CharacterDataSource['sheets'];

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
export const partyDataSources: PartyDataSource = {
	documentId: '1agznHO98JumWB896PpQZ3eJQGIJwEIivChTurlwu5H8',
	sheets: {
		weapons: '0',
		buffs: '1800-yolo',
	},
};

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

export type StatsTableItem = {
	Bonus: number;
	Name: string;
	Score: string;
	Focused: boolean;
	Notes: string | null;
};
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
export type CharacterNames = 'aurora' | 'kara' | 'mark' | 'lewis';

const unwrapJSONPRegex = /google\.visualization\.Query\.setResponse\((.+)\);/;
const getSheetForCharacter = async <T>(
	characterId: string,
	sheetName: SheetNames,
): Promise<T[]> => {
	const character = characterDataSources[characterId];
	if (!character) {
		throw new Error(`Invalid Character ID: ${characterId}`);
	}
	const { documentId, sheets } = character;
	const sheetKey = sheets[sheetName];
	return getSheet(documentId, sheetKey);
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
		getStatsTable(): Promise<StatsTableItem[]> {
			// Since this involves a network call, "Promise" means "do this when you have the data."
			const filterTableItemsWithNoName = (list: StatsTableItem[]) => {
				// Removes items if there's nothing in the name field.
				return list.filter((item) => !!item.Name);
			};
			return getSheetForCharacter<StatsTableItem>(characterId, 'skills').then(
				// vv This is a "callback function" that will run when the promise resolves.
				// vv Doesn't need parens for some reason???
				filterTableItemsWithNoName,
			);
		},
		getWeaponsTable(): NetworkDataState<Weapon> {
			return getNetworkDataStateForSheet<Weapon>(
				partyDataSources.documentId,
				partyDataSources.sheets.weapons,
			);
		},
	};
}
