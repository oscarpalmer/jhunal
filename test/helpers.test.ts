import {expect, test} from 'vitest';
import {instanceOf, isSchema, schema} from '../src';
import {MESSAGE_CONSTRUCTOR} from '../src/constants';
import {getInputPropertyTypeMessage} from '../src/helpers/message.helper';
import {getParameters} from '../src/helpers/misc.helper';
import {cases, length, parameters, validatorCase, values} from './.fixture/helpers.fixture';
import {TestItem} from './.fixture/models.fixture';

test('getInvalidTypeMessage', () => {
	for (let index = 0; index < cases.length; index += 1) {
		const item = cases[index];

		expect(getInputPropertyTypeMessage(item.key, item.types as never, item.value)).toBe(
			item.expected,
		);
	}

	expect(
		getInputPropertyTypeMessage(
			validatorCase.key,
			[validatorCase.type.original],
			validatorCase.value.original,
		),
	).toBe(validatorCase.message);
});

test('getParameters', () => {
	expect(getParameters(parameters.errors.invalid.input)).toEqual(parameters.errors.invalid.result);
	expect(getParameters(parameters.errors.valid.input)).toEqual(parameters.errors.valid.result);

	expect(getParameters(parameters.object.invalid.input)).toEqual(parameters.object.invalid.result);
	expect(getParameters(parameters.object.valid.input)).toEqual(parameters.object.valid.result);

	expect(getParameters(parameters.strict.invalid.input)).toEqual(parameters.strict.invalid.result);
	expect(getParameters(parameters.strict.valid.input)).toEqual(parameters.strict.valid.result);
});

test('instanceOf', () => {
	for (let index = 0; index < length; index += 1) {
		expect(() => instanceOf(values[index] as never)).toThrow(MESSAGE_CONSTRUCTOR);
	}

	const isInstanceofTestItem = instanceOf(TestItem);

	expect(isInstanceofTestItem).toBeTypeOf('function');
	expect(isInstanceofTestItem(new TestItem())).toBe(true);
});

test('isSchema', () => {
	for (let index = 0; index < length; index += 1) {
		expect(isSchema(values[index] as never)).toBe(false);
	}

	expect(
		isSchema(
			schema({
				key: 'number',
			}),
		),
	).toBe(true);
});
