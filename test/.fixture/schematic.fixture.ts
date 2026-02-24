import {
	MESSAGE_SCHEMA_INVALID_EMPTY,
	MESSAGE_SCHEMA_INVALID_PROPERTY_REQUIRED,
	MESSAGE_SCHEMA_INVALID_PROPERTY_TYPE,
	MESSAGE_SCHEMA_INVALID_TYPE,
	TEMPLATE_PATTERN,
} from '../../src/constants';
import {Schema} from '../../src/models';
import {length as isLength, values as isValues} from './is.fixture';

export const errors = [
	...Array.from({length: isLength - 1}, () => MESSAGE_SCHEMA_INVALID_TYPE),
	MESSAGE_SCHEMA_INVALID_EMPTY,
	MESSAGE_SCHEMA_INVALID_PROPERTY_REQUIRED.replace(TEMPLATE_PATTERN, 'property'),
	MESSAGE_SCHEMA_INVALID_PROPERTY_TYPE.replace(TEMPLATE_PATTERN, 'property'),
	MESSAGE_SCHEMA_INVALID_PROPERTY_TYPE.replace(TEMPLATE_PATTERN, 'property'),
	MESSAGE_SCHEMA_INVALID_PROPERTY_TYPE.replace(TEMPLATE_PATTERN, 'property'),
	MESSAGE_SCHEMA_INVALID_PROPERTY_TYPE.replace(TEMPLATE_PATTERN, 'property'),
];

export const values = [
	...isValues.slice(0, isLength - 1),
	{},
	{
		property: {
			$required: 'not a boolean',
		},
	},
	{
		property: 'not a valid type',
	},
	{
		property: {
			$type: 'not a valid type',
		},
	},
	{
		property: {
			$type: [],
		},
	},
	{
		property: {
			$type: ['not a valid type'],
		},
	},
];

export const length = values.length;

export const schema = {
	optional: {
		$required: false,
		$type: 'boolean',
	},
	required: {
		$type: ['number', 'string'],
	},
} satisfies Schema;
