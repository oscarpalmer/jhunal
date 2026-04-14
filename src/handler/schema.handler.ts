import {isPlainObject} from '@oscarpalmer/atoms/is';
import type {ValidationHandler} from '../models/validation.model';
import {Schema, schemaHandlers} from '../schema';

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

		parameters.information?.push(...result);

		return result;
	};
}
