import {MESSAGE_SCHEMA_INVALID_PROPERTY_REQUIRED_TYPE, TEMPLATE_PATTERN} from '../../src/constants';
import {Schema} from '../../src/models';
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
	length: -1,
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
	errors: [MESSAGE_SCHEMA_INVALID_PROPERTY_REQUIRED_TYPE.replace(TEMPLATE_PATTERN, 'n')],
	length: -1,
	schema: {
		arrayOrBigInt: ['array', 'bigint'],
		booleanOrDate: ['boolean', 'date'],
		functionOrNull: ['function', 'null'],
		instance: TestItem,
		n: {
			$required: false,
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

complex.values = [
	{...firstComplex, arrayOrBigInt: 'not an array or bigint'},
	{...firstComplex, booleanOrDate: 'not a boolean or date'},
	{...firstComplex, functionOrNull: 'not a function or null'},
	{...firstComplex, instance: 'not an instance of TestItem'},
	{...firstComplex, n: 'not an object'},
	{...firstComplex, numberOrObject: 'not a number or object'},
	{...firstComplex, stringOrSymbol: 123456789},
	{...firstComplex, undefinedOrArray: 'not undefined or array'},
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
