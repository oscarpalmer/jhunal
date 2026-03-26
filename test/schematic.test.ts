import {expect, test} from 'vitest';
import {isSchematic} from '../src/helpers/misc.helper';
import {schematic} from '../src/schematic';
import {cases, schema} from './.fixture/schematic.fixture';

test('errors', () => {
	for (let index = 0; index < cases.length; index += 1) {
		expect(() => schematic(cases[index].schema as never)).toThrow(cases[index].error);
	}
});

test('instance', () => {
	const instance = schematic(schema);

	expect(isSchematic(instance)).toBe(true);
	expect(schematic(instance as never)).toBe(instance);
});
