type Goat = {
	name: string;
	powerLevel: number;
	isGrumpy: boolean;
};
type Bird = {
	name: string;
	intelligence: number;
	isFlying: boolean;
};
type Entity = {
	name: string;
};

const goats: Goat[] = [
	{ name: 'Gruff', powerLevel: 10, isGrumpy: true },
	{ name: 'Faun', powerLevel: 9001, isGrumpy: false },
	{ name: 'Grogar', powerLevel: -1, isGrumpy: true },
];
const birds: Bird[] = [
	{ name: 'Huey', intelligence: 10, isFlying: true },
	{ name: 'Dewey', intelligence: 9001, isFlying: false },
	{ name: 'Louie', intelligence: -1, isFlying: true },
];

const logMyList = <T>(list: T[]): string => {
	const output = list.map((item) =>
		Object.entries(item as object)
			.map(([key, value]) => `${key}: ${value}`)
			.join(' | '),
	);
	return '\n----\n' + output.join('\n');
};

console.log('logMyList(goats)', logMyList(goats));
console.log('logMyList<Entity>(goats)', logMyList<Entity>(goats));
// console.log(logMyList<Bird>(goats)); // <-- This line is an error because "Bird" has things that the type of the items in the "goats" array does not have.
console.log('logMyList<Bird>(birds)', logMyList<Bird>(birds));
