import {
	SCHEMATIC_MESSAGE_SCHEMA_INVALID_PROPERTY_REQUIRED,
	TEMPLATE_PATTERN,
} from '../../src/constants';
import {
	getInvalidInputMessage,
	getInvalidMissingMessage,
	getInvalidTypeMessage,
	getUnknownKeysMessage,
} from '../../src/helpers';
import {Schema} from '../../src/models/schema.plain.model';
import {schematic} from '../../src/schematic';
import {values as typeValues} from './helpers.fixture';
import {TestItem} from './models.fixture';

// #region Types

export type InnerSchema = {
	message: string;
	test: TestItem;
};

export type OuterSchema = {
	inner: InnerSchema;
};

// #endregion

// #region Helpers

function getProperty(full: string, types: unknown[], short = full) {
	return {key: {full, short}, types} as never;
}

// #endregion

// #region Basic

const basicSchema = {
	array: 'array',
	bigint: 'bigint',
	boolean: 'boolean',
	date: 'date',
	function: 'function',
	null: 'null',
	number: 'number',
	object: 'object',
	string: 'string',
	symbol: 'symbol',
	undefined: 'undefined',
} satisfies Schema;

const basicValue = {
	array: [],
	bigint: 1n,
	boolean: true,
	date: new Date(),
	function: () => {},
	null: null,
	number: 1,
	object: {},
	string: 'string',
	symbol: Symbol('symbol'),
	undefined: undefined,
};

const basicKeys = Object.keys(basicSchema).sort();

export const basic = {
	schema: basicSchema,
	cases: [
		...typeValues.slice(0, typeValues.length - 1).map(value => ({
			input: value,
			ok: false,
			error: getInvalidInputMessage(value),
			errors: [getInvalidInputMessage(value)],
		})),
		{
			input: {},
			ok: false,
			error: getInvalidMissingMessage('array', ['array']),
			// 'undefined' is not reported missing since {}.undefined === undefined satisfies the type
			errors: basicKeys
				.filter(key => key !== 'undefined')
				.map(key => getInvalidMissingMessage(key, [key] as never)),
		},
		{
			input: {...basicValue, array: 'a'},
			ok: false,
			error: getInvalidTypeMessage('array', ['array'], 'a'),
			errors: [getInvalidTypeMessage('array', ['array'], 'a')],
		},
		{
			input: {...basicValue, bigint: 'b'},
			ok: false,
			error: getInvalidTypeMessage('bigint', ['bigint'], 'b'),
			errors: [getInvalidTypeMessage('bigint', ['bigint'], 'b')],
		},
		{
			input: {...basicValue, boolean: 'not a boolean', number: true, object: undefined},
			ok: false,
			error: getInvalidTypeMessage('boolean', ['boolean'], 'not a boolean'),
			errors: [
				getInvalidTypeMessage('boolean', ['boolean'], 'not a boolean'),
				getInvalidTypeMessage('number', ['number'], true),
				getInvalidMissingMessage('object', ['object']),
			],
		},
		{
			input: {...basicValue, date: 'd'},
			ok: false,
			error: getInvalidTypeMessage('date', ['date'], 'd'),
			errors: [getInvalidTypeMessage('date', ['date'], 'd')],
		},
		{
			input: {...basicValue, function: 'e'},
			ok: false,
			error: getInvalidTypeMessage('function', ['function'], 'e'),
			errors: [getInvalidTypeMessage('function', ['function'], 'e')],
		},
		{
			input: {...basicValue, null: 'f'},
			ok: false,
			error: getInvalidTypeMessage('null', ['null'], 'f'),
			errors: [getInvalidTypeMessage('null', ['null'], 'f')],
		},
		{
			input: {...basicValue, number: 'g'},
			ok: false,
			error: getInvalidTypeMessage('number', ['number'], 'g'),
			errors: [getInvalidTypeMessage('number', ['number'], 'g')],
		},
		{
			input: {...basicValue, object: 'h'},
			ok: false,
			error: getInvalidTypeMessage('object', ['object'], 'h'),
			errors: [getInvalidTypeMessage('object', ['object'], 'h')],
		},
		{
			input: {...basicValue, string: 123456789},
			ok: false,
			error: getInvalidTypeMessage('string', ['string'], 123456789),
			errors: [getInvalidTypeMessage('string', ['string'], 123456789)],
		},
		{
			input: {...basicValue, symbol: 'j'},
			ok: false,
			error: getInvalidTypeMessage('symbol', ['symbol'], 'j'),
			errors: [getInvalidTypeMessage('symbol', ['symbol'], 'j')],
		},
		{
			input: {...basicValue, undefined: 'k'},
			ok: false,
			error: getInvalidTypeMessage('undefined', ['undefined'], 'k'),
			errors: [getInvalidTypeMessage('undefined', ['undefined'], 'k')],
		},
		{
			input: basicValue,
			ok: true,
		},
	],
	nested: {
		all: {
			input: {a: {b: {c: 'not a number', d: 1}}},
			ok: false,
			errors: [
				getInvalidTypeMessage('a.b.c', ['number'], 'not a number'),
				getInvalidTypeMessage('a.b.d', ['string'], 1),
				getInvalidMissingMessage('a.b.e', ['boolean']),
			],
		},
		first: {
			input: {a: {b: {c: 123, e: true}}},
			ok: false,
			error: getInvalidMissingMessage('a.b.d', ['string']),
		},
		schema: {
			a: {
				b: {
					c: 'number',
					d: 'string',
					e: 'boolean',
				},
			},
		},
	},
};

