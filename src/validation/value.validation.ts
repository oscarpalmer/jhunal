import type {PlainObject} from '@oscarpalmer/atoms/models';
import type {ValidatedSchema} from '../model';
import {validateType} from './type.validation';

export function validateValue(
	validated: ValidatedSchema,
	obj: unknown,
): boolean {
	if (typeof obj !== 'object' || obj === null) {
		return false;
	}

	outer: for (let keyIndex = 0; keyIndex < validated.length; keyIndex += 1) {
		const key = validated.keys[keyIndex];
		const property = validated.properties[key];
		const value = (obj as PlainObject)[key];

		if (
			value === undefined &&
			property.required &&
			!property.types.includes('undefined')
		) {
			return false;
		}

		const typesLength = property.types.length;

		if (typesLength === 1) {
			if (!validateType(property.types[0], value)) {
				return false;
			}

			continue;
		}

		for (let typeIndex = 0; typeIndex < typesLength; typeIndex += 1) {
			if (validateType(property.types[typeIndex], value)) {
				continue outer;
			}
		}

		return false;
	}

	return true;
}
