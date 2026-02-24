import {expect, test} from 'vitest';
import {isSchematic} from '../src/is';
import {schematic} from '../src/schematic';
import {errors, length, schema, values} from './.fixture/schematic.fixture';

test('errors', () => {
	for (let index = 0; index < length; index += 1) {
		expect(() => schematic(values[index] as never)).toThrow(errors[index]);
	}
});

test('instance', () => {
	expect(isSchematic(schematic(schema))).toBe(true);
});
