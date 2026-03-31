import {expect, test} from 'vitest';
import {isSchema, schema} from '../src';
import {basic, defaults} from './.fixture/schematic.fixture';

test('errors', () => {
	for (let index = 0; index < basic.cases.length; index += 1) {
		expect(() => schema(basic.cases[index].schema as never)).toThrow(basic.cases[index].error);
	}

	for (let index = 0; index < defaults.schemas.length; index += 1) {
		expect(() => schema(defaults.schemas[index] as never)).toThrow(defaults.results[index]);
	}
});

test('instance', () => {
	const instance = schema(basic.schema);

	expect(isSchema(instance)).toBe(true);
	expect(schema(instance as never)).toBe(instance);
});
