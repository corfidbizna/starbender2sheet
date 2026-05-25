import { parameterExtractor } from '@/composables/useCharacterData';
import { expect, test } from 'vitest';

test('No parameters', () => {
	const input = 'Hello World';
	const result = parameterExtractor(input);
	expect(result).toEqual([]);
});
test('Single instance of parameter', () => {
	const input = 'Hello ${modifier} World';
	const result = parameterExtractor(input);
	expect(result).toEqual(['modifier']);
});
test('Two parameter', () => {
	const input = 'Hello ${modifier} World ${eggs}';
	const result = parameterExtractor(input);
	expect(result).toEqual(['modifier', 'eggs']);
});
test('Two parameters but one is duplicate', () => {
	const input = 'Hello ${modifier} World ${eggs} is ${modifier}';
	const result = parameterExtractor(input);
	expect(result).toEqual(['modifier', 'eggs']);
});
