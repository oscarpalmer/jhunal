import {Err} from '@oscarpalmer/atoms/result/models';
import {expect, test} from 'vitest';
import {ValidationInformation} from '../src/models/validation.model';
import {schematic} from '../src/schematic';
import {basic, complex, typed, type OuterSchema} from './.fixture/schema.fixture';

test('basic', () => {
	const instance = schematic(basic.schema);

	for (let index = 0; index < basic.cases.length; index += 1) {
		expect(instance.is(basic.cases[index].input)).toBe(basic.cases[index].ok);
	}

	const invalidCases = basic.cases.filter(item => !item.ok);

	for (let index = 0; index < invalidCases.length; index += 1) {
		expect(() => instance.is(invalidCases[index].input, 'throw')).toThrow(
			invalidCases[index].error,
		);
	}
});

test('basic: all', () => {
	const instance = schematic(basic.schema);

	const invalidCases = basic.cases.filter(item => !item.ok && item.errors != null);

	for (let index = 0; index < invalidCases.length; index += 1) {
		const result = instance.is(invalidCases[index].input, 'all') as Err<ValidationInformation[]>;

		expect(result.ok).toBe(false);
		expect(result.error.map(info => info.message)).toEqual(invalidCases[index].errors);
	}
});

test('basic: all, nested', () => {
	const instance = schematic(basic.nested.schema as never);

	const result = instance.is(basic.nested.all.input, 'all') as Err<ValidationInformation[]>;

	expect(result.ok).toBe(false);
	expect(result.error.map(info => info.message)).toEqual(basic.nested.all.errors);
});

test('basic: first', () => {
	const instance = schematic(basic.schema);

	const invalidCases = basic.cases.filter(item => !item.ok && item.error != null);

	for (let index = 0; index < invalidCases.length; index += 1) {
		const result = instance.is(invalidCases[index].input, 'first') as Err<ValidationInformation>;

		expect(result.ok).toBe(false);
		expect(result.error.message).toBe(invalidCases[index].error);
	}
});

test('basic: first, nested', () => {
	const instance = schematic(basic.nested.schema as never);

	const result = instance.is(basic.nested.first.input, 'first') as Err<ValidationInformation>;

	expect(result.ok).toBe(false);
	expect(result.error.message).toBe(basic.nested.first.error);
});

test('basic: throw', () => {
	const instance = schematic(basic.schema);

	const invalidCases = basic.cases.filter(item => !item.ok && item.error != null);

	for (let index = 0; index < invalidCases.length; index += 1) {
		expect(() => instance.is(invalidCases[index].input, 'throw')).toThrow(
			invalidCases[index].error,
		);
	}
});

test('complex', () => {
	const instance = schematic(complex.schema);

	for (let index = 0; index < complex.cases.length; index += 1) {
		expect(instance.is(complex.cases[index].input)).toBe(complex.cases[index].ok);
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

	const invalidCases = complex.cases.filter(item => !item.ok);

	for (let index = 0; index < invalidCases.length; index += 1) {
		expect(() => instance.is(invalidCases[index].input, 'throw')).toThrow(
			invalidCases[index].error,
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
	const outer = schematic<OuterSchema>({inner: typed.inner});

	for (let index = 0; index < typed.cases.length; index += 1) {
		expect(outer.is(typed.cases[index].input)).toBe(typed.cases[index].ok);
	}
});

test('typed: throw', () => {
	const outer = schematic<OuterSchema>({inner: typed.inner});

	const invalidCases = typed.cases.filter(item => !item.ok);

	for (let index = 0; index < invalidCases.length; index += 1) {
		expect(() => outer.is(invalidCases[index].input, 'throw')).toThrow(invalidCases[index].error);
	}
});
