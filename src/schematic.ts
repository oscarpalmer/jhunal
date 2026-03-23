import {isPlainObject} from '@oscarpalmer/atoms/is';
import type {PlainObject} from '@oscarpalmer/atoms/models';
import type {Result} from '@oscarpalmer/atoms/result/models';
import {PROPERTY_SCHEMATIC, SCHEMATIC_MESSAGE_SCHEMA_INVALID_TYPE} from './constants';
import {getReporting, isSchematic} from './helpers';
import type {Infer} from './models/infer.model';
import type {Schema} from './models/schema.plain.model';
import type {TypedSchema} from './models/schema.typed.model';
import {
	SchematicError,
	type ValidatedProperty,
	type ValidationInformation,
} from './models/validation.model';
import {getProperties} from './validation/property.validation';
import {validateObject} from './validation/value.validation';
import {error} from '@oscarpalmer/atoms/result/misc';

/**
 * A schematic for validating objects
 */
export class Schematic<Model> {
	declare private readonly $schematic: true;

	#properties: ValidatedProperty[];

	constructor(properties: ValidatedProperty[]) {
		Object.defineProperty(this, PROPERTY_SCHEMATIC, {
			value: true,
		});

		this.#properties = properties;
	}

	/**
	 * Does the value match the schema?
	 *
	 * Will assert that the values matches the schema and throw an error if it does not. The error will contain all validation information for the first property that fails validation.
	 * @param value Value to validate
	 * @param errors Throws an error for the first validation failure
	 * @returns `true` if the value matches the schema, otherwise throws an error
	 */
	is(value: unknown, errors: 'throw'): asserts value is Model;

	/**
	 * Does the value match the schema?
	 *
	 * Will validate that the value matches the schema and return a result of `true` or all validation information for validation failures from the same depth in the object.
	 * @param value Value to validate
	 * @param errors All
	 * @returns `true` if the value matches the schema, otherwise `false`
	 */
	is(value: unknown, errors: 'all'): Result<true, ValidationInformation[]>;

	/**
	 * Does the value match the schema?
	 *
	 * Will validate that the value matches the schema and return a result of `true` or all validation information for the failing property.
	 * @param value Value to validate
	 * @param errors First
	 * @returns `true` if the value matches the schema, otherwise `false`
	 */
	is(value: unknown, errors: 'first'): Result<true, ValidationInformation>;

	/**
	 * Does the value match the schema?
	 *
	 * Will validate that the value matches the schema and return `true` or `false`, without any validation information for validation failures.
	 * @param value Value to validate
	 * @returns `true` if the value matches the schema, otherwise `false`
	 */
	is(value: unknown): value is Model;

	is(value: unknown, errors?: unknown): unknown {
		const reporting = getReporting(errors);

		const result = validateObject(value, this.#properties, reporting);

		if (typeof result === 'boolean') {
			return result;
		}

		return error(reporting.all ? result : result[0]);
	}
}

/**
 * Create a schematic from a schema
 * @template Model Schema type
 * @param schema Schema to create the schematic from
 * @throws Throws {@link SchematicError} if the schema can not be converted into a schematic
 * @returns A schematic for the given schema
 */
export function schematic<Model extends Schema>(schema: Model): Schematic<Infer<Model>>;

/**
 * Create a schematic from a typed schema
 * @template Model Existing type
 * @param schema Typed schema to create the schematic from
 * @throws Throws {@link SchematicError} if the schema can not be converted into a schematic
 * @returns A schematic for the given typed schema
 */
export function schematic<Model extends PlainObject>(schema: TypedSchema<Model>): Schematic<Model>;

export function schematic<Model extends Schema>(schema: Model): Schematic<Model> {
	if (isSchematic(schema)) {
		return schema;
	}

	if (!isPlainObject(schema)) {
		throw new SchematicError(SCHEMATIC_MESSAGE_SCHEMA_INVALID_TYPE);
	}

	return new Schematic<Model>(getProperties(schema));
}
