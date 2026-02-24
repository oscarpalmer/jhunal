import {expect, test} from 'vitest';
import {schematic} from '../src';
import {errors, run} from './.fixture/validators.fixture';

test('error', () => {
	for (let index = 0; index < errors.length; index += 1) {
		expect(() => schematic(errors.schemas[index] as never)).toThrow(errors.messages[index]);
	}
});

test('run', () => {
	const first = schematic(run.schemas[0]);
	const second = schematic(run.schemas[1]);

	for (let index = 0; index < run.items.length; index += 1) {
		expect(first.is(run.items[index])).toBe(run.results[index]);
		expect(second.is(run.items[index])).toBe(true);
	}
});
