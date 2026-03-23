import {expect, test} from 'vitest';
import {schematic} from '../src';
import {errors, run} from './.fixture/validators.fixture';
import {getInvalidValidatorMessage} from '../src/helpers';

test('errors: run', () => {
	const first = schematic(run.schemas[0]);

	for (let index = 0; index < run.items.length - 1; index += 1) {
		const key = run.keys[index];

		expect(() => first.is(run.items[index], 'throw')).toThrow(
			getInvalidValidatorMessage(
				{
					key: {full: key, short: key},
				} as never,
				run.types[index] as never,
				run.indices[index],
				run.lengths[index],
			),
		);
	}
});

test('error: setup', () => {
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
