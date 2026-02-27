import {
	MESSAGE_SCHEMA_INVALID_EMPTY,
	MESSAGE_SCHEMA_INVALID_PROPERTY_DISALLOWED,
	MESSAGE_SCHEMA_INVALID_PROPERTY_REQUIRED,
	MESSAGE_SCHEMA_INVALID_PROPERTY_TYPE,
	MESSAGE_SCHEMA_INVALID_TYPE,
	PROPERTY_REQUIRED,
	PROPERTY_TYPE,
	PROPERTY_VALIDATORS,
	TEMPLATE_PATTERN,
	TEMPLATE_PATTERN_KEY,
	TEMPLATE_PATTERN_PROPERTY,
} from '../../src/constants';
import {Schema} from '../../src/models';
import {length as isLength, values as isValues} from './helpers.fixture';

export const errors = [
	...Array.from({length: isLength - 1}, () => MESSAGE_SCHEMA_INVALID_TYPE),
	MESSAGE_SCHEMA_INVALID_EMPTY,
	MESSAGE_SCHEMA_INVALID_PROPERTY_REQUIRED.replace(TEMPLATE_PATTERN, 'property'),
	MESSAGE_SCHEMA_INVALID_PROPERTY_DISALLOWED.replace(
		TEMPLATE_PATTERN_KEY,
		'nested.property',
	).replace(TEMPLATE_PATTERN_PROPERTY, PROPERTY_REQUIRED),
	MESSAGE_SCHEMA_INVALID_PROPERTY_DISALLOWED.replace(
		TEMPLATE_PATTERN_KEY,
		'nested.property',
	).replace(TEMPLATE_PATTERN_PROPERTY, PROPERTY_REQUIRED),
	MESSAGE_SCHEMA_INVALID_PROPERTY_TYPE.replace(TEMPLATE_PATTERN, 'property'),
	MESSAGE_SCHEMA_INVALID_PROPERTY_TYPE.replace(TEMPLATE_PATTERN, 'property'),
	MESSAGE_SCHEMA_INVALID_PROPERTY_TYPE.replace(TEMPLATE_PATTERN, 'property'),
	MESSAGE_SCHEMA_INVALID_PROPERTY_TYPE.replace(TEMPLATE_PATTERN, 'property'),
	MESSAGE_SCHEMA_INVALID_PROPERTY_TYPE.replace(TEMPLATE_PATTERN, 'nested.property'),
	MESSAGE_SCHEMA_INVALID_PROPERTY_TYPE.replace(TEMPLATE_PATTERN, 'nested.property'),
	MESSAGE_SCHEMA_INVALID_PROPERTY_TYPE.replace(TEMPLATE_PATTERN, 'nested.property'),
	MESSAGE_SCHEMA_INVALID_PROPERTY_TYPE.replace(TEMPLATE_PATTERN, 'nested.property'),
	MESSAGE_SCHEMA_INVALID_PROPERTY_DISALLOWED.replace(
		TEMPLATE_PATTERN_KEY,
		'nested.property',
	).replace(TEMPLATE_PATTERN_PROPERTY, PROPERTY_TYPE),
	MESSAGE_SCHEMA_INVALID_PROPERTY_DISALLOWED.replace(
		TEMPLATE_PATTERN_KEY,
		'nested.property',
	).replace(TEMPLATE_PATTERN_PROPERTY, PROPERTY_TYPE),
	MESSAGE_SCHEMA_INVALID_PROPERTY_DISALLOWED.replace(
		TEMPLATE_PATTERN_KEY,
		'nested.property',
	).replace(TEMPLATE_PATTERN_PROPERTY, PROPERTY_VALIDATORS),
	MESSAGE_SCHEMA_INVALID_PROPERTY_DISALLOWED.replace(
		TEMPLATE_PATTERN_KEY,
		'nested.property',
	).replace(TEMPLATE_PATTERN_PROPERTY, PROPERTY_VALIDATORS),
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
		nested: {
			property: {
				$type: {
					$required: 'not allowed',
				},
			},
		},
	},
	{
		nested: {
			property: {
				$type: [
					{
						$required: 'not allowed',
					},
				],
			},
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
	{
		nested: {
			property: 'not a valid type',
		},
	},
	{
		nested: {
			property: {
				$type: 'not a valid type',
			},
		},
	},
	{
		nested: {
			property: {
				$type: [],
			},
		},
	},
	{
		nested: {
			property: {
				$type: ['not a valid type'],
			},
		},
	},
	{
		nested: {
			property: {
				$type: {
					$type: 'not allowed',
				},
			},
		},
	},
	{
		nested: {
			property: {
				$type: [
					{
						$type: 'not allowed',
					},
				],
			},
		},
	},
	{
		nested: {
			property: {
				$type: {
					$validators: 'not allowed',
				},
			},
		},
	},
	{
		nested: {
			property: {
				$type: [
					{
						$validators: 'not allowed',
					},
				],
			},
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
