import type {Simplify} from '@oscarpalmer/atoms/models';
import type {Schematic} from './schematic';

export type AutoInferExclude = 'date-like' | 'numerical';

export type InferProperty<Value> = Value extends Property
	? InferPropertyType<Value['type']>
	: never;

type InferPropertyType<Value> = Value extends (infer Type)[]
	? InferPropertyTypeValue<Type>[]
	: InferPropertyTypeValue<Value>;

type InferPropertyTypeValue<Value> = Value extends PropertyType
	? Value extends Schema
		? Inferred<Value>
		: Value extends Schematic<infer Model>
			? Model
			: Value extends ValueKey
				? Values[Value]
				: Value extends (infer NestedElementType)[]
					? InferPropertyTypeValue<NestedElementType>[]
					: Value
	: never;

export type InferValue<Value> = Value extends ValueKey
	? Values[Value]
	: Value extends ValueKey[]
		? Values[Value[number]]
		: never;

export type Inferred<Model extends Schema> = Simplify<
	{
		[Key in InferredRequiredProperties<Model>]: Model[Key] extends Property
			? InferProperty<Model[Key]>
			: InferValue<Model[Key]>;
	} & {
		[Key in InferredOptionalProperties<Model>]?: Model[Key] extends Property
			? InferProperty<Model[Key]>
			: never;
	}
>;

export type InferredOptionalProperties<Model extends Schema> = keyof {
	[Key in keyof Model as IsOptionalInSchema<Model[Key]> extends true ? Key : never]: never;
};

export type InferredRequiredProperties<Model extends Schema> = keyof {
	[Key in keyof Model as IsOptionalInSchema<Model[Key]> extends true ? never : Key]: never;
};

type IsNestedObject<Value> = Value extends object
	? Value extends any[] | Date | Function
		? false
		: true
	: false;

type IsOptionalInSchema<Prop> = Prop extends Property
	? Prop['required'] extends false
		? true
		: false
	: false;

export type OptionalKeys<Value> = {
	[Key in keyof Value]-?: {} extends Pick<Value, Key> ? Key : never;
}[keyof Value];

export type OptionalProperty<Type> = {
	required: false;
	type: PropertyTypeFor<Type>;
};

export type Property = {
	required?: boolean;
	type: PropertyType | PropertyType[];
};

type PropertyType = Schema | Schematic<unknown> | ValueKey;

type PropertyTypeFor<Value> =
	IsNestedObject<Value> extends true
		? Value extends Typed
			? TypedSchema<Value>
			: never
		: ValueToType<Value>;

type RequiredKeys<Value> = Exclude<keyof Value, OptionalKeys<Value>>;

export type RequiredProperty<Type> = {
	required: true;
	type: PropertyTypeFor<Type>;
};

/**
 * A schema for validating objects
 */
export type Schema = {
	[key: string]: Property | ValueKey | ValueKey[];
};

export type TypeToValueKey<Value> = {
	[Key in Exclude<ValueKey, AutoInferExclude>]: Value extends Values[Key] ? Key : never;
}[Exclude<ValueKey, AutoInferExclude>] extends infer SpecificKey
	? SpecificKey extends never
		? {
				[Key in AutoInferExclude]: Value extends Values[Key] ? Key : never;
			}[AutoInferExclude]
		: SpecificKey
	: never;

export type Typed = Record<string, unknown>;

/**
 * A typed schema for validating objects
 */
export type TypedSchema<Model extends Typed> = Simplify<
	{
		[Key in RequiredKeys<Model>]: IsNestedObject<Model[Key]> extends true
			? Model[Key] extends Typed
				? TypedSchema<Model[Key]>
				: never
			: ValueToType<Model[Key]> | RequiredProperty<Model[Key]>;
	} & {
		[Key in OptionalKeys<Model>]: IsNestedObject<Model[Key]> extends true
			? Exclude<Model[Key], undefined> extends Typed
				? TypedSchema<Exclude<Model[Key], undefined>> | OptionalProperty<Model[Key]>
				: never
			: OptionalProperty<Model[Key]>;
	}
>;

type UnionToIntersection<Value> = (Value extends any ? (value: Value) => void : never) extends (
	item: infer Item,
) => void
	? Item
	: never;

type LastOfUnion<Value> =
	UnionToIntersection<Value extends any ? () => Value : never> extends () => infer Item
		? Item
		: never;

type UnionToTuple<Value, Values extends any[] = []> = [Value] extends [never]
	? Values
	: UnionToTuple<Exclude<Value, LastOfUnion<Value>>, [LastOfUnion<Value>, ...Values]>;

export type ValidatedProperty = {
	required: boolean;
	types: ValidatedPropertyType[];
};

export type ValidatedPropertyType = Schematic<unknown> | ValidatedSchema | ValueKey;

export type ValidatedSchema = {
	keys: string[];
	length: number;
	properties: ValidatedSchemaProperties;
};

type ValidatedSchemaProperties = {
	[key: string]: ValidatedProperty;
};

export type ValueKey = keyof Values;

export type ValueToType<Value> = ValueToTypes<UnionToTuple<TypeToValueKey<Value>>>;

export type ValueToTypes<Value extends unknown[]> = Value extends [infer Type] ? Type : Value;

export type Values = {
	array: unknown[];
	bigint: bigint;
	boolean: boolean;
	date: Date;
	'date-like': number | string | Date;
	// biome-ignore lint/complexity/noBannedTypes: it's the most basic value type, so I think it's ok
	function: Function;
	null: null;
	number: number;
	numerical: bigint | number;
	object: object;
	string: string;
	symbol: symbol;
	undefined: undefined;
};
