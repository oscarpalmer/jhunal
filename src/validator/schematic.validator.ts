import {isPlainObject} from '@oscarpalmer/atoms/is';
import type {Validator} from '../models/validation.model';
import {Schematic, schematicValidator} from '../schematic';

export function getSchematicValidator(schematic: Schematic<unknown>): Validator {
	const validator = schematicValidator.get(schematic)!;

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
