import {expect, test} from 'vitest';
import {MESSAGE_CONSTRUCTOR} from '../src/constants';
import {instanceOf, isSchematic} from '../src/is';
import {schematic} from '../src/schematic';
import {length, values} from './.fixture/is.fixture';
import {TestItem} from './.fixture/models.fixture';

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
