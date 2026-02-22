import {expect, test} from 'vitest';
import * as Jhunal from '../src';
import {isSchematic} from '../src/is';

class Test {}

test('basic schema', () => {
	const schema = {
		array: 'array',
		bigint: 'bigint',
		boolean: 'boolean',
		date: 'date',
		function: 'function',
		instance: Test,
		null: 'null',
		number: 'number',
		object: 'object',
		string: 'string',
		symbol: 'symbol',
		undefined: 'undefined',
	} satisfies Jhunal.Schema;

	const basicSchematic = Jhunal.schematic(schema);

	const first = {
		array: [1, 2, 3],
		bigint: BigInt(1),
		boolean: true,
		date: new Date(),
		function: () => {},
		instance: new Test(),
		null: null,
		number: 1,
		object: {},
		string: 'hello, world!',
		symbol: Symbol('a symbol?'),
		undefined: undefined,
	};

	const second = {};

	expect(basicSchematic.enabled).toBe(true);
	expect(basicSchematic.is(first)).toBe(true);
	expect(basicSchematic.is({...first, date: 99})).toBe(false);
	expect(basicSchematic.is(second)).toBe(false);
	expect(basicSchematic.is({})).toBe(false);
	expect(basicSchematic.is(123)).toBe(false);

	const invalid = {} satisfies Jhunal.Schema;

	let invalidSchematic = Jhunal.schematic(invalid);

	expect(invalidSchematic.enabled).toBe(false);
	expect(invalidSchematic.is({})).toBe(false);
	expect(invalidSchematic.is(123)).toBe(false);

	invalidSchematic = Jhunal.schematic('!!!' as never);

	expect(invalidSchematic.enabled).toBe(false);
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
	} satisfies Jhunal.Schema;

	const complexSchematic = Jhunal.schematic(schema);

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

test('isInstance', () => {
	const values = [
		null,
		undefined,
		'',
		123,
		true,
		BigInt(123),
		new Date(),
		Symbol('123'),
		{},
		[],
		() => {},
		new Map(),
		new Set(),
	];

	let {length} = values;

	for (let index = 0; index < length; index += 1) {
		expect(() => Jhunal.isInstance(values[index] as never)).toThrow(
			'Expected a constructor function',
		);
	}

	values.splice(0, length, Object, Array, Map, Set, class {}, Test);

	length = values.length;

	for (let index = 0; index < length; index += 1) {
		expect(Jhunal.isInstance(values[index] as never)).toBeTypeOf('function');
	}
});

test('isInstance', () => {});

test('isSchematic', () => {
	const schema = {
		message: 'string',
	} satisfies Jhunal.Schema;

	const schematic = Jhunal.schematic(schema);

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
	} satisfies Jhunal.Schema;

	const second = first;

	const third = {
		active: 'boolean',
	} satisfies Jhunal.Schema;

	const fourth = Jhunal.schematic(third);

	const outer = {
		first: {
			$type: first,
		},
		second: {
			$type: [second],
		},
		third: fourth,
	} satisfies Jhunal.Schema;

	const schematic = Jhunal.schematic(outer);

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

test('typed schematic', () => {
	type Typed = {
		test: Test;
	};

	const schematic = Jhunal.schematic<Typed>({
		test: Jhunal.isInstance(Test),
	});

	expect(schematic.is({test: new Test()})).toBe(true);
	expect(schematic.is({test: {}})).toBe(false);
	expect(schematic.is({})).toBe(false);
	expect(schematic.is({test: new Date()})).toBe(false);
	expect(schematic.is({test: null})).toBe(false);
	expect(schematic.is({test: undefined})).toBe(false);
	expect(schematic.is({test: 123})).toBe(false);
	expect(schematic.is({test: 'hello'})).toBe(false);
	expect(schematic.is({test: true})).toBe(false);
});
