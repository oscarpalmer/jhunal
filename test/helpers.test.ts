import {expect, test} from 'vitest';
import {instanceOf, isSchematic} from '../src';
import {MESSAGE_CONSTRUCTOR} from '../src/constants';
import {getInvalidTypeMessage} from '../src/helpers/message.helper';
import {getParameters} from '../src/helpers/misc.helper';
import {schematic} from '../src/schematic';
import {cases, length, parameters, values} from './.fixture/helpers.fixture';
import {TestItem} from './.fixture/models.fixture';

test('getInvalidTypeMessage', () => {
	for (let index = 0; index < cases.length; index += 1) {
		const item = cases[index];

		expect(getInvalidTypeMessage(item.key, item.types as never, item.value)).toBe(item.expected);
	}
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

test('isSchematic', () => {
	for (let index = 0; index < length; index += 1) {
		expect(isSchematic(values[index] as never)).toBe(false);
	}

	expect(
		isSchematic(
			schematic({
				key: 'number',
			}),
		),
	).toBe(true);
});
