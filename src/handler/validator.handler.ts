import {getInputValueTypeMessage} from '../helpers/message.helper';
import {report} from '../helpers/report.helper';
import type {ValidationHandler, ValidationHandlerType} from '../models/validation.model';
import {getValueHandler} from './value.handler';

// #region Functions

export function getValidatorHandler(
	value: unknown,
	validators?: unknown,
): [ValidationHandler, ValidationHandlerType[]] {
	const {handler, types} = getValueHandler({
		validators,
		value,
	});

	const validator: ValidationHandler = (input, parameters, getValue) => {
		const result = handler(input, parameters, getValue);

		if (result === true) {
			return true;
		}

		if (parameters.key != null || parameters.reporting.none) {
			return [];
		}

		return report({
			value: input,
			data: {
				all: parameters.reports ?? [],
				existing: result.length > 0 ? result : undefined,
			},
			extract: false,
			message: {
				callback: getInputValueTypeMessage,
				parameters: [types, input],
			},
			original: parameters,
		})!;
	};

	return [validator, types];
}

// #endregion
