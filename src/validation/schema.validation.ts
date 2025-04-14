import type {PlainObject} from '@oscarpalmer/atoms/models';
import {getTypes} from '../helpers';
import type {Schema, ValidatedPropertyType, ValidatedSchema} from '../model';

export function validateSchema(schema: unknown): ValidatedSchema {
	if (validatedSchemas.has(schema as never)) {
		return validatedSchemas.get(schema as never) as ValidatedSchema;
	}

	const validated: ValidatedSchema = {
		keys: [],
		length: 0,
		properties: {},
	};

	if (typeof schema !== 'object' || schema === null) {
		return validated;
	}

	const keys = Object.keys(schema);
	const {length} = keys;

	for (let index = 0; index < length; index += 1) {
		const key = keys[index];
		const value = (schema as Schema)[key];

		let required = true;
		let types: ValidatedPropertyType[];

		if (Array.isArray(value)) {
			types = getTypes(value);
		} else if (typeof value === 'object' && value !== null) {
			if (typeof (value as PlainObject).required === 'boolean') {
				required = (value as PlainObject).required as boolean;
			}

			types = getTypes((value as PlainObject).type);
		} else {
			types = getTypes(value);
		}

		if (types.length > 0) {
			if (!required && !types.includes('undefined')) {
				types.push('undefined');
			}

			validated.keys.push(key);

			validated.properties[key] = {
				required,
				types,
			};

			validated.length += 1;
		}
	}

	validatedSchemas.set(schema as never, validated);

	return validated;
}

export const validatedSchemas = new WeakMap<Schema, ValidatedSchema>();
