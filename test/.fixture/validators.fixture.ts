import {
	SCHEMATIC_MESSAGE_VALIDATOR_INVALID_KEY,
	SCHEMATIC_MESSAGE_VALIDATOR_INVALID_TYPE,
	SCHEMATIC_MESSAGE_VALIDATOR_INVALID_VALUE,
	TEMPLATE_PATTERN,
} from '../../src/constants';
import {Schema} from '../../src/models/schema.plain.model';

const invalidKey = 'invalid';
const invalidValidators = 'number';

export const errors = {
	length: 4,
	messages: [
		SCHEMATIC_MESSAGE_VALIDATOR_INVALID_TYPE,
		SCHEMATIC_MESSAGE_VALIDATOR_INVALID_KEY.replace(TEMPLATE_PATTERN, invalidKey),
		SCHEMATIC_MESSAGE_VALIDATOR_INVALID_VALUE.replace(TEMPLATE_PATTERN, invalidValidators),
		SCHEMATIC_MESSAGE_VALIDATOR_INVALID_VALUE.replace(TEMPLATE_PATTERN, invalidValidators),
	],
	schemas: [
		{
			property: {
				$type: 'number',
				$validators: 123,
			},
		},
		{
			property: {
				$type: 'number',
				$validators: {
					[invalidKey]: null,
				},
			},
		},
		{
			property: {
				$type: 'number',
				$validators: {
					[invalidValidators]: 'blah',
				},
			},
		},
		{
			property: {
				$type: 'number',
				$validators: {
					[invalidValidators]: ['blah'],
				},
			},
		},
	],
};

export const run = {
	indices: [0, 1, 0, 0],
	items: [
		{
			age: -5,
			name: 'Test',
		},
		{
			age: 200,
			name: 'Test',
		},
		{
			age: 25,
			name: '',
		},
		{
			age: 25,
			name: 'Test Test Test',
		},
		{
			age: 25,
			name: 'Test',
		},
	],
	keys: ['age', 'age', 'name', 'name'],
	length: 5,
	lengths: [2, 2, 1, 1],
	results: [false, false, false, false, true],
	schemas: [
		{
			age: {
				$type: 'number',
				$validators: {
					number: [age => age > 0, age => age < 150],
				},
			},
			name: {
				$type: 'string',
				$validators: {
					string: name => name.length > 0 && name.length < 10,
				},
			},
		} satisfies Schema,
		{
			age: {
				$type: 'number',
				$validators: undefined,
			},
			name: {
				$type: 'string',
				$validators: null as never,
			},
		} satisfies Schema,
	],
	types: ['number', 'number', 'string', 'string'],
};
