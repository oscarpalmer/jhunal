import {isPlainObject} from '@oscarpalmer/atoms/is';
import {
	PROPERTY_VALIDATORS,
	SCHEMATIC_MESSAGE_SCHEMA_INVALID_PROPERTY_DISALLOWED,
	SCHEMATIC_MESSAGE_VALIDATOR_INVALID_KEY,
	SCHEMATIC_MESSAGE_VALIDATOR_INVALID_TYPE,
	SCHEMATIC_MESSAGE_VALIDATOR_INVALID_VALUE,
	TEMPLATE_PATTERN,
	TYPE_ALL,
} from '../constants';
import type {ValueName} from '../models/misc.model';
import type {NamedValidatorHandlers} from '../models/validation.model';

export function getNamedHandlers(
	original: unknown,
	prefix: string,
	allowed: boolean,
): NamedValidatorHandlers {
	const handlers: NamedValidatorHandlers = {};

	if (original == null) {
		return handlers;
	}

	if (!allowed) {
		throw new TypeError(
			SCHEMATIC_MESSAGE_SCHEMA_INVALID_PROPERTY_DISALLOWED.replace(
				TEMPLATE_PATTERN,
				prefix,
			).replace(TEMPLATE_PATTERN, PROPERTY_VALIDATORS),
		);
	}

	if (!isPlainObject(original)) {
		throw new TypeError(SCHEMATIC_MESSAGE_VALIDATOR_INVALID_TYPE);
	}

	const keys = Object.keys(original);
	const {length} = keys;

	for (let index = 0; index < length; index += 1) {
		const key = keys[index];

		if (!TYPE_ALL.has(key as never)) {
			throw new TypeError(SCHEMATIC_MESSAGE_VALIDATOR_INVALID_KEY.replace(TEMPLATE_PATTERN, key));
		}

		const value = original[key];

		handlers[key as ValueName] = (Array.isArray(value) ? value : [value]).map(item => {
			if (typeof item !== 'function') {
				throw new TypeError(
					SCHEMATIC_MESSAGE_VALIDATOR_INVALID_VALUE.replace(TEMPLATE_PATTERN, key).replace(
						TEMPLATE_PATTERN,
						prefix,
					),
				);
			}

			return item;
		});
	}

	return handlers;
}
