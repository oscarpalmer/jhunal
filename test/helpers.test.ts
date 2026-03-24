import {expect, test} from 'vitest';
import {MESSAGE_CONSTRUCTOR} from '../src/constants';
import {getInvalidTypeMessage, instanceOf, isSchematic} from '../src/helpers';
import {schematic} from '../src/schematic';
import {cases, length, values} from './.fixture/helpers.fixture';
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
