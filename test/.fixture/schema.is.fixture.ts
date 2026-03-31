import {
	SCHEMATIC_MESSAGE_SCHEMA_INVALID_PROPERTY_REQUIRED,
	TEMPLATE_PATTERN,
} from '../../src/constants';
import {
	getInputPropertyMissingMessage,
	getInputPropertyTypeMessage,
	getInputTypeMessage,
	getUnknownKeysMessage,
} from '../../src/helpers/message.helper';
import {schema, Schematic} from '../../src';
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
} satisfies Schematic;

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
			error: getInputTypeMessage(value),
			errors: [getInputTypeMessage(value)],
		})),
		{
			input: {},
			ok: false,
			error: getInputPropertyMissingMessage('array', ['array']),
			// 'undefined' is not reported missing since {}.undefined === undefined satisfies the type
			errors: basicKeys
				.filter(key => key !== 'undefined')
				.map(key => getInputPropertyMissingMessage(key, [key] as never)),
		},
		{
			input: {...basicValue, array: 'a'},
			ok: false,
			error: getInputPropertyTypeMessage('array', ['array'], 'a'),
			errors: [getInputPropertyTypeMessage('array', ['array'], 'a')],
		},
		{
			input: {...basicValue, bigint: 'b'},
			ok: false,
			error: getInputPropertyTypeMessage('bigint', ['bigint'], 'b'),
			errors: [getInputPropertyTypeMessage('bigint', ['bigint'], 'b')],
		},
		{
			input: {...basicValue, boolean: 'not a boolean', number: true, object: undefined},
			ok: false,
			error: getInputPropertyTypeMessage('boolean', ['boolean'], 'not a boolean'),
			errors: [
				getInputPropertyTypeMessage('boolean', ['boolean'], 'not a boolean'),
				getInputPropertyTypeMessage('number', ['number'], true),
				getInputPropertyMissingMessage('object', ['object']),
			],
		},
		{
			input: {...basicValue, date: 'd'},
			ok: false,
			error: getInputPropertyTypeMessage('date', ['date'], 'd'),
			errors: [getInputPropertyTypeMessage('date', ['date'], 'd')],
		},
		{
			input: {...basicValue, function: 'e'},
			ok: false,
			error: getInputPropertyTypeMessage('function', ['function'], 'e'),
			errors: [getInputPropertyTypeMessage('function', ['function'], 'e')],
		},
		{
			input: {...basicValue, null: 'f'},
			ok: false,
			error: getInputPropertyTypeMessage('null', ['null'], 'f'),
			errors: [getInputPropertyTypeMessage('null', ['null'], 'f')],
		},
		{
			input: {...basicValue, number: 'g'},
			ok: false,
			error: getInputPropertyTypeMessage('number', ['number'], 'g'),
			errors: [getInputPropertyTypeMessage('number', ['number'], 'g')],
		},
		{
			input: {...basicValue, object: 'h'},
			ok: false,
			error: getInputPropertyTypeMessage('object', ['object'], 'h'),
			errors: [getInputPropertyTypeMessage('object', ['object'], 'h')],
		},
		{
			input: {...basicValue, string: 123456789},
			ok: false,
			error: getInputPropertyTypeMessage('string', ['string'], 123456789),
			errors: [getInputPropertyTypeMessage('string', ['string'], 123456789)],
		},
		{
			input: {...basicValue, symbol: 'j'},
			ok: false,
			error: getInputPropertyTypeMessage('symbol', ['symbol'], 'j'),
			errors: [getInputPropertyTypeMessage('symbol', ['symbol'], 'j')],
		},
		{
			input: {...basicValue, undefined: 'k'},
			ok: false,
			error: getInputPropertyTypeMessage('undefined', ['undefined'], 'k'),
			errors: [getInputPropertyTypeMessage('undefined', ['undefined'], 'k')],
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
				getInputPropertyTypeMessage('a.b.c', ['number'], 'not a number'),
				getInputPropertyTypeMessage('a.b.d', ['string'], 1),
				getInputPropertyMissingMessage('a.b.e', ['boolean']),
			],
		},
		first: {
			input: {a: {b: {c: 123, e: true}}},
			ok: false,
			error: getInputPropertyMissingMessage('a.b.d', ['string']),
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
	valid: {...basicValue},
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
} satisfies Schematic;

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
		types: ['object'],
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
			error: getInputPropertyTypeMessage(
				complexValues.arrayOrBigint.key,
				complexSchema.arrayOrBigInt,
				complexValues.arrayOrBigint.value,
			),
		},
		{
			input: {...firstComplex, booleanOrDate: complexValues.booleanOrDate.value},
			ok: false,
			error: getInputPropertyTypeMessage(
				complexValues.booleanOrDate.key,
				complexSchema.booleanOrDate,
				complexValues.booleanOrDate.value,
			),
		},
		{
			input: {...firstComplex, functionOrNull: complexValues.functionOrNull.value},
			ok: false,
			error: getInputPropertyTypeMessage(
				complexValues.functionOrNull.key,
				complexSchema.functionOrNull,
				complexValues.functionOrNull.value,
			),
		},
		{
			input: {...firstComplex, instance: complexValues.instance.value},
			ok: false,
			error: getInputPropertyTypeMessage(
				complexValues.instance.key,
				[TestItem],
				complexValues.instance.value,
			),
		},
		{
			input: {...firstComplex, n: complexValues.n.value},
			ok: false,
			error: getInputPropertyTypeMessage(
				complexValues.n.key,
				complexValues.n.types as never,
				complexValues.n.value,
			),
		},
		{
			input: {...firstComplex, numberOrObject: complexValues.numberOrObject.value},
			ok: false,
			error: getInputPropertyTypeMessage(
				complexValues.numberOrObject.key,
				complexValues.numberOrObject.types as never,
				complexValues.numberOrObject.value,
			),
		},
		{
			input: {...firstComplex, object: complexValues.object.value},
			ok: false,
			error: getInputPropertyTypeMessage(
				complexValues.object.key,
				complexValues.object.types as never,
				complexValues.object.value,
			),
		},
		{
			input: {...firstComplex, stringOrSymbol: complexValues.stringOrSymbol.value},
			ok: false,
			error: getInputPropertyTypeMessage(
				complexValues.stringOrSymbol.key,
				complexSchema.stringOrSymbol,
				complexValues.stringOrSymbol.value,
			),
		},
		{
			input: {...firstComplex, undefinedOrArray: complexValues.undefinedOrArray.value},
			ok: false,
			error: getInputPropertyTypeMessage(
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

const InnerSchema = schema({
	message: 'string',
});

const MiddleSchema = schema({
	inner: InnerSchema,
});

const OuterSchema = schema({
	middle: MiddleSchema,
});

// const schematicsError = getInvalidTypeMessage('middle.inner.message', ['string'], 123456789);

const schematicsError = getInputPropertyTypeMessage('message', ['string'], 123456789);

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
	instance: OuterSchema,
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
			// error: getUnknownKeysMessage(['nested.unknown']),
			error: getUnknownKeysMessage(['unknown']),
			input: {
				nested: {
					message: 'hello, world!',
					unknown: 'i should not be here',
				},
			},
			ok: false,
		},
	},
	instance: schema({
		nested: {
			message: 'string',
		},
	}),
};

// #endregion

// #region Typed

const TypedInner = schema<InnerSchema>({
	message: 'string',
	test: value => value instanceof TestItem,
});

export const typed = {
	inner: TypedInner,
	cases: [
		{
			input: {},
			ok: false,
			error: getInputPropertyMissingMessage('inner', [TypedInner]),
		},
		{
			input: {inner: 'not matching inner schema'},
			ok: false,
			error: getInputPropertyTypeMessage('inner', [TypedInner], 'not matching inner schema'),
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
