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
export default function useFilter<T, X>({ listUnfiltered: dataSource, filter }: UseFilterArgs<T>) {
	const queryValue = ref<X>();
	return {
		queryValue,
		filteredData: computed<T[]>(() => {
			const list = dataSource.value;
			let currentValue: X | undefined = queryValue.value;
			const isEmpty = isValueEmpty(filter.dataType, currentValue);
			if (filter.dataType === 'string') {
				(currentValue as string) = (currentValue + '').trim().toLocaleLowerCase();
			}
			if (isEmpty) {
				return list;
			}
			const filterFunction =
				filter.dataType === 'string'
					? (item: T) =>
							(item[filter.fieldName] + '')
								.toLocaleLowerCase()
								.includes(currentValue as string)
					: (item: T) => item[filter.fieldName] === currentValue;
			return list.filter(filterFunction);
		}),
	};
}
