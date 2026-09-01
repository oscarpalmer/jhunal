import {isPlainObject} from '@oscarpalmer/atoms/is';
import type {Schema} from '../models/schema.model';
import type {ValidationHandler} from '../models/validation.model';
import {schemaHandlers} from '../schema';

// #region Functions

export function getSchemaHandler(schematic: Schema<unknown>): ValidationHandler {
	const handler = schemaHandlers.get(schematic)!;

	return (input, parameters, get) => {
		let result: ReturnType<ValidationHandler>;

		if (isPlainObject(input)) {
			result = handler(input, parameters, get);
		} else {
			result = [];
		}

		if (result === true) {
			return result;
		}

		if (!parameters.reporting.none) {
			parameters.information?.push(...result);
		}

		return result;
	};
}

// #endregion