// #endregion

// #region Complex

const complexSchema = {
	arrayOrBigInt: ['array', 'bigint'],
	booleanOrDate: ['boolean', 'date'],
	functionOrNull: ['function', 'null'],
	instance: TestItem,
	n: {
		$required: false,
		$type: {
			e: {
				s: {
					t: {
						e: {
							d: 'number',
						},
					},
				},
			},
		},
	},
	numberOrObject: {
		$type: [
			'number',
			{
				error: Error,
			},
			{
				message: 'string',
			},
		],
	},
	object: 'object',
	stringOrSymbol: ['string', 'symbol'],
	undefinedOrArray: ['undefined', 'array'],
} satisfies Schema;

const firstComplex = {
	arrayOrBigInt: [],
	booleanOrDate: true,
	functionOrNull: () => {},
	instance: new TestItem(),
	n: {e: {s: {t: {e: {d: 123}}}}},
	numberOrObject: 1,
	object: {},
	stringOrSymbol: 'string',
	undefinedOrArray: undefined,
};

const secondComplex = {
	arrayOrBigInt: 1n,
	booleanOrDate: new Date(),
	functionOrNull: null,
	instance: new TestItem(),
	numberOrObject: {message: 'hello'},
	object: [],
	stringOrSymbol: Symbol('symbol'),
	undefinedOrArray: [],
};

const thirdComplex = {
	...secondComplex,
	numberOrObject: {error: new Error()},
	object: new Map(),
};

const complexValues = {
	arrayOrBigint: {
		key: 'arrayOrBigInt',
		value: 'not an array or bigint',
	},
	booleanOrDate: {
		key: 'booleanOrDate',
		value: 'not a boolean or date',
	},
	functionOrNull: {
		key: 'functionOrNull',
		value: 'not a function or null',
	},
	instance: {
		key: 'instance',
		value: 'not an instance of TestItem',
	},
	n: {
		key: 'n',
		types: ['object', 'undefined'],
		value: 'not an object or undefined',
	},
	numberOrObject: {
		key: 'numberOrObject',
		types: ['number', 'object'],
		value: 'not a number or object',
	},
	object: {
		key: 'object',
		types: ['object'],
		value: 'not an object',
	},
	stringOrSymbol: {
		key: 'stringOrSymbol',
		value: 123456789,
	},
	undefinedOrArray: {
		key: 'undefinedOrArray',
		value: 'not undefined or array',
	},
};

