import {values} from './helpers.fixture';
import {schematic} from '../../src';

const Schema = schematic({
	date: 'date',
	message: 'string',
	optional: {
		$required: false,
		$type: 'boolean',
	},
	properties: {
		error: Error,
		set: Set,
	},
});

const failures = [
	...values,
	{
		date: new Date(),
		message: 'Hello, world!',
		properties: {
			error: 'not an error',
			set: new Set(),
		},
	},
	{
		date: 'not a date',
		message: 123,
		optional: true,
		properties: ['a', 'b', 'c'],
	},
];

const success = {
	date: new Date(),
	message: 'Hello, world!',
	optional: false,
	properties: {
		error: new Error('A test error'),
		set: new Set([1, 2, 3]),
	},
};

export const get = {
	failures,
	success,
	length: failures.length,
	lengths: [...values.map((_, index) => (index === values.length - 1 ? 3 : 1)), 1, 3],
	schema: Schema,
};
