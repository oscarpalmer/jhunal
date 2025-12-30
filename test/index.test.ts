import {expect, test} from 'vitest';
import * as Schema from '../src';
import {isSchematic} from '../src/is';

test('basic schema', () => {
	const schema = {
		array: 'array',
		bigint: 'bigint',
		boolean: 'boolean',
		date: 'date',
		'date-like': 'date-like',
		function: 'function',
		null: 'null',
		number: 'number',
		numerical: 'numerical',
		object: 'object',
		string: 'string',
		symbol: 'symbol',
		undefined: 'undefined',
	} satisfies Schema.Schema;

	const basicSchematic = Schema.schematic(schema);

	const first = {
		array: [1, 2, 3],
		bigint: BigInt(1),
		boolean: true,
		date: new Date(),
		'date-like': '2000-01-01',
		function: () => {},
		null: null,
		number: 1,
		numerical: 1,
		object: {},
		string: 'hello, world!',
		symbol: Symbol('a symbol?'),
		undefined: undefined,
	};

	const second = {};

	expect(basicSchematic.validatable).toBe(true);
	expect(basicSchematic.is(first)).toBe(true);
	expect(basicSchematic.is({...first, date: 99})).toBe(false);
	expect(basicSchematic.is({...first, 'date-like': 99})).toBe(true);
	expect(basicSchematic.is({...first, 'date-like': new Date()})).toBe(true);
	expect(basicSchematic.is({...first, 'date-like': 'x'})).toBe(false);
	expect(basicSchematic.is({...first, numerical: BigInt(1)})).toBe(true);
	expect(basicSchematic.is({...first, numerical: 'x'})).toBe(false);
	expect(basicSchematic.is(second)).toBe(false);
	expect(basicSchematic.is({})).toBe(false);
	expect(basicSchematic.is(123)).toBe(false);

	const invalid = {} satisfies Schema.Schema;

	let invalidSchematic = Schema.schematic(invalid);

	expect(invalidSchematic.validatable).toBe(false);
	expect(invalidSchematic.is({})).toBe(false);
	expect(invalidSchematic.is(123)).toBe(false);

	invalidSchematic = Schema.schematic('!!!' as never);

	expect(invalidSchematic.validatable).toBe(false);
	expect(invalidSchematic.is({})).toBe(false);
	expect(invalidSchematic.is(123)).toBe(false);
});

test('complex schema', () => {
	const schema = {
		arrayOrBoolean: ['array', 'boolean'],
		bigintOrString: ['bigint', 'string'],
		booleanOrDateOrNumber: ['boolean', 'date', 'number'],
		dateOrFunction: ['date', 'function'],
		functionOrNumber: {
			$required: 'maybe?' as never,
			$type: ['function', 'number'],
		},
		invalid: 'invalid' as never,
		multipleInvalid: ['invalid', 'invalid'] as never,
		none: [],
		numberOrObject: ['number', 'object'],
		optionalMultiple: {
			$required: false,
			$type: [
				'boolean',
				'number',
				{
					nestedInside: 'string',
				},
			],
		},
		optionalSingle: {
			$required: false,
			$type: 'string',
		},
		someInvalid: ['number', 'invalid', 'object'] as never,
		symbol: 'symbol',
	} satisfies Schema.Schema;

	const complexSchematic = Schema.schematic(schema);

	const first = {
		arrayOrBoolean: [1, 2, 3],
		bigintOrString: 'hello, world',
		booleanOrDateOrNumber: new Date(),
		dateOrFunction: () => {},
		functionOrNumber: 1,
		numberOrObject: {},
		someInvalid: 1,
		symbol: Symbol('a symbol?'),
	};

	expect(complexSchematic.is(first)).toBe(true);
	expect(complexSchematic.is({...first, someInvalid: false})).toBe(false);

	const keys = Object.keys(first);
	const {length} = keys;

	for (let index = 0; index < length; index += 1) {
		const key = keys[index];
		const second = {...first, [key]: undefined};

		expect(complexSchematic.is(second)).toBe(false);
	}

	expect(complexSchematic.is({...first, optionalSingle: 'abc'})).toBe(true);
	expect(complexSchematic.is({...first, optionalSingle: 123})).toBe(false);

	expect(complexSchematic.is({...first, optionalMultiple: true})).toBe(true);
	expect(complexSchematic.is({...first, optionalMultiple: 123})).toBe(true);
	expect(complexSchematic.is({...first, optionalMultiple: {nestedInside: 'hello!'}})).toBe(true);
	expect(complexSchematic.is({...first, optionalMultiple: 'abc'})).toBe(false);
});

test('is', () => {
	const schema = {
		message: 'string',
	} satisfies Schema.Schema;

	const schematic = Schema.schematic(schema);

	const values = [
		undefined,
		null,
		'',
		123,
		true,
		BigInt(123),
		new Date(),
		Symbol('123'),
		{},
		[],
		() => {},
		schema,
		schematic,
	];

	const {length} = values;

	for (let index = 0; index < length; index += 1) {
		expect(isSchematic(values[index])).toBe(index === length - 1);
	}
});

test('nested schema', () => {
	const first = {
		message: 'string',
	} satisfies Schema.Schema;

	const second = first;

	const third = {
		active: 'boolean',
	} satisfies Schema.Schema;

	const fourth = Schema.schematic(third);

	const outer = {
		first: {
			$type: first,
		},
		second: {
			$type: [second],
		},
		third: fourth,
	} satisfies Schema.Schema;

	const schematic = Schema.schematic(outer);

	const alpha = {
		first: {
			message: 'Hello, world!',
		},
		second: {
			message: 'I am second!',
		},
		third: {
			active: false,
		},
	};

	const omega = {
		message: 'Hello, world!',
	};

	expect(schematic.is(alpha)).toBe(true);
	expect(schematic.is(omega)).toBe(false);
});
