import {
	SCHEMATIC_MESSAGE_SCHEMA_INVALID_PROPERTY_REQUIRED,
	TEMPLATE_PATTERN,
} from '../../src/constants';
import {Schema} from '../../src/models/schema.plain.model';
import {values} from './helpers.fixture';
import {TestItem} from './models.fixture';

export type InnerSchema = {
	message: string;
	test: TestItem;
};

export type OuterSchema = {
	inner: InnerSchema;
};

export const basic = {
	schema: {
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
	} satisfies Schema,
	keys: [] as unknown[] as string[],
	length: -1,
	types: [] as unknown[] as unknown[][],
	values: [] as unknown[],
};

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

basic.keys = [
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
];

basic.types = [
	['array', 'a'],
	['bigint', 'b'],
	['boolean', 'c'],
	['date', 'd'],
	['function', 'e'],
	['null', 'f'],
	['number', 'g'],
	['object', 'h'],
	['string', 123],
	['symbol', 'j'],
	['undefined', 'k'],
];

basic.values = [
	...values,
	{...basicValue, array: 'not an array'},
	{...basicValue, bigint: 'not a bigint'},
	{...basicValue, boolean: 'not a boolean'},
	{...basicValue, date: 'not a date'},
	{...basicValue, function: 'not a function'},
	{...basicValue, null: 'not null'},
	{...basicValue, number: 'not a number'},
	{...basicValue, object: 'not an object'},
	{...basicValue, string: 123456789},
	{...basicValue, symbol: 'not a symbol'},
	{...basicValue, undefined: 'not undefined'},
	basicValue,
];

basic.length = basic.values.length;

export const complex = {
	errors: [SCHEMATIC_MESSAGE_SCHEMA_INVALID_PROPERTY_REQUIRED.replace(TEMPLATE_PATTERN, 'n')],
	keys: [] as string[],
	length: -1,
	schema: {
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
	} satisfies Schema,
	types: [] as unknown[][],
	values: [] as unknown[],
};

const firstComplex = {
	arrayOrBigInt: [],
	booleanOrDate: true,
	functionOrNull: () => {},
	instance: new TestItem(),
	n: {
		e: {
			s: {
				t: {
					e: {
						d: 123,
					},
				},
			},
		},
	},
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
	numberOrObject: {
		message: 'hello',
	},
	object: [],
	stringOrSymbol: Symbol('symbol'),
	undefinedOrArray: [],
};

const thirdComplex = {
	...secondComplex,
	numberOrObject: {
		error: new Error(),
	},
	object: new Map(),
};

complex.keys = [
	'arrayOrBigInt',
	'booleanOrDate',
	'functionOrNull',
	'instance',
	'n',
	'numberOrObject',
	'object',
	'stringOrSymbol',
	'undefinedOrArray',
];

complex.types = [
	[complex.schema.arrayOrBigInt, 'not an array or bigint'],
	[complex.schema.booleanOrDate, 'not a boolean or date'],
	[complex.schema.functionOrNull, 'not a function or null'],
	[[() => {}], 'not an instance of TestItem'],
	[['object', 'undefined'], 'not an object or undefined'],
	[['number', 'object'], 'not a number or object'],
	[['object'], 'not an object'],
	[complex.schema.stringOrSymbol, 123456789],
	[complex.schema.undefinedOrArray, 'not undefined or array'],
];

complex.values = [
	{...firstComplex, arrayOrBigInt: complex.types[0][1]},
	{...firstComplex, booleanOrDate: complex.types[1][1]},
	{...firstComplex, functionOrNull: complex.types[2][1]},
	{...firstComplex, instance: complex.types[3][1]},
	{...firstComplex, n: complex.types[4][1]},
	{...firstComplex, numberOrObject: complex.types[5][1]},
	{...firstComplex, object: complex.types[6][1]},
	{...firstComplex, stringOrSymbol: complex.types[7][1]},
	{...firstComplex, undefinedOrArray: complex.types[8][1]},
	firstComplex,
	secondComplex,
	thirdComplex,
];

complex.length = complex.values.length;

export const typed = {
	length: 3,
	values: [
		{},
		{
			inner: 'not matching inner schema',
		},
		{
			inner: {
				message: 'This matches the inner schema',
				test: new TestItem(),
			},
		},
	],
};
