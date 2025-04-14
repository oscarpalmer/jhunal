import type {Inferred, Schema, Schematic, Typed, TypedSchema} from './model';
import {getValidatedSchema, validate} from './validation';

/**
 * Create a schematic from a typed schema
 */
export function schematic<Model extends Typed>(
	schema: TypedSchema<Model>,
): Schematic<Model>;

/**
 * Create a schematic from a schema
 */
export function schematic<Model extends Schema>(
	schema: Model,
): Schematic<Inferred<Model>>;

export function schematic<Model extends Schema>(schema: Model) {
	const validated = getValidatedSchema(schema);

	const canValidate = validated.length > 0;

	return Object.freeze({
		is: (value: unknown) => canValidate && validate(validated, value),
	});
}
