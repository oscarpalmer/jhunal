import type {Values} from './model';

export function getTypes(value: unknown): (keyof Values)[] {
	return (Array.isArray(value) ? value : [value]).filter(item =>
		types.has(item),
	);
}

const types = new Set<keyof Values>([
	'array',
	'bigint',
	'boolean',
	'date',
	'function',
	'null',
	'number',
	'object',
	'string',
	'symbol',
	'undefined',
]);
