import {isPlainObject} from '@oscarpalmer/atoms/is';
import {
	PROPERTY_VALIDATORS,
	SCHEMATIC_MESSAGE_SCHEMA_INVALID_PROPERTY_DISALLOWED,
	SCHEMATIC_MESSAGE_VALIDATOR_INVALID_KEY,
	SCHEMATIC_MESSAGE_VALIDATOR_INVALID_TYPE,
	SCHEMATIC_MESSAGE_VALIDATOR_INVALID_VALUE,
	TEMPLATE_PATTERN,
	TYPES_ALL,
	VALIDATOR_MESSAGE_INVALID_VALIDATOR,
} from '../constants';
import {
	getInputPropertyValidatorMessage,
	getInputValueValidatorMessage,
} from '../helpers/message.helper';
import type {ValueType} from '../models/misc.model';
import {
	type PropertyValidation,
	type PropertyValidationKey,
	type TypeValidators,
	type ValidationHandler,
	type ValidationHandlerType,
	type Validators,
	SchematicError,
	ValidatorError,
} from '../models/validation.model';

export function getTypeHandler(
	type: ValueType,
	validators: Validators,
	key?: PropertyValidationKey,
): ValidationHandler {
	const validator = typeValidators[type];

	const typedValidators = validators[type] ?? [];
	const {length} = typedValidators;

	return (input, parameters) => {
		if (!validator(input)) {
			return [];
		}

		for (let index = 0; index < length; index += 1) {
			const validator = typedValidators[index];

			if (validator(input) === true) {
				continue;
			}

			const information: PropertyValidation = {
				validator,
				message:
					key == null
						? getInputValueValidatorMessage(type, index, length)
						: getInputPropertyValidatorMessage(key.full, type, index, length),
				value: input,
			};

			if (key != null) {
				information.key = key;
			}

			parameters.information?.push(information);

			return parameters.reporting.none ? [] : [information];
		}

		return true;
	};
}

export function getTypeValidators(types: ValidationHandlerType[], original: unknown): Validators {
	const values = types.filter(type => TYPES_ALL.has(type as ValueType)) as ValueType[];
	const {length} = values;

	const validators: Validators = {};

	if (original == null || length === 0) {
		return validators;
	}

	if (typeof original === 'function' || Array.isArray(original)) {
		if (length > 1) {
			throw new ValidatorError(SCHEMATIC_MESSAGE_VALIDATOR_INVALID_TYPE);
		}

		return getValidators({[values[0]]: original}, true);
	}

	return getValidators(original, true);
}

export function getValidators(original: unknown, allowed: boolean, prefix?: string): Validators {
	const validators: Validators = {};

	if (original == null) {
		return validators;
	}

	if (!allowed) {
		throw new SchematicError(
			SCHEMATIC_MESSAGE_SCHEMA_INVALID_PROPERTY_DISALLOWED.replace(
				TEMPLATE_PATTERN,
				prefix!,
			).replace(TEMPLATE_PATTERN, PROPERTY_VALIDATORS),
		);
	}

	if (!isPlainObject(original)) {
		throw new SchematicError(SCHEMATIC_MESSAGE_VALIDATOR_INVALID_TYPE);
	}

	const keys = Object.keys(original);
	const {length} = keys;

	for (let index = 0; index < length; index += 1) {
		const key = keys[index];

		if (!TYPES_ALL.has(key as never)) {
			throw new SchematicError(
				SCHEMATIC_MESSAGE_VALIDATOR_INVALID_KEY.replace(TEMPLATE_PATTERN, key),
			);
		}

		const value = original[key];

		validators[key as ValueType] = (Array.isArray(value) ? value : [value]).map(item => {
			if (typeof item !== 'function') {
				if (prefix == null) {
					throw new ValidatorError(VALIDATOR_MESSAGE_INVALID_VALIDATOR);
				} else {
					throw new SchematicError(
						SCHEMATIC_MESSAGE_VALIDATOR_INVALID_VALUE.replace(TEMPLATE_PATTERN, key).replace(
							TEMPLATE_PATTERN,
							prefix,
						),
					);
				}
			}

			return item;
		});
	}

	return validators;
}

const typeValidators: TypeValidators = {
	array: Array.isArray,
	bigint: value => typeof value === 'bigint',
	boolean: value => typeof value === 'boolean',
	date: value => value instanceof Date,
	function: value => typeof value === 'function',
	null: value => value === null,
	number: value => typeof value === 'number',
	object: value => typeof value === 'object' && value !== null,
	string: value => typeof value === 'string',
	symbol: value => typeof value === 'symbol',
	undefined: value => value === undefined,
};
