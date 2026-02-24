import {
	MESSAGE_VALIDATOR_INVALID_KEY,
	MESSAGE_VALIDATOR_INVALID_TYPE,
	MESSAGE_VALIDATOR_INVALID_VALUE,
	TEMPLATE_PATTERN,
} from '../../src/constants';
import {Schema} from '../../src/models';

const invalidKey = 'invalid';
const invalidValidators = 'number';

export const errors = {
	length: 4,
	messages: [
		MESSAGE_VALIDATOR_INVALID_TYPE,
		MESSAGE_VALIDATOR_INVALID_KEY.replace(TEMPLATE_PATTERN, invalidKey),
		MESSAGE_VALIDATOR_INVALID_VALUE.replace(TEMPLATE_PATTERN, invalidValidators),
		MESSAGE_VALIDATOR_INVALID_VALUE.replace(TEMPLATE_PATTERN, invalidValidators),
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
	length: 5,
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
};
