import {
	PROPERTY_REQUIRED,
	PROPERTY_TYPE,
	PROPERTY_VALIDATORS,
	SCHEMATIC_MESSAGE_SCHEMA_INVALID_EMPTY,
	SCHEMATIC_MESSAGE_SCHEMA_INVALID_PROPERTY_DISALLOWED,
	SCHEMATIC_MESSAGE_SCHEMA_INVALID_PROPERTY_NULLABLE,
	SCHEMATIC_MESSAGE_SCHEMA_INVALID_PROPERTY_REQUIRED,
	SCHEMATIC_MESSAGE_SCHEMA_INVALID_PROPERTY_TYPE,
	SCHEMATIC_MESSAGE_SCHEMA_INVALID_TYPE,
	TEMPLATE_PATTERN,
} from '../../src/constants';
import {Schema} from '../../src/models/schema.plain.model';
import {length as isLength, values as isValues} from './helpers.fixture';

const invalidDisallowed = SCHEMATIC_MESSAGE_SCHEMA_INVALID_PROPERTY_DISALLOWED;
const invalidEmpty = SCHEMATIC_MESSAGE_SCHEMA_INVALID_EMPTY;
const invalidNullable = SCHEMATIC_MESSAGE_SCHEMA_INVALID_PROPERTY_NULLABLE;
const invalidProperty = SCHEMATIC_MESSAGE_SCHEMA_INVALID_PROPERTY_TYPE;
const invalidRequired = SCHEMATIC_MESSAGE_SCHEMA_INVALID_PROPERTY_REQUIRED;
const invalidType = SCHEMATIC_MESSAGE_SCHEMA_INVALID_TYPE;

const propertyFull = 'nested.property';
const propertyShort = 'property';

const required = PROPERTY_REQUIRED;

const tpl = TEMPLATE_PATTERN;

const type = PROPERTY_TYPE;
const validators = PROPERTY_VALIDATORS;

export const errors = [
	...Array.from({length: isLength - 1}, () => invalidType),
	invalidEmpty,
	invalidRequired.replace(tpl, propertyShort),
	invalidDisallowed.replace(tpl, propertyFull).replace(tpl, required),
	invalidDisallowed.replace(tpl, propertyFull).replace(tpl, required),
	invalidProperty.replace(tpl, propertyShort),
	invalidProperty.replace(tpl, propertyShort),
	invalidProperty.replace(tpl, propertyShort),
	invalidProperty.replace(tpl, propertyShort),
	invalidProperty.replace(tpl, propertyFull),
	invalidProperty.replace(tpl, propertyFull),
	invalidProperty.replace(tpl, propertyFull),
	invalidProperty.replace(tpl, propertyFull),
	invalidDisallowed.replace(tpl, propertyFull).replace(tpl, type),
	invalidDisallowed.replace(tpl, propertyFull).replace(tpl, type),
	invalidDisallowed.replace(tpl, propertyFull).replace(tpl, validators),
	invalidDisallowed.replace(tpl, propertyFull).replace(tpl, validators),
	invalidNullable.replace(tpl, propertyShort),
	invalidNullable.replace(tpl, propertyShort),
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
