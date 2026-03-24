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
import {values as typeValues} from './helpers.fixture';

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

export const cases = [
	...Array.from({length: typeValues.length - 1}, (_, index) => ({
		schema: typeValues[index],
		error: invalidType,
	})),
	{
		schema: {},
		error: invalidEmpty,
	},
	{
		schema: {
			property: {
				$required: 'not a boolean',
			},
		},
		error: invalidRequired.replace(tpl, propertyShort),
	},
	{
		schema: {
			nested: {
				property: {
					$type: {
						$required: 'not allowed',
					},
				},
			},
		},
		error: invalidDisallowed.replace(tpl, propertyFull).replace(tpl, required),
	},
	{
		schema: {
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
		error: invalidDisallowed.replace(tpl, propertyFull).replace(tpl, required),
	},
	{
		schema: {
			property: 'not a valid type',
		},
		error: invalidProperty.replace(tpl, propertyShort),
	},
	{
		schema: {
			property: {
				$type: 'not a valid type',
			},
		},
		error: invalidProperty.replace(tpl, propertyShort),
	},
	{
		schema: {
			property: {
				$type: [],
			},
		},
		error: invalidProperty.replace(tpl, propertyShort),
	},
	{
		schema: {
			property: {
				$type: ['not a valid type'],
			},
		},
		error: invalidProperty.replace(tpl, propertyShort),
	},
	{
		schema: {
			nested: {
				property: 'not a valid type',
			},
		},
		error: invalidProperty.replace(tpl, propertyFull),
	},
	{
		schema: {
			nested: {
				property: {
					$type: 'not a valid type',
				},
			},
		},
		error: invalidProperty.replace(tpl, propertyFull),
	},
	{
		schema: {
			nested: {
				property: {
					$type: [],
				},
			},
		},
		error: invalidProperty.replace(tpl, propertyFull),
	},
	{
		schema: {
			nested: {
				property: {
					$type: ['not a valid type'],
				},
			},
		},
		error: invalidProperty.replace(tpl, propertyFull),
	},
	{
		schema: {
			nested: {
				property: {
					$type: {
						$type: 'not allowed',
					},
				},
			},
		},
		error: invalidDisallowed.replace(tpl, propertyFull).replace(tpl, type),
	},
	{
		schema: {
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
		error: invalidDisallowed.replace(tpl, propertyFull).replace(tpl, type),
	},
	{
		schema: {
			nested: {
				property: {
					$type: {
						$validators: 'not allowed',
					},
				},
			},
		},
		error: invalidDisallowed.replace(tpl, propertyFull).replace(tpl, validators),
	},
	{
		schema: {
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
		error: invalidDisallowed.replace(tpl, propertyFull).replace(tpl, validators),
	},
	{
		schema: {
			property: null,
		},
		error: invalidNullable.replace(tpl, propertyShort),
	},
	{
		schema: {
			property: undefined,
		},
		error: invalidNullable.replace(tpl, propertyShort),
	},
];

export const schema = {
	optional: {
		$required: false,
		$type: 'boolean',
	},
	required: {
		$type: ['number', 'string'],
	},
} satisfies Schema;
