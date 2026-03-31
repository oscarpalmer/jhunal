import {schema} from '../../src';
import {TEMPLATE_PATTERN, VALIDATION_MESSAGE_INVALID_TYPE} from '../../src/constants';

function getFakeInvalidTypeMessage(key: string, type: string, actual: string): string {
	return VALIDATION_MESSAGE_INVALID_TYPE.replace(TEMPLATE_PATTERN, type)
		.replace(TEMPLATE_PATTERN, key)
		.replace(TEMPLATE_PATTERN, actual);
}

const aBoolean = 'a boolean';

const aBigInt = 'a bigint';

const aNumber = 'a number';

const anObject = 'an object';

export const types = [
	{
		original: 'null',
		rendered: 'null',
	},
	{
		original: 'undefined',
		rendered: 'undefined',
	},
	{
		original: 'boolean',
		rendered: aBoolean,
	},
	{
		original: 'bigint',
		rendered: aBigInt,
	},
	{
		original: 'function',
		rendered: 'a function',
	},
	{
		original: 'number',
		rendered: aNumber,
	},
	{
		original: 'string',
		rendered: 'a string',
	},
	{
		original: 'symbol',
		rendered: 'a symbol',
	},
	{
		original: 'array',
		rendered: 'an array',
	},
	{
		original: Map,
		rendered: 'Map',
	},
	{
		original: Set,
		rendered: 'Set',
	},
	{
		original: {},
		rendered: anObject,
	},
];

export const values = [
	null,
	undefined,
	false,
	123n,
	() => {},
	123,
	'',
	Symbol(''),
	[],
	new Map(),
	new Set(),
	{},
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
				clone: true,
				output: {},
				reporting: {...defaultReporting},
				strict: false,
			},
		},
		valid: {
			input: 'all',
			result: {
				clone: true,
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
				clone: true,
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
				clone: true,
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
				clone: true,
				output: {},
				reporting: {...defaultReporting},
				strict: false,
			},
		},
		valid: {
			input: true,
			result: {
				clone: true,
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
	one: {...property, types: ['boolean']},
	three: {...property, types: ['boolean', 'bigint', 'number']},
	two: {...property, types: ['boolean', 'bigint']},
};

const Simple = schema({property: 'number'});

export const cases = [
	...values.map((value, index) => ({
		value,
		expected: getFakeInvalidTypeMessage(property.key, types[index].rendered, types[index].rendered),
		key: property.key,
		types: [types[index].original],
	})),
	{
		expected: getFakeInvalidTypeMessage(property.key, anObject, types[0].rendered),
		key: property.key,
		types: [Simple],
		value: values[0],
	},
	{
		expected: getFakeInvalidTypeMessage(properties.one.key, aBoolean, types[0].rendered),
		key: properties.one.key,
		types: properties.one.types,
		value: values[0],
	},
	{
		expected: getFakeInvalidTypeMessage(
			properties.two.key,
			`${aBoolean} or ${aBigInt}`,
			types[0].rendered,
		),
		key: properties.two.key,
		types: properties.two.types,
		value: values[0],
	},
	{
		expected: getFakeInvalidTypeMessage(
			properties.three.key,
			`${aBoolean}, ${aBigInt}, or ${aNumber}`,
			types[0].rendered,
		),
		key: properties.three.key,
		types: properties.three.types,
		value: values[0],
	},
];

const validatorKey = 'validator';

const validatorType = {
	original: () => true,
	rendered: 'a validated value',
};

const validatorValue = {
	original: () => true,
	rendered: 'a function',
};

export const validatorCase = {
	key: validatorKey,
	message: getFakeInvalidTypeMessage(validatorKey, validatorType.rendered, validatorValue.rendered),
	type: validatorType,
	value: validatorValue,
};
