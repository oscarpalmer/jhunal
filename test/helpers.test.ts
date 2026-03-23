import {expect, test} from 'vitest';
import {
	MESSAGE_CONSTRUCTOR,
	TEMPLATE_PATTERN,
	VALIDATION_MESSAGE_INVALID_TYPE,
} from '../src/constants';
import {getInvalidTypeMessage, instanceOf, isSchematic} from '../src/helpers';
import {schematic} from '../src/schematic';
import {length, types, values} from './.fixture/helpers.fixture';
import {TestItem} from './.fixture/models.fixture';

test('getInvalidTypeMessage', () => {
	const property = {
		key: {
			full: 'nested.property',
			short: 'property',
		},
		types: ['fake'],
	};

	for (let index = 0; index < length; index += 1) {
		const actual = getInvalidTypeMessage(property as never, values[index]);

		const expectation = VALIDATION_MESSAGE_INVALID_TYPE.replace(TEMPLATE_PATTERN, "'fake'")
			.replace(TEMPLATE_PATTERN, property.key.full)
			.replace(TEMPLATE_PATTERN, types[index]);

		expect(actual).toBe(expectation);
	}

	let actual = getInvalidTypeMessage(
		property as never,
		schematic({
			property: 'number',
		}),
	);

	let expectation = VALIDATION_MESSAGE_INVALID_TYPE.replace(TEMPLATE_PATTERN, "'fake'")
		.replace(TEMPLATE_PATTERN, property.key.full)
		.replace(TEMPLATE_PATTERN, 'a Schematic');

	expect(actual).toBe(expectation);

	actual = getInvalidTypeMessage(
		{
			key: {
				full: 'nested.property',
				short: 'property',
			},
			types: ['one', 'two'],
		} as never,
		values[0],
	);

	expectation = VALIDATION_MESSAGE_INVALID_TYPE.replace(TEMPLATE_PATTERN, "'one' or 'two'")
		.replace(TEMPLATE_PATTERN, property.key.full)
		.replace(TEMPLATE_PATTERN, types[0]);

	expect(actual).toBe(expectation);

	actual = getInvalidTypeMessage(
		{
			key: {
				full: 'nested.property',
				short: 'property',
			},
			types: ['one', 'two', 'three'],
		} as never,
		values[0],
	);

	expectation = VALIDATION_MESSAGE_INVALID_TYPE.replace(
		TEMPLATE_PATTERN,
		"'one', 'two', or 'three'",
	)
		.replace(TEMPLATE_PATTERN, property.key.full)
		.replace(TEMPLATE_PATTERN, types[0]);

	expect(actual).toBe(expectation);
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
