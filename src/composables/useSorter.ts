import type { Ref } from 'vue';

type DataTypes = 'string' | 'boolean' | 'number';
type Sort<T> = {
	fieldName: keyof T;
	dataType: DataTypes;
};
type UseSortArgs<T> = {
	listUnsorted: Ref<T[]>;
	sort: Sort<T>;
};

export default function useSorter<T, X>(config: UseSortArgs<T>) {
	const { listUnsorted, sort } = config;
}
