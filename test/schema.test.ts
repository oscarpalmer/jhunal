import {Err, Result} from '@oscarpalmer/atoms/result/models';
import {expect, test} from 'vitest';
import {
	getInvalidInputMessage,
	getInvalidMissingMessage,
	getInvalidTypeMessage,
} from '../src/helpers';
import {ValidationInformation} from '../src/models/validation.model';
import {schematic} from '../src/schematic';
import {length, values} from './.fixture/helpers.fixture';
import {TestItem} from './.fixture/models.fixture';
import {basic, complex, typed, type InnerSchema, type OuterSchema} from './.fixture/schema.fixture';

test('basic', () => {
	const instance = schematic(basic.schema);

	for (let index = 0; index < basic.length; index += 1) {
		expect(instance.is(basic.values[index])).toBe(index === basic.length - 1);
	}
});

test('basic: all', () => {
	const instance = schematic(basic.schema);

	for (let index = 0; index < length - 1; index += 1) {
		const result = instance.is(values[index], 'all') as Result<true, ValidationInformation[]>;

		expect(result.ok).toBe(false);

		const validation = (result as Err<ValidationInformation[]>).error;

		expect(validation.length).toBe(1);

		expect(validation[0].message).toBe(
			index === length - 1
				? getInvalidMissingMessage({
						key: {full: 'array', short: 'array'},
						types: ['array'],
					} as never)
				: getInvalidInputMessage(values[index]),
		);
	}

	for (let index = length; index < basic.length - 1; index += 1) {
		const key = basic.keys[index - length];
		const types = basic.types[index - length] ?? [];

		const result = instance.is(basic.values[index], 'all') as Result<true, ValidationInformation[]>;

		expect(result.ok).toBe(false);

		const validation = (result as Err<ValidationInformation[]>).error;

		expect(validation.length).toBe(index - length === 2 ? 3 : 1);

		expect(validation[0].message).toBe(
			getInvalidTypeMessage(
				{
					key: {
						full: key,
						short: key,
					},
					types: [types[0]],
				} as never,
				types[1],
			),
		);

		if (validation.length === 1) {
			continue;
		}

		expect(validation[1].message).toBe(
			getInvalidTypeMessage(
				{
					key: {
						full: 'number',
						short: 'number',
					},
					types: ['number'],
				} as never,
				true,
			),
		);

		expect(validation[2].message).toBe(
			getInvalidMissingMessage({
				key: {
					full: 'object',
					short: 'object',
				},
				types: ['object'],
			} as never),
		);
	}
});

test('basic: all, nested', () => {
	const schema = schematic({
		a: {
			b: {
				c: 'number',
				d: 'string',
				e: 'boolean',
			},
		},
	});

	const result = schema.is(
		{
			a: {
				b: {
					c: 'not a number',
					d: 1,
				},
			},
		},
		'all',
	) as Result<true, ValidationInformation[]>;

	expect(result.ok).toBe(false);

	const validation = (result as Err<ValidationInformation[]>).error;

	expect(validation.length).toBe(3);

	expect(validation[0].message).toBe(
		getInvalidTypeMessage(
			{
				key: {full: 'a.b.c', short: 'c'},
				types: ['number'],
			} as never,
			'not a number',
		),
	);

	expect(validation[1].message).toBe(
		getInvalidTypeMessage(
			{
				key: {full: 'a.b.d', short: 'd'},
				types: ['string'],
			} as never,
			1,
		),
	);

	expect(validation[2].message).toBe(
		getInvalidMissingMessage({
			key: {full: 'a.b.e', short: 'e'},
			types: ['boolean'],
		} as never),
	);
});

