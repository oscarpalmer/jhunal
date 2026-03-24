import {isPlainObject} from '@oscarpalmer/atoms/is';
import type {GenericCallback} from '@oscarpalmer/atoms/models';
import {join} from '@oscarpalmer/atoms/string';
import {TYPE_OBJECT} from '../constants';
import {
	getInvalidInputMessage,
	getInvalidMissingMessage,
	getInvalidTypeMessage,
	getInvalidValidatorMessage,
	getUnknownKeysMessage,
	isSchematic,
} from '../helpers';
import type {ValueName} from '../models/misc.model';
import {
	ValidationError,
	type ValidatedProperty,
	type ValidatedPropertyType,
	type ValidationInformation,
	type ValidationOptionsExtended,
} from '../models/validation.model';
import {schematicProperties, type Schematic} from '../schematic';

function validateNamed(
	property: ValidatedProperty,
	name: ValueName,
	value: unknown,
	validation: ValidationInformation[],
): boolean {
	if (!validators[name](value)) {
		return false;
	}

	const propertyValidators = property.validators[name];

	if (propertyValidators == null || propertyValidators.length === 0) {
		return true;
	}

	const {length} = propertyValidators;

	for (let index = 0; index < length; index += 1) {
		const validator = propertyValidators[index];

		if (!validator(value)) {
			validation.push({
				value,
				key: {...property.key},
				message: getInvalidValidatorMessage(property, name, index, length),
				validator: validator as GenericCallback,
			});

			return false;
		}
	}

	return true;
}

export function validateObject(
	obj: unknown,
	properties: ValidatedProperty[],
	options: ValidationOptionsExtended,
	origin?: ValidatedProperty,
	validation?: ValidationInformation[],
): boolean | ValidationInformation[] {
	if (!isPlainObject(obj)) {
		const key = origin == null ? {full: '', short: ''} : {...origin.key};

		const information = {
			key,
			message:
				origin == null
					? getInvalidInputMessage(obj)
					: getInvalidTypeMessage(
							{
								...origin,
								key,
							},
							obj,
						),
			value: obj,
		};

		if (options.reporting.throw) {
			throw new ValidationError([information]);
		}

		validation?.push(information);

		return options.reporting.none ? false : [information];
	}

	if (options.strict) {
		const objKeys = Object.keys(obj);

		const propertiesKeys = new Set(properties.map(property => property.key.short));

		const unknownKeys = objKeys.filter(key => !propertiesKeys.has(key));

		if (unknownKeys.length > 0) {
			const key = origin == null ? {full: '', short: ''} : {...origin.key};

			const information: ValidationInformation = {
				key,
				message: getUnknownKeysMessage(unknownKeys.map(key => join([origin?.key.full, key], '.'))),
				value: obj,
			};

			if (options.reporting.throw) {
				throw new ValidationError([information]);
			}

			validation?.push(information);

			return options.reporting.none ? false : [information];
		}
	}

	const allInformation: ValidationInformation[] = [];

	const propertiesLength = properties.length;

	outer: for (let propertyIndex = 0; propertyIndex < propertiesLength; propertyIndex += 1) {
		let property = properties[propertyIndex];

		property = {
			...property,
			key: {
				full: join([origin?.key.full, property.key.short], '.'),
				short: property.key.short,
			},
		};

		const {key, required, types} = property;

		const value = obj[key.short];

		if (value === undefined && required) {
			const information: ValidationInformation = {
				value,
				key: {...key},
				message: getInvalidMissingMessage(property),
			};

			if (options.reporting.throw && validation == null) {
				throw new ValidationError([information]);
			}

			if (validation != null) {
				validation.push(information);
			}

			if (options.reporting.all) {
				allInformation.push(information);

				continue;
			}

			return options.reporting.none ? false : [information];
		}

		const typesLength = types.length;

		const information: ValidationInformation[] = [];

		for (let typeIndex = 0; typeIndex < typesLength; typeIndex += 1) {
			const type = types[typeIndex];

			if (validateValue(type, property, value, options, information)) {
				continue outer;
			}
		}

		if (information.length === 0) {
			information.push({
				value,
				key: {...key},
				message: getInvalidTypeMessage(property, value),
			});
		}

		if (options.reporting.throw && validation == null) {
			throw new ValidationError(information);
		}

		validation?.push(...information);

		if (options.reporting.all) {
			allInformation.push(...information);

			continue;
		}

		return options.reporting.none ? false : information;
	}

	return options.reporting.none || allInformation.length === 0 ? true : allInformation;
}

function validateSchematic(
	property: ValidatedProperty,
	schematic: Schematic<unknown>,
	value: unknown,
	options: ValidationOptionsExtended,
	validation: ValidationInformation[],
): boolean {
	const properties = schematicProperties.get(schematic)!;

	const result = validateObject(value, properties, options, property, validation);

	return typeof result === 'boolean' ? result : result.length === 0;
}

function validateValue(
	type: ValidatedPropertyType,
	property: ValidatedProperty,
	value: unknown,
	options: ValidationOptionsExtended,
	validation: ValidationInformation[],
): boolean {
	switch (true) {
		case typeof type === 'function':
			return (type as GenericCallback)(value);

		case Array.isArray(type): {
			const validated = validateObject(value, type, options, property, validation);

			return typeof validated === 'boolean' ? validated : false;
		}

		case isSchematic(type):
			return validateSchematic(property, type, value, options, validation);

		default:
			return validateNamed(property, type as ValueName, value, validation);
	}
}

//

const validators: Record<ValueName, (value: unknown) => boolean> = {
	array: Array.isArray,
	bigint: value => typeof value === 'bigint',
	boolean: value => typeof value === 'boolean',
	date: value => value instanceof Date,
	function: value => typeof value === 'function',
	null: value => value === null,
	number: value => typeof value === 'number',
	object: value => typeof value === TYPE_OBJECT && value !== null,
	string: value => typeof value === 'string',
	symbol: value => typeof value === 'symbol',
	undefined: value => value === undefined,
};
