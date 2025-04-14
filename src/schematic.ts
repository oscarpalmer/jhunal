import type {Inferred, Schema, Schematic, Typed, TypedSchema} from './model';
import {validateSchema} from './validation/schema.validation';
import {validateValue} from './validation/value.validation';

/**
 * Create a schematic from a schema
 */
export function schematic<Model extends Schema>(
	schema: Model,
): Schematic<Inferred<Model>>;

/**
 * Create a schematic from a typed schema
 */
export function schematic<Model extends Typed>(
	schema: TypedSchema<Model>,
): Schematic<Model>;

export function schematic<Model extends Schema>(
	schema: Model,
): Schematic<Model> {
	const validated = validateSchema(schema);

	const canValidate = validated.length > 0;

	return Object.freeze({
		$schematic: true,
		is: (value: unknown) => canValidate && validateValue(validated, value),
	}) as never;
}
