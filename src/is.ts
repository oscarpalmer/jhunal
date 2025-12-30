import {SCHEMATIC_NAME} from './constants';
import type {Schematic} from './schematic';

export function isDateLike(value: unknown): value is Date {
	if (value instanceof Date) {
		return true;
	}

	if (typeof value === 'number') {
		return value >= -8_640e12 && value <= 8_640e12;
	}

	return typeof value === 'string' && !Number.isNaN(Date.parse(value));
}

export function isSchematic(value: unknown): value is Schematic<never> {
	return (
		typeof value === 'object' &&
		value !== null &&
		SCHEMATIC_NAME in value &&
		value[SCHEMATIC_NAME] === true
	);
}
