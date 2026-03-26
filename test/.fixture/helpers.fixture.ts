import {schematic} from '../../src';
import {getInvalidTypeMessage} from '../../src/helpers/message.helper';

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

export const parameters = {
	errors: {
		invalid: {
			input: 'not a valid input',
			result: {
				output: {},
				reporting: {...defaultReporting},
				strict: false,
			},
		},
		valid: {
			input: 'all',
			result: {
				output: {},
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
				output: {},
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
				output: {},
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
				output: {},
				reporting: {...defaultReporting},
				strict: false,
			},
		},
		valid: {
			input: true,
			result: {
				output: {},
				reporting: {...defaultReporting},
				strict: true,
			},
		},
	},
};

const property = {
	key: 'nested.property',
};

const properties = {
	one: {...property, types: ['fake']},
	three: {...property, types: ['one', 'two', 'three']},
	two: {...property, types: ['one', 'two']},
};

const Simple = schematic({property: 'number'});

export const cases = [
	...values.map((value, index) => ({
		value,
		expected: getInvalidTypeMessage(property.key, [types[index]] as never, value),
		key: property.key,
		types: [types[index]],
	})),
	{
		expected: getInvalidTypeMessage(property.key, ['a Schematic'] as never, Simple),
		key: property.key,
		types: ['a Schematic'],
		value: Simple,
	},
	{
		expected: getInvalidTypeMessage(properties.one.key, properties.one.types as never, values[0]),
		key: properties.one.key,
		types: properties.one.types,
		value: values[0],
	},
	{
		expected: getInvalidTypeMessage(properties.two.key, properties.two.types as never, values[0]),
		key: properties.two.key,
		types: properties.two.types,
		value: values[0],
	},
	{
		expected: getInvalidTypeMessage(
			properties.three.key,
			properties.three.types as never,
			values[0],
		),
		key: properties.three.key,
		types: properties.three.types,
		value: values[0],
	},
];
