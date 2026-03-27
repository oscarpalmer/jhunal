import {expect, test} from 'vitest';
import {isSchematic} from '../src/helpers/misc.helper';
import {schematic} from '../src/schematic';
import {basic, defaults} from './.fixture/schematic.fixture';

test('errors', () => {
	for (let index = 0; index < basic.cases.length; index += 1) {
		expect(() => schematic(basic.cases[index].schema as never)).toThrow(basic.cases[index].error);
	}

	for (let index = 0; index < defaults.schemas.length; index += 1) {
		expect(() => schematic(defaults.schemas[index] as never)).toThrow(defaults.results[index]);
	}
});

test('instance', () => {
	const instance = schematic(basic.schema);

	expect(isSchematic(instance)).toBe(true);
	expect(schematic(instance as never)).toBe(instance);
});
