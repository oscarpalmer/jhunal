import {expect, test} from 'vitest';
import {schematic} from '../src/schematic';
import {basic, complex, typed, type InnerSchema, type OuterSchema} from './.fixture/schema.fixture';
import {TestItem} from './.fixture/models.fixture';

test('basic', () => {
	const instance = schematic(basic.schema);

	for (let index = 0; index < basic.length; index += 1) {
		expect(instance.is(basic.values[index])).toBe(index === basic.length - 1);
	}
});

test('complex', () => {
	const instance = schematic(complex.schema);

	for (let index = 0; index < complex.length; index += 1) {
		expect(instance.is(complex.values[index])).toBe(index === complex.length - 2);
	}

	expect(() =>
		schematic({
			...complex.schema,
			n: {
				$type: {
					...complex.schema.n,
					$required: 'not a boolean',
				},
			},
		} as never),
	).toThrow(complex.errors[0]);
});

test('typed', () => {
	const inner = schematic<InnerSchema>({
		message: 'string',
		test: value => value instanceof TestItem,
	});

	const outer = schematic<OuterSchema>({
		inner,
	});

	for (let index = 0; index < typed.length; index += 1) {
		expect(outer.is(typed.values[index])).toBe(index === typed.length - 1);
	}
});
