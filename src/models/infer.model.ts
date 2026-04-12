import type {Constructor, Simplify} from '@oscarpalmer/atoms/models';
import type {Schema} from '../schema';
import type {IsOptionalProperty, ValueType, Values} from './misc.model';
import type {PlainSchematic, Schematic, SchematicProperty} from './schematic.plain.model';
import type {Validator} from '../validator';

/**
 * Infers the TypeScript type from a {@link Schematic} definition
 *
 * @template Model Schematic to infer types from
 *
 * @example
 * ```ts
 * const userSchematic = {
 *   name: 'string',
 *   age: 'number',
 *   address: { $required: false, $type: 'string' },
 * } satisfies Schematic;
 *
 * type User = Infer<typeof userSchematic>;
 * // { name: string; age: number; address?: string }
 * ```
 */
export type Infer<Model extends Schematic> = Simplify<
	{
		[Key in InferRequiredKeys<Model>]: InferSchemaEntry<Model[Key]>;
	} & {
		[Key in InferOptionalKeys<Model>]?: InferSchemaEntry<Model[Key]>;
	}
>;

/**
 * Extracts keys from a {@link Schematic} whose entries are optional _(i.e., `$required` is `false`)_
 *
 * @template Model - {@link Schematic} to extract optional keys from
 */
export type InferOptionalKeys<Model extends Schematic> = keyof {
	[Key in keyof Model as IsOptionalProperty<Model[Key]> extends true ? Key : never]: never;
};

/**
 * Infers the TypeScript type from a {@link SchematicProperty}'s `$type` field
 *
 * @template Value `$type` value _(single or array)_
 */
export type InferPropertyType<Value> = Value extends (infer Item)[]
	? InferPropertyValue<Item>
	: InferPropertyValue<Value>;

/**
 * Maps a single `$type` definition to its TypeScript equivalent
 *
 * Resolves, in order: {@link Constructor}s, {@link Schema} instances, {@link ValueType} values, and nested {@link PlainSchematic} objects
 *
 * @template Value single type definition
 */
export type InferPropertyValue<Value> =
	Value extends Constructor<infer Instance>
		? Instance
		: Value extends Schema<infer Model>
			? Model
			: Value extends Validator<infer Type>
				? Type
				: Value extends ValueType
					? Values[Value & ValueType]
					: Value extends PlainSchematic
						? Infer<Value>
						: never;

/**
 * Extracts keys from a {@link Schematic} whose entries are required _(i.e., `$required` is not `false`)_
 *
 * @template Model Schematic to extract required keys from
 */
export type InferRequiredKeys<Model extends Schematic> = keyof {
	[Key in keyof Model as IsOptionalProperty<Model[Key]> extends true ? never : Key]: never;
};

/**
 * Infers the TypeScript type from a top-level {@link Schematic} entry
 *
 * @template Value Schematic entry value _(single or array)_
 */
export type InferSchemaEntry<Value> = Value extends (infer Item)[]
	? InferSchemaEntryValue<Item>
	: InferSchemaEntryValue<Value>;

/**
 * Maps a single top-level schema entry to its TypeScript type
 *
 * Resolves, in order: {@link Constructor}s, {@link Schema} instances, {@link SchemaProperty} objects, {@link PlainSchematic} objects, and {@link ValueType} values
 *
 * @template Value single schema entry
 */
export type InferSchemaEntryValue<Value> =
	Value extends Constructor<infer Instance>
		? Instance
		: Value extends Schema<infer Model>
			? Model
			: Value extends SchematicProperty
				? InferPropertyType<Value['$type']>
				: Value extends PlainSchematic
					? Infer<Value & Schematic>
					: Value extends Validator<infer Type>
						? Type
						: Value extends ValueType
							? Values[Value & ValueType]
							: never;

export type InferValidatorValue<Value> = Value extends (infer Item)[]
	? InferValidatorValue<Item>
	: Value extends Constructor<infer Instance>
		? Instance
		: Value extends ((value: unknown) => value is infer Type)
			? Type
			: Value extends (value: unknown) => boolean
				? 'xyz'
				: Value extends ValueType
					? Values[Value & ValueType]
					: never;
