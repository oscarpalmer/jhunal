import {isPlainObject} from '@oscarpalmer/atoms/is';
import type {PlainObject} from '@oscarpalmer/atoms/models';
import {MESSAGE_SCHEMA_INVALID_TYPE, SCHEMATIC_NAME} from './constants';
import {
	SchematicError,
	type Infer,
	type Schema,
	type TypedSchema,
	type ValidatedSchema,
} from './models';
import {getSchema} from './validation/schema.validation';
import {validateValue} from './validation/value.validation';

/**
 * A schematic for validating objects
 */
export class Schematic<Model> {
	declare private readonly $schematic: true;

	#schema: ValidatedSchema;

	constructor(schema: ValidatedSchema) {
		Object.defineProperty(this, SCHEMATIC_NAME, {
			value: true,
		});

		this.#schema = schema;
	}

	/**
	 * Does the value match the schema?
	 */
	is(value: unknown): value is Model {
		return validateValue(this.#schema, value);
	}
}

/**
 * Create a schematic from a schema
 */
export function schematic<Model extends Schema>(schema: Model): Schematic<Infer<Model>>;

/**
 * Create a schematic from a typed schema
 */
export function schematic<Model extends PlainObject>(schema: TypedSchema<Model>): Schematic<Model>;

export function schematic<Model extends Schema>(schema: Model): Schematic<Model> {
	if (!isPlainObject(schema)) {
		throw new SchematicError(MESSAGE_SCHEMA_INVALID_TYPE);
	}

	const validated = getSchema(schema);

	return new Schematic<Model>(validated);
}
