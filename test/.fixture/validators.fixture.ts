import {
	SCHEMATIC_MESSAGE_VALIDATOR_INVALID_KEY,
	SCHEMATIC_MESSAGE_VALIDATOR_INVALID_TYPE,
	SCHEMATIC_MESSAGE_VALIDATOR_INVALID_VALUE,
	TEMPLATE_PATTERN,
} from '../../src/constants';
import {getInvalidValidatorMessage} from '../../src/helpers/message.helper';
import {Schema} from '../../src/models/schema.plain.model';

const invalidKey = 'invalid';

const invalidValidators = 'number';

const tpl = TEMPLATE_PATTERN;

export const setup = {
	cases: [
		{
			schema: {
				property: {
					$type: 'number',
					$validators: 123,
				},
			},
			error: SCHEMATIC_MESSAGE_VALIDATOR_INVALID_TYPE,
		},
		{
			schema: {
				property: {
					$type: 'number',
					$validators: {
						[invalidKey]: null,
					},
				},
			},
			error: SCHEMATIC_MESSAGE_VALIDATOR_INVALID_KEY.replace(tpl, invalidKey),
		},
		{
			schema: {
				property: {
					$type: 'number',
					$validators: {
						[invalidValidators]: 'blah',
					},
				},
			},
			error: SCHEMATIC_MESSAGE_VALIDATOR_INVALID_VALUE.replace(tpl, invalidValidators),
		},
		{
			schema: {
				property: {
					$type: 'number',
					$validators: {
						[invalidValidators]: ['blah'],
					},
				},
			},
			error: SCHEMATIC_MESSAGE_VALIDATOR_INVALID_VALUE.replace(tpl, invalidValidators),
		},
	],
};

export const run = {
	cases: [
		{
			input: {age: -5, name: 'Test'},
			ok: false,
			error: getInvalidValidatorMessage('age', 'number', 0, 2),
		},
		{
			input: {age: 200, name: 'Test'},
			ok: false,
			error: getInvalidValidatorMessage('age', 'number', 1, 2),
		},
		{
			input: {age: 25, name: ''},
			ok: false,
			error: getInvalidValidatorMessage('name', 'string', 0, 1),
		},
		{
			input: {age: 25, name: 'Test Test Test'},
			ok: false,
			error: getInvalidValidatorMessage('name', 'string', 0, 1),
		},
		{
			input: {age: 25, name: 'Test'},
			ok: true,
		},
	],
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
