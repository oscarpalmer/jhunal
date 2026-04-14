import {isPlainObject} from '@oscarpalmer/atoms/is';
import type {PlainObject} from '@oscarpalmer/atoms/models';
import type {Result} from '@oscarpalmer/atoms/result/models';
import {PROPERTY_SCHEMA, SCHEMATIC_MESSAGE_SCHEMA_INVALID_TYPE} from './constants';
import {getObjectHandler} from './handler/object.handler';
import {isSchema} from './helpers/misc.helper';
import {getResult, isResult} from './helpers/result.helper';
import type {Infer} from './models/infer.model';
import type {Schematic} from './models/schematic.plain.model';
import type {TypedSchematic} from './models/schematic.typed.model';
import {
	SchematicError,
	type GetOptions,
	type IsOptions,
	type ValidationHandler,
	type PropertyValidation,
} from './models/validation.model';

/**
 * A schema for validating objects
 */
export class Schema<Model> {
	declare private readonly $schema: true;

	readonly #handler: ValidationHandler;

	constructor(validator: ValidationHandler) {
		Object.defineProperty(this, PROPERTY_SCHEMA, {
			value: true,
		});

		this.#handler = validator;

		schemaHandlers.set(this, validator);
	}

	/**
	 * Parse a value according to the schema
	 *
	 * Returns value _(deeply cloned, by default)_ or throws an error for the first property that fails validation
	 * @param value Value to parse
	 * @param options Validation options
	 * @returns Value, if it matches the schema, otherwise throws an error
	 */
	get(value: unknown, options: GetOptions<'throw'>): Model;

	/**
	 * Parse a value according to the schema
	 *
	 * Returns value _(deeply cloned, by default)_ or throws an error for the first property that fails validation
	 * @param value Value to parse
	 * @param errors Reporting type
	 * @returns Value, if it matches the schema, otherwise throws an error
	 */
	get(value: unknown, errors: 'throw'): Model;

	/**
	 * Parse a value according to the schema
	 *
	 * Returns value _(deeply cloned, by default)_ or all validation information for validation failures from the same depth in the value
	 * @param value Value to parse
	 * @param options Validation options
	 * @returns Result holding value or all validation information
	 */
	get(value: unknown, options: GetOptions<'all'>): Result<Model, PropertyValidation[]>;

	/**
	 * Parse a value according to the schema
	 *
	 * Returns value _(deeply cloned, by default)_ or all validation information for validation failures from the same depth in the value
	 * @param value Value to parse
	 * @param errors Reporting type
	 * @returns Result holding value or all validation information
	 */
	get(value: unknown, errors: 'all'): Result<Model, PropertyValidation[]>;

	/**
	 * Parse a value according to the schema
	 *
	 * Returns value _(deeply cloned, by default)_ or all validation information for the first failing property
	 * @param value Value to parse
	 * @param options Validation options
	 * @returns Result holding value or all validation information
	 */
	get(value: unknown, options: GetOptions<'first'>): Result<Model, PropertyValidation>;

	/**
	 * Parse a value according to the schema
	 *
	 * Returns value _(deeply cloned, by default)_ or all validation information for the first failing property
	 * @param value Value to parse
	 * @param errors Reporting type
	 * @returns Result holding value or all validation information
	 */
	get(value: unknown, errors: 'first'): Result<Model, PropertyValidation>;

	/**
	 * Parse a value according to the schema
	 *
	 * Returns value _(deeply cloned, by default)_ or `undefined` if the value does not match the schema
	 * @param value Value to parse
	 * @param options Validation options
	 * @returns Value, or `undefined` if it's invalid
	 */
	get(value: unknown, options: Partial<GetOptions<'none'>>): Model | undefined;

	/**
	 * Parse a value according to the schema
	 *
	 * Returns value _(deeply cloned, by default)_ or `undefined` if the value does not match the schema
	 * @param value Value to parse
	 * @param strict Validate if unknown keys are present in the object? _(defaults to `false`)_
	 * @returns Value, or `undefined` if it's invalid
	 */
	get(value: unknown, strict?: true): Model | undefined;