test('basic: first', () => {
	const instance = schematic(basic.schema);

	for (let index = 0; index < length - 1; index += 1) {
		const result = instance.is(values[index], 'first') as Result<true, ValidationInformation>;

		expect(result.ok).toBe(false);

		const validation = (result as Err<ValidationInformation>).error;

		expect(validation.message).toBe(
			index === length - 1
				? getInvalidMissingMessage({
						key: {full: 'array', short: 'array'},
						types: ['array'],
					} as never)
				: getInvalidInputMessage(values[index]),
		);
	}

	for (let index = length; index < basic.length - 1; index += 1) {
		const key = basic.keys[index - length];
		const types = basic.types[index - length] ?? [];

		const result = instance.is(basic.values[index], 'first') as Result<true, ValidationInformation>;

		expect(result.ok).toBe(false);

		const validation = (result as Err<ValidationInformation>).error;

		expect(validation.message).toBe(
			getInvalidTypeMessage(
				{
					key: {
						full: key,
						short: key,
					},
					types: [types[0]],
				} as never,
				types[1],
			),
		);
	}
});

test('basic: first, nested', () => {
	const schema = schematic({
		a: {
			b: {
				c: 'number',
				d: 'string',
				e: 'boolean',
			},
		},
	});

	const result = schema.is(
		{
			a: {
				b: {
					c: 123,
					e: true,
				},
			},
		},
		'first',
	) as Result<true, ValidationInformation>;

	expect(result.ok).toBe(false);

	const validation = (result as Err<ValidationInformation>).error;

	expect(validation.message).toBe(
		getInvalidMissingMessage({
			key: {full: 'a.b.d', short: 'd'},
			types: ['string'],
		} as never),
	);
});

test('basic: throw', () => {
	const instance = schematic(basic.schema);

	for (let index = 0; index < length; index += 1) {
		expect(() => instance.is(values[index], 'throw')).toThrow(
			index === length - 1
				? getInvalidMissingMessage({
						key: {full: 'array', short: 'array'},
						types: ['array'],
					} as never)
				: getInvalidInputMessage(values[index]),
		);
	}

	for (let index = length; index < basic.length - 1; index += 1) {
		const key = basic.keys[index - length];
		const types = basic.types[index - length] ?? [];

		expect(() => instance.is(basic.values[index], 'throw')).toThrow(
			getInvalidTypeMessage(
				{
					key: {
						full: key,
						short: key,
					},
					types: [types[0]],
				} as never,
				types[1],
			),
		);
	}
});

test('complex', () => {
	const instance = schematic(complex.schema);

	for (let index = 0; index < complex.length; index += 1) {
		expect(instance.is(complex.values[index])).toBe(index >= complex.length - 3);
	}

	expect(() =>
		schematic({
			...complex.schema,
			n: {
				$required: 'not a boolean',
				$type: {
					...complex.schema.n,
				},
			},
		} as never),
	).toThrow(complex.errors[0]);
});

test('complex: throw', () => {
	const instance = schematic(complex.schema);

	for (let index = 0; index < complex.length - 3; index += 1) {
		const key = complex.keys[index];
		const types = complex.types[index];

		expect(() => instance.is(complex.values[index], 'throw')).toThrow(
			getInvalidTypeMessage(
				{
					key: {full: key, short: key},
					types: types[0],
				} as never,
				types[1],
			),
		);
	}

	expect(() =>
		schematic({
			...complex.schema,
			n: {
				$required: 'not a boolean',
				$type: {
					...complex.schema.n,
				},
			},
		} as never),
	).toThrow(complex.errors[0]);
});

test('typed', () => {
	const inner = schematic<InnerSchema>({
		message: 'string',
		test: value => value instanceof TestItem,
	});

	const outer = schematic<OuterSchema>({
		inner,
	});

	for (let index = 0; index < typed.length; index += 1) {
		expect(outer.is(typed.values[index])).toBe(index === typed.length - 1);
	}
});

test('typed: throw', () => {
	const key = {full: 'inner', short: 'inner'};

	const inner = schematic<InnerSchema>({
		message: 'string',
		test: value => value instanceof TestItem,
	});

	const outer = schematic<OuterSchema>({
		inner,
	});

	const messages = [
		getInvalidMissingMessage({
			key,
			types: [inner],
		} as never),
		getInvalidTypeMessage(
			{
				key,
				types: [inner],
			} as never,
			'a string',
		),
	];

	for (let index = 0; index < typed.length - 1; index += 1) {
		expect(() => outer.is(typed.values[index], 'throw')).toThrow(messages[index]);
	}
});
