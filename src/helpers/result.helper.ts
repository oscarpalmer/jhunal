import {error, ok} from '@oscarpalmer/atoms/result/misc';
import type {ValidationHandler} from '../models/validation.model';
import {getParameters} from './misc.helper';

export function getResult(handler: ValidationHandler, value: unknown, options?: unknown): unknown {
	const parameters = getParameters(options);

	const result = handler(value, parameters, true);

	if (result === true) {
		return parameters.reporting.none || parameters.reporting.throw
			? parameters.clone
				? parameters.output
				: value
			: ok(parameters.clone ? parameters.output : value);
	}

	if (parameters.reporting.none) {
		return;
	}

	return error(parameters.reporting.all ? result : result[0]);
}

export function isResult(handler: ValidationHandler, value: unknown, options?: unknown): unknown {
	const parameters = getParameters(options);

	const result = handler(value, parameters, false);

	if (result === true) {
		return parameters.reporting.none || parameters.reporting.throw ? result : ok(result);
	}

	if (parameters.reporting.none) {
		return false;
	}

	return error(parameters.reporting.all ? result : result[0]);
}
