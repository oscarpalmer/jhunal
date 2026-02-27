import {isConstructor} from '@oscarpalmer/atoms/is';
import type {Constructor} from '@oscarpalmer/atoms/models';
import {MESSAGE_CONSTRUCTOR, SCHEMATIC_NAME} from './constants';
import type {Schematic} from './schematic';

/**
 * Creates a validator function for a given constructor
 * @param constructor - Constructor to check against
 * @throws Will throw a `TypeError` if the provided argument is not a valid constructor
 * @returns Validator function that checks if a value is an instance of the constructor
 */
export function instanceOf<Instance>(
	constructor: Constructor<Instance>,
): (value: unknown) => value is Instance {
	if (!isConstructor(constructor)) {
		throw new TypeError(MESSAGE_CONSTRUCTOR);
	}

	return (value: unknown): value is Instance => {
		return value instanceof constructor;
	};
}

/**
 * Is the value a schematic?
 * @param value Value to check
 * @returns `true` if the value is a schematic, `false` otherwise
 */
export function isSchematic(value: unknown): value is Schematic<never> {
	return (
		typeof value === 'object' &&
		value !== null &&
		SCHEMATIC_NAME in value &&
		value[SCHEMATIC_NAME] === true
	);
}
