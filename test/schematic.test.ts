import {expect, test} from 'vitest';
import {isSchematic} from '../src/helpers';
import {schematic} from '../src/schematic';
import {errors, length, schema, values} from './.fixture/schematic.fixture';

test('errors', () => {
	for (let index = 0; index < length; index += 1) {
		expect(() => schematic(values[index] as never)).toThrow(errors[index]);
	}
});

test('instance', () => {
	const instance = schematic(schema);

	expect(isSchematic(instance)).toBe(true);
	expect(schematic(instance as never)).toBe(instance);
});
