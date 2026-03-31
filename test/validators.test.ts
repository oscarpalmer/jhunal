import {expect, test} from 'vitest';
import {schema} from '../src';
import {run, setup} from './.fixture/validators.fixture';

test('errors: run', () => {
	const first = schema(run.schemas[0]);

	const invalidCases = run.cases.filter(item => !item.ok);

	for (let index = 0; index < invalidCases.length; index += 1) {
		expect(() => first.is(invalidCases[index].input, 'throw')).toThrow(invalidCases[index].error);
	}
});

test('error: setup', () => {
	for (let index = 0; index < setup.cases.length; index += 1) {
		expect(() => schema(setup.cases[index].schema as never)).toThrow(setup.cases[index].error);
	}
});

test('run', () => {
	const first = schema(run.schemas[0]);
	const second = schema(run.schemas[1]);

	for (let index = 0; index < run.cases.length; index += 1) {
		expect(first.is(run.cases[index].input)).toBe(run.cases[index].ok);
		expect(second.is(run.cases[index].input)).toBe(true);
	}
});
