import { schematic } from "../../src";

export const types = [
	"'null'",
	"'undefined'",
	"'boolean'",
	"'boolean'",
	"'number'",
	"'bigint'",
	"'string'",
	"'symbol'",
	"'array'",
	'Map',
	'Set',
	"'function'",
	"'object'",
];

export const values = [
	null,
	undefined,
	false,
	true,
	123,
	BigInt(123),
	'hello',
	Symbol('sym'),
	[1, 2, 3],
	new Map(),
	new Set(),
	() => {},
	{key: 'value'},
];

export const length = values.length;