export const complex = {
	schema: complexSchema,
	errors: [SCHEMATIC_MESSAGE_SCHEMA_INVALID_PROPERTY_REQUIRED.replace(TEMPLATE_PATTERN, 'n')],
	cases: [
		{
			input: {...firstComplex, arrayOrBigInt: complexValues.arrayOrBigint.value},
			ok: false,
			error: getInvalidTypeMessage(
				complexValues.arrayOrBigint.key,
				complexSchema.arrayOrBigInt,
				complexValues.arrayOrBigint.value,
			),
		},
		{
			input: {...firstComplex, booleanOrDate: complexValues.booleanOrDate.value},
			ok: false,
			error: getInvalidTypeMessage(
				complexValues.booleanOrDate.key,
				complexSchema.booleanOrDate,
				complexValues.booleanOrDate.value,
			),
		},
		{
			input: {...firstComplex, functionOrNull: complexValues.functionOrNull.value},
			ok: false,
			error: getInvalidTypeMessage(
				complexValues.functionOrNull.key,
				complexSchema.functionOrNull,
				complexValues.functionOrNull.value,
			),
		},
		{
			input: {...firstComplex, instance: complexValues.instance.value},
			ok: false,
			error: getInvalidTypeMessage(
				complexValues.instance.key,
				[() => {}],
				complexValues.instance.value,
			),
		},
		{
			input: {...firstComplex, n: complexValues.n.value},
			ok: false,
			error: getInvalidTypeMessage(
				complexValues.n.key,
				complexValues.n.types as never,
				complexValues.n.value,
			),
		},
		{
			input: {...firstComplex, numberOrObject: complexValues.numberOrObject.value},
			ok: false,
			error: getInvalidTypeMessage(
				complexValues.numberOrObject.key,
				complexValues.numberOrObject.types as never,
				complexValues.numberOrObject.value,
			),
		},
		{
			input: {...firstComplex, object: complexValues.object.value},
			ok: false,
			error: getInvalidTypeMessage(
				complexValues.object.key,
				complexValues.object.types as never,
				complexValues.object.value,
			),
		},
		{
			input: {...firstComplex, stringOrSymbol: complexValues.stringOrSymbol.value},
			ok: false,
			error: getInvalidTypeMessage(
				complexValues.stringOrSymbol.key,
				complexSchema.stringOrSymbol,
				complexValues.stringOrSymbol.value,
			),
		},
		{
			input: {...firstComplex, undefinedOrArray: complexValues.undefinedOrArray.value},
			ok: false,
			error: getInvalidTypeMessage(
				complexValues.undefinedOrArray.key,
				complexSchema.undefinedOrArray,
				complexValues.undefinedOrArray.value,
			),
		},
		{input: firstComplex, ok: true},
		{input: secondComplex, ok: true},
		{input: thirdComplex, ok: true},
	],
};

// #endregion

// #region Schematics

const schematicsInner = schematic({
	message: 'string',
});

const schematicsMiddle = schematic({
	inner: schematicsInner,
});

const schematicsOuter = schematic({
	middle: schematicsMiddle,
});

const schematicsError = getInvalidTypeMessage('middle.inner.message', ['string'], 123456789);

const schematicsInput = {
	middle: {
		inner: {
			message: 123456789,
		},
	},
};

export const schematics = {
	cases: {
		all: {
			error: schematicsError,
			input: schematicsInput,
			ok: false,
		},
		first: {
			error: schematicsError,
			input: schematicsInput,
			ok: false,
		},
		none: {
			input: schematicsInput,
			result: false,
		},
	},
	instance: schematicsOuter,
};

// #endregion

// #region Strictness

export const strictness = {
	cases: {
		basic: {
			error: getUnknownKeysMessage(['unknown']),
			input: {
				nested: {
					message: 'hello, world!',
				},
				unknown: 'i should not be here',
			},
			ok: false,
		},
		nested: {
			error: getUnknownKeysMessage(['nested.unknown']),
			input: {
				nested: {
					message: 'hello, world!',
					unknown: 'i should not be here',
				},
			},
			ok: false,
		},
	},
	instance: schematic({
		nested: {
			message: 'string',
		},
	}),
};

// #endregion

// #region Typed

const typedInner = schematic<InnerSchema>({
	message: 'string',
	test: value => value instanceof TestItem,
});

export const typed = {
	inner: typedInner,
	cases: [
		{
			input: {},
			ok: false,
			error: getInvalidMissingMessage('inner', [typedInner]),
		},
		{
			input: {inner: 'not matching inner schema'},
			ok: false,
			error: getInvalidTypeMessage('inner', [typedInner], 'not matching inner schema'),
		},
		{
			input: {
				inner: {
					message: 'This matches the inner schema',
					test: new TestItem(),
				},
			},
			ok: true,
		},
	],
};

// #endregion
