import type {PlainObject} from '@oscarpalmer/atoms/models';
import {error, ok} from '@oscarpalmer/atoms/result/misc';
import {clone} from '@oscarpalmer/atoms/value/clone';
import {setValue} from '@oscarpalmer/atoms/value/handle';
import {CLONE_OPTIONS} from '../constants';
import type {ValidationHandler, ValidationHandlerParameters} from '../models/validation.model';
import {generateValidationInformation, getParameters} from './misc.helper';

// #region Functions

export function getResult(
	handler: ValidationHandler,
	value: unknown,
	getValue: boolean,
	options?: unknown,
): unknown {
	const [parameters, cloneValue] = getParameters(options);

	const result = handler(value, parameters, getValue);

	if (result === true) {
		if (getValue) {
			return getValidResult(value as PlainObject, parameters, cloneValue);
		}

		return parameters.reporting.none || parameters.reporting.throw ? result : ok(result);
	}

	if (parameters.reporting.none) {
		return getValue ? undefined : false;
	}

	const validation = generateValidationInformation(result);

	return error(parameters.reporting.all ? validation : validation[0]);
}

function getValidResult(
	input: PlainObject,
	parameters: ValidationHandlerParameters,
	cloneValue: boolean,
): PlainObject {
	const output = cloneValue ? clone(input, CLONE_OPTIONS) : input;

	if (parameters.defaulted != null) {
		const keys = Object.keys(parameters.defaulted);
		const {length} = keys;

		for (let index = 0; index < length; index += 1) {
			const key = keys[index];

			setValue(output, key, parameters.defaulted[key]);
		}
	}

	return parameters.reporting.none || parameters.reporting.throw ? output : ok(output);
}

// #endregion
