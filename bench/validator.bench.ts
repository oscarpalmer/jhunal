import {bench, describe} from 'vitest';
import {validator} from '../src';

class Item {}

const benchOptions = {};

// #region Single type

const single = validator('string');

// #endregion

// #region Multiple types

const multi = validator(['string', 'number', 'boolean']);

// #endregion

// #region Constructor

const ctor = validator(Item);

// #endregion

// #region Callback

const callback = validator<number>(
	(value: unknown): value is number => typeof value === 'number' && value > 0,
);

// #endregion

// #region With validators

const validated = validator('number', {
	number: (value: number) => value >= 0 && value <= 100,
});

// #endregion

// #region is: none

describe('is: none — single type', () => {
	bench(
		'valid',
		() => {
			single.is('hello');
		},
		benchOptions,
	);

	bench(
		'invalid',
		() => {
			single.is(123);
		},
		benchOptions,
	);
});

describe('is: none — multiple types', () => {
	bench(
		'valid (first)',
		() => {
			multi.is('hello');
		},
		benchOptions,
	);

	bench(
		'valid (last)',
		() => {
			multi.is(true);
		},
		benchOptions,
	);

	bench(
		'invalid',
		() => {
			multi.is(null);
		},
		benchOptions,
	);
});

describe('is: none — constructor', () => {
	bench(
		'valid',
		() => {
			ctor.is(new Item());
		},
		benchOptions,
	);

	bench(
		'invalid',
		() => {
			ctor.is({});
		},
		benchOptions,
	);
});

describe('is: none — callback', () => {
	bench(
		'valid',
		() => {
			callback.is(42);
		},
		benchOptions,
	);

	bench(
		'invalid',
		() => {
			callback.is(-1);
		},
		benchOptions,
	);
});

describe('is: none — with validators', () => {
	bench(
		'valid',
		() => {
			validated.is(50);
		},
		benchOptions,
	);

	bench(
		'invalid (type)',
		() => {
			validated.is('nope');
		},
		benchOptions,
	);

	bench(
		'invalid (validator)',
		() => {
			validated.is(200);
		},
		benchOptions,
	);
});

// #endregion

// #region is: result

describe('is: result', () => {
	bench(
		'valid',
		() => {
			single.is('hello', 'result');
		},
		benchOptions,
	);

	bench(
		'invalid',
		() => {
			single.is(123, 'result');
		},
		benchOptions,
	);
});

// #endregion

// #region is: throw

describe('is: throw', () => {
	bench(
		'valid',
		() => {
			void single.is('hello', 'throw');
		},
		benchOptions,
	);

	bench(
		'invalid',
		() => {
			try {
				void single.is(123, 'throw');
			} catch {}
		},
		benchOptions,
	);
});

// #endregion
