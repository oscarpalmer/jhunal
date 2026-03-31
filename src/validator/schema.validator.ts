import {isPlainObject} from '@oscarpalmer/atoms/is';
import type {Validator} from '../models/validation.model';
import {Schema, schemaValidators} from '../schema';

export function getSchemaValidator(schematic: Schema<unknown>): Validator {
	const validator = schemaValidators.get(schematic)!;

	return (input, parameters, get) => {
		let result: ReturnType<Validator>;

		if (isPlainObject(input)) {
			result = validator(input, parameters, get);
		} else {
			result = [];
		}

		if (result === true) {
			return result;
		}

		parameters.information?.push(...result);

		return result;
	};
}
