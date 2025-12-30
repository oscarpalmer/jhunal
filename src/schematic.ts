import type {PlainObject} from '@oscarpalmer/atoms/models';
import {SCHEMATIC_NAME} from './constants';
import type {Infer, Schema, TypedSchema, ValidatedSchema} from './models';
import {validateSchema} from './validation/schema.validation';
import {validateValue} from './validation/value.validation';

/**
 * A schematic for validating objects
 */
export class Schematic<Model> {
	declare private readonly $schematic: true;

	#schema: ValidatedSchema;
	#validatable: boolean;

	get validatable(): boolean {
		return this.#validatable;
	}

	constructor(schema: Model) {
		Object.defineProperty(this, SCHEMATIC_NAME, {
			value: true,
		});

		this.#schema = validateSchema(schema);

		this.#validatable = this.#schema.keys.array.length > 0;
	}

	/**
	 * Does the value match the schema?
	 */
	is(value: unknown): value is Model {
		return this.#validatable && validateValue(this.#schema, value);
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
	return new Schematic<Model>(schema);
}
