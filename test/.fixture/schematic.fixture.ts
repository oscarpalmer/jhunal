import {
	MESSAGE_SCHEMA_INVALID_EMPTY,
	MESSAGE_SCHEMA_INVALID_PROPERTY_DISALLOWED,
	MESSAGE_SCHEMA_INVALID_PROPERTY_REQUIRED,
	MESSAGE_SCHEMA_INVALID_PROPERTY_TYPE,
	MESSAGE_SCHEMA_INVALID_PROPERTY_NULLABLE,
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

const invalidDisallowed = MESSAGE_SCHEMA_INVALID_PROPERTY_DISALLOWED;
const invalidEmpty = MESSAGE_SCHEMA_INVALID_EMPTY;
const invalidNullable = MESSAGE_SCHEMA_INVALID_PROPERTY_NULLABLE;
const invalidProperty = MESSAGE_SCHEMA_INVALID_PROPERTY_TYPE;
const invalidRequired = MESSAGE_SCHEMA_INVALID_PROPERTY_REQUIRED;
const invalidType = MESSAGE_SCHEMA_INVALID_TYPE;

const propNested = 'nested.property';
const propSimple = 'property';

const required = PROPERTY_REQUIRED;

const tpl = TEMPLATE_PATTERN;
const tplKey = TEMPLATE_PATTERN_KEY;
const tplProp = TEMPLATE_PATTERN_PROPERTY;

const type = PROPERTY_TYPE;
const validators = PROPERTY_VALIDATORS;

export const errors = [
	...Array.from({length: isLength - 1}, () => invalidType),
	invalidEmpty,
	invalidRequired.replace(tpl, propSimple),
	invalidDisallowed.replace(tplKey, propNested).replace(tplProp, required),
	invalidDisallowed.replace(tplKey, propNested).replace(tplProp, required),
	invalidProperty.replace(tpl, propSimple),
	invalidProperty.replace(tpl, propSimple),
	invalidProperty.replace(tpl, propSimple),
	invalidProperty.replace(tpl, propSimple),
	invalidProperty.replace(tpl, propNested),
	invalidProperty.replace(tpl, propNested),
	invalidProperty.replace(tpl, propNested),
	invalidProperty.replace(tpl, propNested),
	invalidDisallowed.replace(tplKey, propNested).replace(tplProp, type),
	invalidDisallowed.replace(tplKey, propNested).replace(tplProp, type),
	invalidDisallowed.replace(tplKey, propNested).replace(tplProp, validators),
	invalidDisallowed.replace(tplKey, propNested).replace(tplProp, validators),
	invalidNullable.replace(tpl, propSimple),
	invalidNullable.replace(tpl, propSimple),
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
	{
		property: null,
	},
	{
		property: undefined,
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
