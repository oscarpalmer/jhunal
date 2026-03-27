import type {ValueName} from './models/misc.model';
import type {ReportingType} from './models/validation.model';

// #region Grammar

export const COMMA = ', ';

export const CONJUNCTION_OR = ' or ';

export const CONJUNCTION_OR_COMMA = ', or ';

export const CONJUNCTION_AND = ' and ';

export const CONJUNCTION_AND_COMMA = ', and ';

// #endregion

// #region Misc.

export const MESSAGE_CONSTRUCTOR = 'Expected a constructor function';

// #endregion

// #region Names

export const NAME_SCHEMATIC = 'Schematic';

export const NAME_SCHEMATIC_PREFIXED = 'a Schematic';

export const NAME_ERROR_SCHEMATIC = 'SchematicError';

export const NAME_ERROR_VALIDATION = 'ValidationError';

// #endregion

// #region Properties

export const PROPERTY_REQUIRED = '$required';

export const PROPERTY_SCHEMATIC = '$schematic';

export const PROPERTY_TYPE = '$type';

export const PROPERTY_VALIDATORS = '$validators';

// #endregion

// #region Property validation

export const VALIDATION_MESSAGE_INVALID_INPUT = 'Expected an object as input but received <>';

export const VALIDATION_MESSAGE_INVALID_REQUIRED = "Expected <> for required property '<>'";

export const VALIDATION_MESSAGE_INVALID_TYPE = "Expected <> for '<>' but received <>";

export const VALIDATION_MESSAGE_INVALID_VALUE =
	"Value does not satisfy validator for '<>' and type '<>'";

export const VALIDATION_MESSAGE_INVALID_VALUE_SUFFIX = ' at index <>';

export const VALIDATION_MESSAGE_UNKNOWN_KEYS = 'Found keys that are not defined in the schema: <>';

// #endregion

// #region Reporting

export const REPORTING_ALL: ReportingType = 'all';

export const REPORTING_FIRST: ReportingType = 'first';

export const REPORTING_NONE: ReportingType = 'none';

export const REPORTING_THROW: ReportingType = 'throw';

export const REPORTING_TYPES = new Set<ReportingType>([
	REPORTING_ALL,
	REPORTING_FIRST,
	REPORTING_NONE,
	REPORTING_THROW,
]);

// #endregion

// #region Schematic validation

export const SCHEMATIC_MESSAGE_SCHEMA_INVALID_EMPTY = 'Schema must have at least one property';

export const SCHEMATIC_MESSAGE_SCHEMA_INVALID_PROPERTY_DISALLOWED =
	"'<>.<>' property is not allowed for schemas in $type";

export const SCHEMATIC_MESSAGE_SCHEMA_INVALID_PROPERTY_NULLABLE =
	"'<>' property must not be 'null' or 'undefined'";

export const SCHEMATIC_MESSAGE_SCHEMA_INVALID_PROPERTY_REQUIRED =
	"'<>.$required' property must be a boolean";

export const SCHEMATIC_MESSAGE_SCHEMA_INVALID_PROPERTY_TYPE =
	"'<>' property must be of a valid type";

export const SCHEMATIC_MESSAGE_SCHEMA_INVALID_TYPE = 'Schema must be an object';

export const SCHEMATIC_MESSAGE_VALIDATOR_INVALID_KEY = "Validator '<>' does not exist";

export const SCHEMATIC_MESSAGE_VALIDATOR_INVALID_TYPE = 'Validators must be an object';

export const SCHEMATIC_MESSAGE_VALIDATOR_INVALID_VALUE =
	"Validator '<>' must be a function or an array of functions";

// #endregion

// #region Templates

export const TEMPLATE_PATTERN = '<>';

// #endregion

// #region Types

export const TYPE_ARRAY = 'array';

const TYPE_BIGINT = 'bigint';

const TYPE_BOOLEAN = 'boolean';

const TYPE_DATE = 'date';

export const TYPE_FUNCTION = 'function';

export const TYPE_FUNCTION_RESULT = 'a validated value';

export const TYPE_NULL = 'null';

const TYPE_NUMBER = 'number';

export const TYPE_OBJECT = 'object';

const TYPE_STRING = 'string';

const TYPE_SYMBOL = 'symbol';

export const TYPE_UNDEFINED = 'undefined';

export const VALIDATABLE_TYPES = new Set<ValueName>([
	TYPE_ARRAY,
	TYPE_BIGINT,
	TYPE_BOOLEAN,
	TYPE_DATE,
	TYPE_FUNCTION,
	TYPE_NUMBER,
	TYPE_OBJECT,
	TYPE_STRING,
	TYPE_SYMBOL,
]);

export const TYPE_ALL = new Set<ValueName>([...VALIDATABLE_TYPES, TYPE_NULL, TYPE_UNDEFINED]);

export const PREFIXED_TYPES: Record<ValueName, string> = {
	[TYPE_ARRAY]: `an ${TYPE_ARRAY}`,
	[TYPE_BIGINT]: `a ${TYPE_BIGINT}`,
	[TYPE_BOOLEAN]: `a ${TYPE_BOOLEAN}`,
	[TYPE_DATE]: `a ${TYPE_DATE}`,
	[TYPE_FUNCTION]: `a ${TYPE_FUNCTION}`,
	[TYPE_NULL]: TYPE_NULL,
	[TYPE_NUMBER]: `a ${TYPE_NUMBER}`,
	[TYPE_STRING]: `a ${TYPE_STRING}`,
	[TYPE_SYMBOL]: `a ${TYPE_SYMBOL}`,
	[TYPE_OBJECT]: `an ${TYPE_OBJECT}`,
	[TYPE_UNDEFINED]: TYPE_UNDEFINED,
};

// #endregion
