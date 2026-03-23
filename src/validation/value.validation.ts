import {isPlainObject} from '@oscarpalmer/atoms/is';
import type {GenericCallback} from '@oscarpalmer/atoms/models';
import {
	getInvalidInputMessage,
	getInvalidMissingMessage,
	getInvalidTypeMessage,
	getInvalidValidatorMessage,
	isSchematic,
} from '../helpers';
import type {ValueName} from '../models/misc.model';
import {
	ValidationError,
	type ReportingInformation,
	type ValidatedProperty,
	type ValidatedPropertyType,
	type ValidationInformation,
} from '../models/validation.model';

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
	reporting: ReportingInformation,
	validation?: ValidationInformation[],
): boolean {
	if (!isPlainObject(obj)) {
		if (reporting.throw && validation == null) {
			throw new ValidationError([
				{
					key: {full: '', short: ''},
					message: getInvalidInputMessage(obj),
				},
			]);
		}

		return false;
	}

	const propertiesLength = properties.length;

	outer: for (let propertyIndex = 0; propertyIndex < propertiesLength; propertyIndex += 1) {
		const property = properties[propertyIndex];

		const {key, required, types} = property;

		const value = obj[key.short];

		if (value === undefined && required) {
			const information: ValidationInformation = {
				key: {...key},
				message: getInvalidMissingMessage(property),
			};

			if (reporting.throw && validation == null) {
				throw new ValidationError([information]);
			}

			if (validation != null) {
				validation.push(information);
			}

			return false;
		}

		const typesLength = types.length;

		const information: ValidationInformation[] = [];

		for (let typeIndex = 0; typeIndex < typesLength; typeIndex += 1) {
			const type = types[typeIndex];

			if (validateValue(type, property, value, reporting, information)) {
				continue outer;
			}
		}

		if (reporting.throw && validation == null) {
			throw new ValidationError(
				information.length === 0
					? [
							{
								key: {...key},
								message: getInvalidTypeMessage(property, value),
							},
						]
					: information,
			);
		}

		validation?.push(...information);

		return false;
	}

	return true;
}

function validateValue(
	type: ValidatedPropertyType,
	property: ValidatedProperty,
	value: unknown,
	reporting: ReportingInformation,
	validation: ValidationInformation[],
): boolean {
	let result: boolean;

	switch (true) {
		case typeof type === 'function':
			result = (type as GenericCallback)(value);
			break;

		case Array.isArray(type):
			result = validateObject(value, type, reporting, validation);
			break;

		case isSchematic(type):
			result = type.is(value, reporting as never) as unknown as boolean;
			break;

		default:
			result = validateNamed(property, type as ValueName, value, validation);
			break;
	}

	return result;
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
	object: value => typeof value === 'object' && value !== null,
	string: value => typeof value === 'string',
	symbol: value => typeof value === 'symbol',
	undefined: value => value === undefined,
};
