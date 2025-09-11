import { type Ref, ref, computed } from 'vue';
type DataTypes = 'string' | 'boolean' | 'number';
type Filter<T> = {
	fieldName: keyof T;
	dataType: DataTypes;
};
type UseFilterArgs<T> = {
	listUnfiltered: Ref<T[]>;
	filter: Filter<T>;
};
const isValueEmpty = (dataType: DataTypes, value: unknown): boolean => {
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
type FilterResults<T> = { includes: T[]; excludes: T[] };
export default function useFilter<T, X>(config: UseFilterArgs<T>) {
	const { listUnfiltered, filter } = config;
	const queryValue = ref<X>();
	const invertFilter = ref<boolean>(false);
	return {
		queryValue,
		invertFilter,
		filteredData: computed<FilterResults<T>>(() => {
			const inverted = invertFilter.value;
			const list = listUnfiltered.value;
			let currentValue: X | undefined = queryValue.value;
			const isEmpty = isValueEmpty(filter.dataType, currentValue);
			if (filter.dataType === 'string') {
				(currentValue as string) = (currentValue + '').trim().toLocaleLowerCase();
			}
			if (isEmpty) {
				return { includes: list, excludes: [] };
			}

			const filterFunctionInclusive =
				filter.dataType === 'string'
					? (item: T) =>
							(item[filter.fieldName] + '')
								.toLocaleLowerCase()
								.includes(currentValue as string)
					: (item: T) => item[filter.fieldName] === currentValue;

			return list.reduce(
				(acc: FilterResults<T>, item) => {
					const test = filterFunctionInclusive(item) !== inverted;
					const dest = test ? 'includes' : 'excludes';
					acc[dest].push(item);
					return acc;
				},
				{ includes: [], excludes: [] },
			);
		}),
	};
}
