import {isConstructor, isPlainObject} from '@oscarpalmer/atoms/is';
import type {PlainObject} from '@oscarpalmer/atoms/models';
import {smush} from '@oscarpalmer/atoms/value/misc';
import {
	EXPRESSION_HAS_NUMBER,
	EXPRESSION_INDEX,
	EXPRESSION_PROPERTY,
	MESSAGE_SCHEMA_INVALID_EMPTY,
	MESSAGE_SCHEMA_INVALID_PROPERTY_REQUIRED,
	MESSAGE_SCHEMA_INVALID_PROPERTY_TYPE,
	MESSAGE_VALIDATOR_INVALID_KEY,
	MESSAGE_VALIDATOR_INVALID_TYPE,
	MESSAGE_VALIDATOR_INVALID_VALUE,
	PROPERTY_REQUIRED,
	PROPERTY_TYPE,
	PROPERTY_VALIDATORS,
	TEMPLATE_PATTERN,
	TYPE_ALL,
	TYPE_OBJECT,
	TYPE_UNDEFINED,
	VALIDATABLE_TYPES,
} from '../constants';
import {isInstance, isSchematic} from '../is';
import {
	SchematicError,
	type Schema,
	type ValidatedPropertyType,
	type ValidatedPropertyValidators,
	type ValidatedSchema,
	type ValueName,
} from '../models';

function addPropertyType(
	to: ValidatedSchema,
	key: string,
	values: ValidatedPropertyType[],
	validators: ValidatedPropertyValidators,
	required: boolean,
): void {
	if (to.keys.set.has(key)) {
		const property = to.properties[key];

		for (const type of values) {
			property.types.push(type);
		}
	} else {
		to.keys.array.push(key);
		to.keys.set.add(key);

		to.properties[key] = {
			required,
			types: values,
			validators: {},
		};
	}

	if (!required && !to.properties[key].types.includes(TYPE_UNDEFINED)) {
		to.properties[key].types.push(TYPE_UNDEFINED);
	}

	to.properties[key].validators = validators;
}

export function getSchema(schema: Schema): ValidatedSchema {
	return getValidatedSchema(schema, {
		keys: {
			array: [],
			set: new Set<string>(),
		},
		properties: {},
	});
}

function getTypes(
	value: unknown,
	validated: ValidatedSchema,
	prefix: string,
): ValidatedPropertyType[] {
	const propertyTypes: ValidatedPropertyType[] = [];

	const values = Array.isArray(value) ? value : [value];
	const {length} = values;

	for (let index = 0; index < length; index += 1) {
		const type = values[index];

		if (isSchematic(type) || TYPE_ALL.has(type as never)) {
			propertyTypes.push(type);

			continue;
		}

		if (typeof type === 'function') {
			propertyTypes.push(isConstructor(type) ? isInstance(type) : type);

			continue;
		}

		if (!isPlainObject(type)) {
			throw new SchematicError(
				MESSAGE_SCHEMA_INVALID_PROPERTY_TYPE.replace(TEMPLATE_PATTERN, prefix),
			);
		}

		if (PROPERTY_TYPE in type) {
			propertyTypes.push(...getTypes(type[PROPERTY_TYPE], validated, prefix));

			continue;
		}

		const {[PROPERTY_REQUIRED]: required, ...nested} = type;

		if (PROPERTY_REQUIRED in type && typeof required !== 'boolean') {
			throw new SchematicError(
				MESSAGE_SCHEMA_INVALID_PROPERTY_REQUIRED.replace(TEMPLATE_PATTERN, prefix),
			);
		}

		addPropertyType(validated, prefix, [TYPE_OBJECT], {}, required !== false);

		propertyTypes.push(TYPE_OBJECT);

		getValidatedSchema(nested as Schema, validated, prefix);
	}

	return propertyTypes;
}

function getValidatedSchema(
	schema: Schema,
	validated: ValidatedSchema,
	prefix?: string,
): ValidatedSchema {
	const smushed = smush(schema as PlainObject);
	const keys = Object.keys(smushed);
	const {length} = keys;

	const arrayKeys = new Set<string>();
	const noPrefix = prefix == null;

	prefix = noPrefix ? '' : `${prefix}.`;

	for (let index = 0; index < length; index += 1) {
		const key = keys[index];
		const value = smushed[key];

		if (Array.isArray(value)) {
			arrayKeys.add(key);
		}

		if (EXPRESSION_PROPERTY.test(key)) {
			continue;
		}

		if (EXPRESSION_HAS_NUMBER.test(key) && arrayKeys.has(key.replace(EXPRESSION_INDEX, ''))) {
			continue;
		}

		let required = true;
		let validators: ValidatedPropertyValidators = {};

		const isObject = isPlainObject(value);

		if (isObject && PROPERTY_REQUIRED in value) {
			if (typeof value[PROPERTY_REQUIRED] !== 'boolean') {
				throw new SchematicError(
					MESSAGE_SCHEMA_INVALID_PROPERTY_REQUIRED.replace(TEMPLATE_PATTERN, key),
				);
			}

			required = value[PROPERTY_REQUIRED] === true;
		}

		if (isObject && PROPERTY_VALIDATORS in value) {
			validators = getValidators(value[PROPERTY_VALIDATORS]);
		}

		const prefixedKey = `${prefix}${key}`;

		const types = getTypes(value, validated, prefixedKey);

		if (types.length === 0) {
			throw new SchematicError(MESSAGE_SCHEMA_INVALID_PROPERTY_TYPE.replace(TEMPLATE_PATTERN, key));
		}

		addPropertyType(validated, prefixedKey, types, validators, required);
	}

	if (noPrefix) {
		validated.keys.array.sort();
	}

	if (noPrefix && validated.keys.array.length === 0) {
		throw new SchematicError(MESSAGE_SCHEMA_INVALID_EMPTY);
	}

	return validated;
}

function getValidators(original: unknown): ValidatedPropertyValidators {
	const validators: ValidatedPropertyValidators = {};

	if (original == null) {
		return validators;
	}

	if (!isPlainObject(original)) {
		throw new TypeError(MESSAGE_VALIDATOR_INVALID_TYPE);
	}

	const keys = Object.keys(original);
	const {length} = keys;

	for (let index = 0; index < length; index += 1) {
		const key = keys[index];

		if (!VALIDATABLE_TYPES.has(key as never)) {
			throw new TypeError(MESSAGE_VALIDATOR_INVALID_KEY.replace(TEMPLATE_PATTERN, key));
		}

		const value = (original as PlainObject)[key];

		validators[key as ValueName] = (Array.isArray(value) ? value : [value]).filter(item => {
			if (typeof item !== 'function') {
				throw new TypeError(MESSAGE_VALIDATOR_INVALID_VALUE.replace(TEMPLATE_PATTERN, key));
			}

			return true;
		});
	}

	return validators;
}