	get(value: unknown, options?: unknown): unknown {
		return getResult(this.#handler, value, options);
	}

	/**
	 * Does the value match the schema?
	 *
	 * Will assert that the values matches the schema and throw an error if it does not. The error will contain all validation information for the first property that fails validation
	 * @param value Value to validate
	 * @param options Validation options
	 * @returns `true` if the value matches the schema, otherwise throws an error
	 */
	is(value: unknown, options: IsOptions<'throw'>): asserts value is Model;

	/**
	 * Does the value match the schema?
	 *
	 * Will assert that the values matches the schema and throw an error if it does not. The error will contain all validation information for the first property that fails validation
	 * @param value Value to validate
	 * @param errors Reporting type
	 * @returns `true` if the value matches the schema, otherwise throws an error
	 */
	is(value: unknown, errors: 'throw'): asserts value is Model;

	/**
	 * Does the value match the schema?
	 *
	 * Will validate that the value matches the schema and return a result of `true` or all validation information for validation failures from the same depth in the value
	 * @param value Value to validate
	 * @param options Validation options
	 * @returns Result holding `true` or all validation information
	 */
	is(value: unknown, options: IsOptions<'all'>): Result<true, PropertyValidation[]>;

	/**
	 * Does the value match the schema?
	 *
	 * Will validate that the value matches the schema and return a result of `true` or all validation information for validation failures from the same depth in the value
	 * @param value Value to validate
	 * @param errors Reporting type
	 * @returns Result holding `true` or all validation information
	 */
	is(value: unknown, errors: 'all'): Result<true, PropertyValidation[]>;

	/**
	 * Does the value match the schema?
	 *
	 * Will validate that the value matches the schema and return a result of `true` or all validation information for the first failing property
	 * @param value Value to validate
	 * @param options Validation options
	 * @returns Result holding `true` or all validation information
	 */
	is(value: unknown, options: IsOptions<'first'>): Result<true, PropertyValidation>;

	/**
	 * Does the value match the schema?
	 *
	 * Will validate that the value matches the schema and return a result of `true` or all validation information for the first failing property
	 * @param value Value to validate
	 * @param errors Reporting type
	 * @returns Result holding `true` or all validation information
	 */
	is(value: unknown, errors: 'first'): Result<true, PropertyValidation>;

	/**
	 * Does the value match the schema?
	 *
	 * Will validate that the value matches the schema and return `true` if it's valid, or `false` if not
	 * @param value Value to validate
	 * @param options Validation options
	 * @returns `true` if the value matches the schema, otherwise `false`
	 */
	is(value: unknown, options: Partial<IsOptions<'none'>>): value is Model;

	/**
	 * Does the value match the schema?
	 *
	 * Will validate that the value matches the schema and return `true` if it's valid, or `false` if not
	 * @param value Value to validate
	 * @param strict Validate if unknown keys are present in the object? _(defaults to `false`)_
	 * @returns `true` if the value matches the schema, otherwise `false`
	 */
	is(value: unknown, strict?: true): value is Model;

	is(value: unknown, options?: unknown): unknown {
		return isResult(this.#handler, value, options);
	}
}

/**
 * Create a schema from a schematic
 * @template Model Schema type
 * @param schema Schematic to create the schema from
 * @throws Throws {@link SchematicError} if the schematic can not be converted into a schema
 * @returns A schema for the given schematic
 */
export function schema<Model extends Schematic>(schema: Model): Schema<Infer<Model>>;

/**
 * Create a schema from a typed schematic
 * @template Model Existing type
 * @param schema Typed schematic to create the schema from
 * @throws Throws {@link SchematicError} if the schematic can not be converted into a schema
 * @returns A schema for the given typed schematic
 */
export function schema<Model extends PlainObject>(schema: TypedSchematic<Model>): Schema<Model>;

export function schema<Model extends Schematic>(schema: Model): Schema<Model> {
	if (isSchema(schema)) {
		return schema as Schema<Model>;
	}

	if (!isPlainObject(schema)) {
		throw new SchematicError(SCHEMATIC_MESSAGE_SCHEMA_INVALID_TYPE);
	}

	return new Schema<Model>(getObjectHandler(schema));
}

export const schemaHandlers = new WeakMap<Schema<unknown>, ValidationHandler>();
