import {isPlainObject} from '@oscarpalmer/atoms/is';
import type {PlainObject} from '@oscarpalmer/atoms/models';
import {join} from '@oscarpalmer/atoms/string';
import {
	PROPERTY_DEFAULT,
	PROPERTY_REQUIRED,
	PROPERTY_TYPE,
	PROPERTY_VALIDATORS,
	TYPE_UNDEFINED,
	TYPES_ALL,
	VALIDATOR_MESSAGE_INVALID_PROPERTY_NULLABLE,
	VALIDATOR_MESSAGE_INVALID_PROPERTY_TYPE,
} from '../constants';
import {
	getDefaultRequiredMessage,
	getDefaultTypeMessage,
	getDisallowedMessage,
	getRequiredMessage,
	getSchematicPropertyNullableMessage,
	getSchematicPropertyTypeMessage,
} from '../helpers/message.helper';
import {getParameters, isSchema, isValidator} from '../helpers/misc.helper';
import type {ValueType} from '../models/misc.model';
import {
	type PropertyValidationKey,
	SchematicError,
	type ValidationHandler,
	type ValidationHandlerDefaults,
	type ValidationHandlerItem,
	type ValidationHandlerType,
	ValidatorError,
	type Validators,
} from '../models/validation.model';
import {getBaseHandler} from './base.handler';
import {getFunctionHandler} from './function.handler';
import {getObjectHandler} from './object.handler';
import {getSchemaHandler} from './schema.handler';
import {getTypeHandler, getTypeValidators, getValidators} from './type.handler';
import {validatorHandlers} from '../validator';

type Input = {
	validators?: unknown;
	value: unknown;
};

type PropertyInformation = {
	key: string;
	origin?: PropertyValidationKey;
};

function getDefaults(
	obj: PlainObject,
	key: string,
	allowed: boolean,
): ValidationHandlerDefaults | undefined {
	if (!(PROPERTY_DEFAULT in obj)) {
		return;
	}

	if (!allowed) {
		throw new SchematicError(getDisallowedMessage(key, PROPERTY_DEFAULT));
	}

	return {
		value: obj[PROPERTY_DEFAULT],
	};
}

function getRequired(obj: PlainObject, key: string, allowed: boolean): boolean | undefined {
	if (!(PROPERTY_REQUIRED in obj)) {
		return;
	}

	if (!allowed) {
		throw new SchematicError(getDisallowedMessage(key, PROPERTY_REQUIRED));
	}

	if (typeof obj[PROPERTY_REQUIRED] !== 'boolean') {
		throw new SchematicError(getRequiredMessage(key));
	}

	return obj[PROPERTY_REQUIRED];
}

export function getValueHandler(
	input: Input,
	property?: PropertyInformation,
): ValidationHandlerItem {
	const isProperty = property != null;

	const prefixedKey = isProperty
		? property.origin == null
			? property.key
			: join([property.origin.full, property.key], '.')
		: '';

	const {value} = input;

	if (value == null) {
		if (isProperty) {
			throw new SchematicError(getSchematicPropertyNullableMessage(prefixedKey));
		}

		throw new ValidatorError(VALIDATOR_MESSAGE_INVALID_PROPERTY_NULLABLE);
	}

	const fullKey: PropertyValidationKey = {
		full: prefixedKey,
		short: property?.key ?? '',
	};

	let required = true;
	let typed = false;
	let validators: Validators = {};

	let defaults: ValidationHandlerDefaults | undefined;

	let types: ValidationHandlerType[];

	const handlers: ValidationHandler[] = [];

	if (isProperty && isPlainObject(value)) {
		typed = PROPERTY_TYPE in value;

		const type = typed ? value[PROPERTY_TYPE] : value;

		defaults = getDefaults(value, prefixedKey, typed);
		required = getRequired(value, prefixedKey, typed) ?? required;
		validators = getValidators(value[PROPERTY_VALIDATORS], typed, prefixedKey);

		types = Array.isArray(type) ? type : [type];
	} else {
		types = Array.isArray(value) ? value : [value];

		if (input.validators != null) {
			validators = getTypeValidators(types, input.validators);
		}
	}

	const typesLength = types.length;

	let invalid = false;

	typeLoop: for (let typeIndex = 0; typeIndex < typesLength; typeIndex += 1) {
		const type = types[typeIndex];

		let handler: ValidationHandler;

		switch (true) {
			case typeof type === 'function':
				handler = getFunctionHandler(type);
				break;

			case isProperty && isPlainObject(type):
				handler = getObjectHandler(type, fullKey, typed);
				break;

			case isProperty && isSchema(type):
				handler = getSchemaHandler(type);
				break;

			case isProperty && isValidator(type):
				handler = validatorHandlers.get(type)!;
				break;

			case TYPES_ALL.has(type as ValueType):
				handler = getTypeHandler(type as ValueType, validators, isProperty ? fullKey : undefined);
				break;

			default:
				invalid = true;
				break typeLoop;
		}

		handlers.push(handler);
	}

	if (invalid || handlers.length === 0) {
		if (isProperty) {
			throw new SchematicError(getSchematicPropertyTypeMessage(prefixedKey));
		}

		throw new ValidatorError(VALIDATOR_MESSAGE_INVALID_PROPERTY_TYPE);
	}

	required = required && !types.includes(TYPE_UNDEFINED);

	if (defaults != null && !required) {
		throw new SchematicError(getDefaultRequiredMessage(prefixedKey));
	}

	const handler = getBaseHandler(handlers);

	if (
		defaults != null &&
		Array.isArray(handler(defaults.value, getParameters(isProperty), false))
	) {
		throw new SchematicError(getDefaultTypeMessage(prefixedKey, types));
	}

	return {defaults, handler, required, types, key: fullKey};
}
