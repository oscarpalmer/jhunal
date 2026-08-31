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

	const validator: ValidationHandler = (input, parameters, get) => {
		const result = handler(input, parameters, get);

		if (result === true) {
			return true;
		}

		if (parameters.key != null || parameters.reporting.none) {
			return [];
		}

		const reported = report({
			value: input,
			extract: false,
			information: {
				all: parameters.information ?? [],
				existing: result.length > 0 ? result : undefined,
			},
			message: {
				arguments: [types, input],
				callback: getInputValueTypeMessage,
			},
			original: parameters,
		})!;

		return reported;
	};

	return [validator, types];
}

// #endregion
