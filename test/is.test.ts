import {expect, test} from 'vitest';
import {MESSAGE_CONSTRUCTOR} from '../src/constants';
import {isInstance, isSchematic} from '../src/is';
import {schematic} from '../src/schematic';
import {length, values} from './.fixture/is.fixture';
import {TestItem} from './.fixture/models.fixture';

test('isInstance', () => {
	for (let index = 0; index < length; index += 1) {
		expect(() => isInstance(values[index] as never)).toThrow(MESSAGE_CONSTRUCTOR);
	}

	const isInstanceofTestItem = isInstance(TestItem);

	expect(isInstanceofTestItem).toBeTypeOf('function');
	expect(isInstanceofTestItem(new TestItem('Alice', 30))).toBe(true);
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
