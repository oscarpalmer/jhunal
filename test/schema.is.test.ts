import {Err, Ok} from '@oscarpalmer/atoms/result/models';
import {expect, test} from 'vitest';
import {ValidationInformation} from '../src/models/validation.model';
import {schematic} from '../src/schematic';
import {
	basic,
	complex,
	schematics,
	strictness,
	typed,
	type OuterSchema,
} from './.fixture/schema.is.fixture';

test('is basic', () => {
	const instance = schematic(basic.schema);

	for (let index = 0; index < basic.cases.length; index += 1) {
		expect(instance.is(basic.cases[index].input)).toBe(basic.cases[index].ok);
	}

	expect(instance.is(basic.valid)).toBe(true);
});

test('is basic: all', () => {
	const instance = schematic(basic.schema);

	const invalidCases = basic.cases.filter(item => !item.ok && item.errors != null);

	for (let index = 0; index < invalidCases.length; index += 1) {
		const result = instance.is(invalidCases[index].input, 'all') as Err<ValidationInformation[]>;

		expect(result.ok).toBe(false);
		expect(result.error.map(info => info.message)).toEqual(invalidCases[index].errors);
	}

	const result = instance.is(basic.valid, 'all') as Ok<true>;

	expect(result.ok).toBe(true);
	expect(result.value).toBe(true);
});

test('is basic: all, nested', () => {
	const instance = schematic(basic.nested.schema as never);

	const result = instance.is(basic.nested.all.input, 'all') as Err<ValidationInformation[]>;

	expect(result.ok).toBe(false);
	expect(result.error.map(info => info.message)).toEqual(basic.nested.all.errors);
});

test('is basic: first', () => {
	const instance = schematic(basic.schema);

	const invalidCases = basic.cases.filter(item => !item.ok && item.error != null);

	for (let index = 0; index < invalidCases.length; index += 1) {
		const result = instance.is(invalidCases[index].input, 'first') as Err<ValidationInformation>;

		expect(result.ok).toBe(false);
		expect(result.error.message).toBe(invalidCases[index].error);
	}

	const result = instance.is(basic.valid, 'first') as Ok<true>;

	expect(result.ok).toBe(true);
	expect(result.value).toBe(true);
});

test('is basic: first, nested', () => {
	const instance = schematic(basic.nested.schema as never);

	const result = instance.is(basic.nested.first.input, 'first') as Err<ValidationInformation>;

	expect(result.ok).toBe(false);
	expect(result.error.message).toBe(basic.nested.first.error);
});

test('is basic: throw', () => {
	const instance = schematic(basic.schema);

	const invalidCases = basic.cases.filter(item => !item.ok && item.error != null);

	for (let index = 0; index < invalidCases.length; index += 1) {
		expect(() => instance.is(invalidCases[index].input, 'throw')).toThrow(
			invalidCases[index].error,
		);
	}

	expect(instance.is(basic.valid, 'throw')).toBe(true);
});

test('is complex', () => {
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

test('is complex: throw', () => {
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

test('is schematics', () => {
	const all = schematics.instance.is(schematics.cases.all.input, 'all');

	expect(all.ok).toBe(schematics.cases.all.ok);

	const errors = (all as Err<ValidationInformation[]>).error;

	expect(errors).toHaveLength(1);
	expect(errors[0].message).toBe(schematics.cases.all.error);

	const first = schematics.instance.is(schematics.cases.first.input, 'first');

	expect(first.ok).toBe(schematics.cases.first.ok);

	const error = (first as Err<ValidationInformation>).error;

	expect(error.message).toBe(schematics.cases.first.error);
	expect(schematics.instance.is(schematics.cases.none.input)).toBe(schematics.cases.none.result);
});

test('is strictness', () => {
	expect(strictness.instance.is(strictness.cases.basic.input, true)).toEqual(false);

	const basic = strictness.instance.is(strictness.cases.basic.input, {
		errors: 'first',
		strict: true,
	});

	expect(basic.ok).toBe(strictness.cases.basic.ok);

	const basicError = (basic as Err<ValidationInformation>).error;

	expect(basicError.message).toBe(strictness.cases.basic.error);

	const nested = strictness.instance.is(strictness.cases.nested.input, {
		errors: 'first',
		strict: true,
	});

	expect(nested.ok).toBe(strictness.cases.nested.ok);

	const nestedError = (nested as Err<ValidationInformation>).error;

	expect(nestedError.message).toBe(strictness.cases.nested.error);

	expect(() =>
		strictness.instance.is(strictness.cases.basic.input, {strict: true, errors: 'throw'}),
	).toThrow(strictness.cases.basic.error);
});

test('is typed', () => {
	const outer = schematic<OuterSchema>({inner: typed.inner});

	for (let index = 0; index < typed.cases.length; index += 1) {
		expect(outer.is(typed.cases[index].input)).toBe(typed.cases[index].ok);
	}
});

test('is typed: throw', () => {
	const outer = schematic<OuterSchema>({inner: typed.inner});

	const invalidCases = typed.cases.filter(item => !item.ok);

	for (let index = 0; index < invalidCases.length; index += 1) {
		expect(() => outer.is(invalidCases[index].input, 'throw')).toThrow(invalidCases[index].error);
	}
});
