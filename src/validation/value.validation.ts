import {isPlainObject} from '@oscarpalmer/atoms/is';
import type {GenericCallback} from '@oscarpalmer/atoms/models';
import {TYPE_OBJECT} from '../constants';
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
	reporting: ReportingInformation,
	property?: ValidatedProperty,
	validation?: ValidationInformation[],
): boolean | ValidationInformation[] {
	if (!isPlainObject(obj)) {
		const information = {
			key: {full: '', short: ''},
			message:
				property == null ? getInvalidInputMessage(obj) : getInvalidTypeMessage(property, obj),
			value: obj,
		};

		if (reporting.throw) {
			throw new ValidationError([information]);
		}

		return reporting.none ? false : [information];
	}

	const allInformation: ValidationInformation[] = [];

	const propertiesLength = properties.length;

	outer: for (let propertyIndex = 0; propertyIndex < propertiesLength; propertyIndex += 1) {
		const property = properties[propertyIndex];

		const {key, required, types} = property;

		const value = obj[key.short];

		if (value === undefined && required) {
			const information: ValidationInformation = {
				value,
				key: {...key},
				message: getInvalidMissingMessage(property),
			};

			if (reporting.throw && validation == null) {
				throw new ValidationError([information]);
			}

			if (validation != null) {
				validation.push(information);
			}

			if (reporting.all) {
				allInformation.push(information);

				continue;
			}

			return reporting.none ? false : [information];
		}

		const typesLength = types.length;

		const information: ValidationInformation[] = [];

		for (let typeIndex = 0; typeIndex < typesLength; typeIndex += 1) {
			const type = types[typeIndex];

			if (validateValue(type, property, value, reporting, information)) {
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

		if (reporting.throw && validation == null) {
			throw new ValidationError(information);
		}

		validation?.push(...information);

		if (reporting.all) {
			allInformation.push(...information);

			continue;
		}

		return reporting.none ? false : information;
	}

	return reporting.none ? true : allInformation.length === 0 ? true : allInformation;
}

function validateValue(
	type: ValidatedPropertyType,
	property: ValidatedProperty,
	value: unknown,
	reporting: ReportingInformation,
	validation: ValidationInformation[],
): boolean {
	switch (true) {
		case typeof type === 'function':
			return (type as GenericCallback)(value);

		case Array.isArray(type): {
			const nested = validateObject(value, type, reporting, property, validation);
			return typeof nested !== 'boolean' ? false : nested;
		}

		case isSchematic(type):
			return type.is(value, reporting as never) as unknown as boolean;

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
