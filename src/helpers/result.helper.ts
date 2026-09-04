import type {PlainObject} from '@oscarpalmer/atoms/models';
import {error, ok} from '@oscarpalmer/atoms/result/misc';
import type {ValidationHandler, ValidationHandlerParameters} from '../models/validation.model';
import {generateValidationInformation, getParameters} from './misc.helper';

// #region Functions

export function getResult(
	handler: ValidationHandler,
	value: unknown,
	getValue: boolean,
	options?: unknown,
): unknown {
	const parameters = getParameters(options);

	const result = handler(value, parameters, getValue);

	if (result === true) {
		if (getValue) {
			return getValidResult(value as PlainObject, parameters);
		}

		return parameters.reporting.none || parameters.reporting.throw ? result : ok(result);
	}

	if (parameters.reporting.none) {
		return getValue ? undefined : false;
	}

	const validation = generateValidationInformation(result);

	return error(parameters.reporting.all ? validation : validation[0]);
}

function getValidResult(input: PlainObject, parameters: ValidationHandlerParameters): PlainObject {
	const output = parameters.clone ? parameters.output : input;

	if (parameters.keys.values != null) {
		const {length} = parameters.keys.values;

		for (let index = 0; index < length; index += 1) {
			delete output[parameters.keys.values[index]];
		}
	}

	return parameters.reporting.none || parameters.reporting.throw ? output : ok(output);
}

// #endregion
