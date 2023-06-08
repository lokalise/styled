type EmptyObject = Record<string | number, never>;
type Cast<T> = (T & string) | (T & number);

export type CssValue = string | number;
export type ObjectType = Record<string | number, unknown>;
export type ArrayType = readonly (string | number)[];

export type ScalarPaths<O extends ObjectType> = ScalarPathsHelper<O, never, "">;

type ScalarPathsHelper<
	O extends ObjectType,
	Paths extends string | number,
	Prefix extends string,
> = EmptyObject extends O
	? // In case object is empty, we just return currently accumulated paths
	  Paths
	: // Otherwise, we recursively iterate
	  {
			[Key in keyof O]: O[Key] extends ObjectType
				? ScalarPathsHelper<O[Key], Paths, `${Prefix}${Cast<Key>}.`>
				: O[Key] extends CssValue
				? Key extends number
					? "" extends Prefix
						? Paths | Key
						: Paths | `${Prefix}${Cast<Key>}`
					: Paths | `${Prefix}${Cast<Key>}`
				: Paths;
	  }[keyof O];

export type ObjectPaths<O> = O extends ObjectType
	? ObjectPathsHelper<O, never, "">
	: never;

type ObjectPathsHelper<
	O extends ObjectType,
	Paths extends string,
	Prefix extends string,
> = EmptyObject extends O
	? // In case object is empty, we just return currently accumulated paths
	  Paths
	: // Otherwise, we recursively iterate
	  {
			[Key in keyof O]: O[Key] extends ObjectType
				? ObjectPathsHelper<
						O[Key],
						Paths | `${Prefix}${Cast<Key>}`,
						`${Prefix}${Cast<Key>}.`
				  >
				: O[Key] extends ArrayType
				? ObjectPathsHelper<
						Record<string, never>,
						Paths | `${Prefix}${Cast<Key>}`,
						`${Prefix}${Cast<Key>}.`
				  >
				: Paths;
	  }[keyof O];

export type ObjectPathValue<Obj, Path extends string> = ObjectPathValueHelper<
	Obj,
	Path
>;

type ObjectPathValueHelper<Obj, Path extends string> = Obj extends Record<
	string | number,
	unknown
>
	? Path extends keyof Obj
		? Obj[Path]
		: Path extends `${infer Head}.${infer Rest}`
		? Head extends keyof Obj
			? ObjectPathValueHelper<Obj[Head], Rest>
			: never
		: never
	: never;
