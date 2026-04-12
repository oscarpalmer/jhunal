import {isPlainObject} from '@oscarpalmer/atoms/is';
import {
	PROPERTY_VALIDATORS,
	SCHEMATIC_MESSAGE_SCHEMA_INVALID_PROPERTY_DISALLOWED,
	SCHEMATIC_MESSAGE_VALIDATOR_INVALID_KEY,
	SCHEMATIC_MESSAGE_VALIDATOR_INVALID_TYPE,
	SCHEMATIC_MESSAGE_VALIDATOR_INVALID_VALUE,
	TEMPLATE_PATTERN,
	TYPES_ALL,
} from '../constants';
import {getInputPropertyValidatorMessage} from '../helpers/message.helper';
import type {ValueType} from '../models/misc.model';
import type {
	TypedHandlers,
	TypeHandlers,
	ValidationHandler,
	ValidationInformation,
	ValidationInformationKey,
} from '../models/validation.model';

export function getTypeHandler(
	type: ValueType,
	handlers: TypedHandlers,
	key?: ValidationInformationKey,
): ValidationHandler {
	const handler = typeHandlers[type];

	const typedHandlers = handlers[type] ?? [];
	const {length} = typedHandlers;

	return (input, parameters) => {
		if (!handler(input)) {
			return [];
		}

		for (let index = 0; index < length; index += 1) {
			const handler = typedHandlers[index];

			if (handler(input) === true) {
				continue;
			}

			const information: ValidationInformation = {
				key,
				message:
					key == null ? '' : getInputPropertyValidatorMessage(key?.full, type, index, length),
				validator: handler,
				value: input,
			};

			parameters.information?.push(information);

			return parameters.reporting.none ? [] : [information];
		}

		return true;
	};
}

export function getTypeHandlers(
	original: unknown,
	prefix: string,
	allowed: boolean,
): TypedHandlers {
	const handlers: TypedHandlers = {};

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

		if (!TYPES_ALL.has(key as never)) {
			throw new TypeError(SCHEMATIC_MESSAGE_VALIDATOR_INVALID_KEY.replace(TEMPLATE_PATTERN, key));
		}

		const value = original[key];

		handlers[key as ValueType] = (Array.isArray(value) ? value : [value]).map(item => {
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

const typeHandlers: TypeHandlers = {
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
