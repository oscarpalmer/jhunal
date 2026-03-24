import {schematic} from '../../src';
import {getInvalidTypeMessage} from '../../src/helpers';

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

const defaultReporting = {
	all: false,
	first: false,
	none: true,
	throw: false,
	type: 'none',
};

export const options = {
	errors: {
		invalid: {
			input: 'not a valid input',
			result: {
				reporting: {...defaultReporting},
				strict: false,
			},
		},
		valid: {
			input: 'all',
			result: {
				reporting: {
					all: true,
					first: false,
					none: false,
					throw: false,
					type: 'all',
				},
				strict: false,
			},
		},
	},
	object: {
		invalid: {
			input: 'not a valid object',
			result: {
				reporting: {...defaultReporting},
				strict: false,
			},
		},
		valid: {
			input: {
				errors: 'first',
				strict: true,
			},
			result: {
				reporting: {
					all: false,
					first: true,
					none: false,
					throw: false,
					type: 'first',
				},
				strict: true,
			},
		},
	},
	strict: {
		invalid: {
			input: 'not a valid input',
			result: {
				reporting: {...defaultReporting},
				strict: false,
			},
		},
		valid: {
			input: true,
			result: {
				reporting: {...defaultReporting},
				strict: true,
			},
		},
	},
};

const property = {
	key: {
		full: 'nested.property',
		short: 'property',
	},
};

const properties = {
	one: {...property, types: ['fake']},
	three: {...property, types: ['one', 'two', 'three']},
	two: {...property, types: ['one', 'two']},
};

const Simple = schematic({property: 'number'});

export const cases = [
	...values.map((value, index) => ({
		property,
		value,
		expected: getInvalidTypeMessage(
			{
				...property,
				types: [types[index]],
			} as never,
			value,
		),
		types: [types[index]],
	})),
	{
		property,
		expected: getInvalidTypeMessage(
			{
				...property,
				types: ['a Schematic'],
			} as never,
			Simple,
		),
		types: ['a Schematic'],
		value: Simple,
	},
	{
		property,
		expected: getInvalidTypeMessage(properties.one as never, values[0]),
		types: properties.one.types,
		value: values[0],
	},
	{
		property,
		expected: getInvalidTypeMessage(properties.two as never, values[0]),
		types: properties.two.types,
		value: values[0],
	},
	{
		property,
		expected: getInvalidTypeMessage(properties.three as never, values[0]),
		types: properties.three.types,
		value: values[0],
	},
];
