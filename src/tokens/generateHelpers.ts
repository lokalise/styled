import get from "lodash-es/get";
import {
	type ObjectPaths,
	type ObjectPathValue,
	type ScalarPaths,
} from "../utils/ts";

type Config<
	Theme extends Record<string | number, unknown>,
	SpacingKey extends keyof Theme,
	ObjectKeys extends keyof Theme,
> = {
	/**
	 * These values should be handled as spacing values and allow helper to provide
	 * multiple arguments.
	 *
	 * Example:
	 * ```
	 * const { spacing } = generateHelpers({ spacing: {0: 0, 1: '4px' }})
	 * spacing(0, 1);
	 * ```
	 */
	spacingName?: SpacingKey;
	/**
	 * List of keys that return object, instead of scalar value (for things like
	 * typography). This only affects typings, not output.
	 */
	objectKeys?: readonly ObjectKeys[];
};

type SpacingArgs<Arg> =
	| [Arg]
	| [Arg, Arg]
	| [Arg, Arg, Arg]
	| [Arg, Arg, Arg, Arg];

type Helpers<
	Theme extends Record<string | number, unknown>,
	SpacingKey extends keyof Theme,
	ObjectKeys extends keyof Theme,
> = {
	[K in keyof Theme]: K extends SpacingKey
		? // Spacing
		  (
				...args: SpacingArgs<keyof Theme[SpacingKey]>
		  ) => (props: { theme: Theme }) => string
		: // Otherwise check if value is a record
		Theme[K] extends Record<string | number, unknown>
		? K extends ObjectKeys
			? <Path extends ObjectPaths<Theme[K]>>(
					path: Path,
			  ) => (props: { theme: Theme }) => ObjectPathValue<Theme[K], Path>
			: <Path extends ScalarPaths<Theme[K]>>(
					path: Path,
			  ) => (props: {
					theme: Theme;
					// The `Path extends string` is a trick to force compiler to defer execution of the condition.
					// Otherwise, we get infinite depth issue.
			  }) => Path extends string ? ObjectPathValue<Theme[K], Path> : never
		: () => (props: { theme: Theme }) => Theme[K];
};

/**
 * This function generates styled components helpers based on theme object
 * (although it does not use values from provided theme, instead fetching from context).
 *
 * It handles special case for `spacing` which allows to specify values using multiple arguments.
 *
 * ```ts
 * const { colors: color, spacing } = generateHelpers({
 * 	 color: { background: { primary: 'gray' }},
 * 	 spacing: { 0: '0', 1: '4px' },
 * });
 *
 * const Comp = styled.div`
 * 	 color: ${color('background.primary')};
 * 	 padding: ${spacing(1, 0)};
 * `;
 * ```
 */
export const generateHelpers = <
	Theme extends Record<string | number, unknown>,
	SpacingKey extends keyof Theme = "spacing",
	ObjectKeys extends keyof Theme = never,
>(
	theme: Theme,
	{
		spacingName = "spacing" as SpacingKey,
	}: Config<Theme, SpacingKey, ObjectKeys> = {},
) =>
	Object.fromEntries(
		(Object.keys(theme) as (keyof Theme)[]).map((key) => [
			key,
			key === spacingName
				? (...args: SpacingArgs<keyof Theme[SpacingKey]>) =>
						({ theme }: { theme: Theme }) =>
							args.map((level) => theme[key as SpacingKey][level]).join(" ")
				: (path: string) =>
						({ theme }: { theme: Theme }): unknown =>
							typeof theme[key] === "object"
								? get(theme[key], path)
								: theme[key],
		]),
	) as Helpers<Theme, SpacingKey, ObjectKeys>;
