import {isError} from '@oscarpalmer/atoms/result/misc';
import {Err} from '@oscarpalmer/atoms/result/models';
import {expect, test} from 'vitest';
import {
	SCHEMATIC_MESSAGE_VALIDATOR_INVALID_TYPE,
	VALIDATOR_MESSAGE_INVALID_VALIDATOR,
} from '../src/constants';
import {ValueValidation} from '../src/models/validation.model';
import {validator} from '../src/validator';
import {firstError, invalid, schematic, simple, validators} from './.fixture/validator.fixture';

test('first', () => {
	for (let index = 0; index < firstError.length; index += 1) {
		const result = firstError.validators[index].is(firstError.cases[index] as never, 'result');

		expect(isError(result)).toBe(true);

		const error = (result as Err<ValueValidation>).error;

		expect(error.message).toEqual(firstError.messages[index]);
	}
});

test('invalid', () => {
	for (let index = 0; index < invalid.length; index += 1) {
		expect(() => validator(invalid.cases[index] as never)).toThrow(invalid.messages[index]);
	}
});

test('schema', () => {
	expect(
		schematic.instance.is({
			validated: 123,
		}),
	).toBe(true);

	const result = schematic.instance.is(
		{
			validated: '123',
		},
		'first',
	);

	expect(isError(result)).toBe(true);

	const error = (result as Err<ValueValidation>).error;

	expect(error.message).toEqual(schematic.message);

	expect(() =>
		schematic.instance.is(
			{
				validated: '123',
			},
			'throw',
		),
	).toThrow(schematic.message);
});

test('simple', () => {
	for (let index = 0; index < simple.length; index += 1) {
		expect(validator(simple.cases[index] as never).is(simple.values[index])).toBe(true);
	}

	const instance = validator('string');

	expect(validator(instance as never)).toBe(instance);
});

test('validators', () => {
	for (let index = 0; index < validators.length; index += 1) {
		const booleans = validators.instances.map(validator => validator.is(validators.cases[index]));
		const results = validators.instances.map(validator =>
			validator.is(validators.cases[index], 'result'),
		);

		expect(booleans).toEqual(validators.booleans[index]);

		for (const item of results) {
			expect(item).toEqual(validators.results[index][results.indexOf(item)]);
		}
	}

	expect(
		validator(
			((value: unknown) => typeof value === 'number') as never,
			((value: number) => value > 0) as never,
		).is(-100),
	).toBe(true);

	expect(() => validator(['date', 'number'], (() => true) as never)).toThrow(
		SCHEMATIC_MESSAGE_VALIDATOR_INVALID_TYPE,
	);

	expect(() =>
		validator('number', {
			number: 'blah' as never,
		}),
	).toThrow(VALIDATOR_MESSAGE_INVALID_VALIDATOR);
});
