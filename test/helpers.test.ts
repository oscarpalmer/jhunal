import {expect, test} from 'vitest';
import {MESSAGE_CONSTRUCTOR} from '../src/constants';
import {getInvalidTypeMessage, getOptions, instanceOf, isSchematic} from '../src/helpers';
import {schematic} from '../src/schematic';
import {cases, length, options, values} from './.fixture/helpers.fixture';
import {TestItem} from './.fixture/models.fixture';

test('getInvalidTypeMessage', () => {
	for (let index = 0; index < cases.length; index += 1) {
		const item = cases[index];

		expect(
			getInvalidTypeMessage(
				{
					...item.property,
					types: item.types,
				} as never,
				item.value,
			),
		).toBe(item.expected);
	}
});

test('getOptions', () => {
	expect(getOptions(options.errors.invalid.input)).toEqual(options.errors.invalid.result);
	expect(getOptions(options.errors.valid.input)).toEqual(options.errors.valid.result);

	expect(getOptions(options.object.invalid.input)).toEqual(options.object.invalid.result);
	expect(getOptions(options.object.valid.input)).toEqual(options.object.valid.result);

	expect(getOptions(options.strict.invalid.input)).toEqual(options.strict.invalid.result);
	expect(getOptions(options.strict.valid.input)).toEqual(options.strict.valid.result);
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
