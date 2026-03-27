import {getInputPropertyValidatorMessage} from '../helpers/message.helper';
import type {ValueName} from '../models/misc.model';
import type {
	NamedValidatorHandlers,
	NamedValidators,
	ValidationInformation,
	ValidationInformationKey,
	Validator,
} from '../models/validation.model';

export function getNamedValidator(
	key: ValidationInformationKey,
	name: ValueName,
	handlers: NamedValidatorHandlers,
): Validator {
	const validator = namedValidators[name];

	const named = handlers[name] ?? [];
	const {length} = named;

	return (input, parameters) => {
		if (!validator(input)) {
			return [];
		}

		for (let index = 0; index < length; index += 1) {
			const handler = named[index];

			if (handler(input) === true) {
				continue;
			}

			const information: ValidationInformation = {
				key,
				validator,
				message: getInputPropertyValidatorMessage(key.full, name, index, length),
				value: input,
			};

			parameters.information?.push(information);

			return parameters.reporting.none ? [] : [information];
		}

		return true;
	};
}

const namedValidators: NamedValidators = {
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
