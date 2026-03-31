import {isError, isOk} from '@oscarpalmer/atoms/result/misc';
import {Err, Ok} from '@oscarpalmer/atoms/result/models';
import {expect, test} from 'vitest';
import {ValidationError, ValidationInformation} from '../src/models/validation.model';
import {defaults, get} from './.fixture/schema.get.fixture';

test('get all', () => {
	for (let index = 0; index < get.length; index += 1) {
		const result = get.schema.get(get.failures[index], 'all');

		expect(isError(result)).toBe(true);

		const error = (result as Err<ValidationInformation[]>).error;

		expect(error.length).toBe(get.lengths[index]);
	}

	const result = get.schema.get(get.success, 'all');

	expect(isOk(result)).toBe(true);

	const value = (result as Ok<any>).value;

	expect(value).toEqual(get.success);

	expect(get.success.date).not.toBe(value.date);
	expect(get.success.date.getTime()).toBe(value.date.getTime());
});

test('get first', () => {
	for (let index = 0; index < get.length; index += 1) {
		const result = get.schema.get(get.failures[index], 'first');

		expect(isError(result)).toBe(true);
		expect((result as Err<ValidationInformation>).error.message).toBeTypeOf('string');
	}

	const result = get.schema.get(get.success, 'first');

	expect(isOk(result)).toBe(true);

	const value = (result as Ok<any>).value;

	expect(value).toEqual(get.success);

	expect(get.success.date).not.toBe(value.date);
	expect(get.success.date.getTime()).toBe(value.date.getTime());
});

test('get none', () => {
	for (let index = 0; index < get.length; index += 1) {
		expect(get.schema.get(get.failures[index])).toBe(undefined);
	}

	const result = get.schema.get(get.success);

	expect(result).toEqual(get.success);

	expect(get.success.date).not.toBe(result!.date);
	expect(get.success.date.getTime()).toBe(result!.date.getTime());
});

test('get throw', () => {
	for (let index = 0; index < get.length; index += 1) {
		expect(() => get.schema.get(get.failures[index], 'throw')).toThrow(ValidationError);
	}

	const result = get.schema.get(get.success);

	expect(result).toEqual(get.success);

	expect(get.success.date).not.toBe(result!.date);
	expect(get.success.date.getTime()).toBe(result!.date.getTime());
});

test('get: clone options', () => {
	const cloned = get.schema.get(get.success, {
		errors: 'none',
	});

	const defaulted = get.schema.get(get.success, {
		clone: 'blah' as never,
		errors: 'none',
	});

	const noClone = get.schema.get(get.success, {
		clone: false,
		errors: 'none',
	});

	expect(get.success.date).not.toBe(cloned!.date);
	expect(get.success.date).not.toBe(defaulted!.date);
	expect(get.success.date).toBe(noClone!.date);

	const clonedResult = get.schema.get(get.success, {
		clone: true,
		errors: 'first',
	});

	const defaultedResult = get.schema.get(get.success, {
		clone: 'blah' as never,
		errors: 'first',
	});

	const noCloneResult = get.schema.get(get.success, {
		clone: false,
		errors: 'first',
	});

	expect(get.success.date).not.toBe((clonedResult as Ok<any>).value.date);
	expect(get.success.date).not.toBe((defaultedResult as Ok<any>).value.date);
	expect(get.success.date).toBe((noCloneResult as Ok<any>).value.date);
});

test('get: defaults', () => {
	expect(defaults.schema.get(defaults.input.defaulted)).toEqual(defaults.result.defaulted);
	expect(defaults.schema.get(defaults.input.ignored)).toEqual(defaults.result.ignored);

	expect(defaults.schema.get(defaults.input.updated, {
		clone: false,
		errors: 'none',
	})).toEqual(defaults.result.updated);

	expect(defaults.input.updated.num).toBe(42);
});
