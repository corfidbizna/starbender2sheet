import { computed, ref, type Ref } from 'vue';

type DataTypes = 'string' | 'boolean' | 'number';
type Sort<T> = {
	fieldName: keyof T;
	dataType: DataTypes;
};
export type UseSortArgs<T> = {
	listUnsorted: Ref<T[]>;
	sort: Sort<T>;
};

export const isValueEmpty = (dataType: DataTypes, value: unknown): boolean => {
	if (value === undefined) {
		return true;
	}
	if (dataType === 'string' && value === '') {
		return true;
	}
	if (dataType === 'number' && isNaN(value as number)) {
		return true;
	}
	return false;
};
/*
export default function useSorter<T, X>(config: UseSortArgs<T>) {
	/*	[ ] Take the input list and the name of the stat.
		[ ] See if the incoming sort-by keys is in the
	    	list of keys of the type being sorted.
			If it's not, return the list unchanged.
		[ ] If it does match:
			[ ] string: sort alphabetically
			[ ] number: sort numerically
			[ ] boolean: true first(?)
	//
	const { listUnsorted, sortByStat } = config;
	const queryValue = ref<X>();
	const isAscending = ref<boolean>(false);
	return {
		queryValue,
		isAscending,
		sortedData: computed<T[]>(() => {
			const currentValue: X | undefined = queryValue.value;
			type sortKeys = keyof T;
			const isEmpty = isValueEmpty(filter.dataType, currentValue);
			return listUnsorted;
		}),
	};
}
*/
