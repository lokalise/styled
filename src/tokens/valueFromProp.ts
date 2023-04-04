import get from "lodash-es/get";

import { type DefaultTheme } from "../types";
import { type ObjectPaths, type ObjectPathValue } from "../utils/ts";

type Fn<Props extends Record<string, unknown>> = (
	props: { theme: DefaultTheme } & Props,
) => string;

function valueFromProp<
	Path extends ObjectPaths<DefaultTheme>,
	Prop extends string,
	Keys = keyof ObjectPathValue<DefaultTheme, Path>,
	Fallback = Keys,
>(
	prop: Prop,
	themePath: Path,
	fallback: Fallback,
): Fn<Partial<Record<Prop, Keys>>>;
function valueFromProp<
	Path extends ObjectPaths<DefaultTheme>,
	Prop extends string,
	Keys = keyof ObjectPathValue<DefaultTheme, Path>,
>(prop: Prop, themePath: Path): Fn<Record<Prop, Keys>>;
function valueFromProp<
	Path extends ObjectPaths<DefaultTheme>,
	Prop extends string,
	Keys = keyof ObjectPathValue<DefaultTheme, Path>,
>(prop: Prop, path: Path, fallback?: Keys) {
	return (
		props: {
			theme: DefaultTheme;
		} & Partial<Record<Prop, Keys>>,
	) =>
		get(
			props.theme,
			`${path}.${(props[prop] ?? fallback) as string}`,
		) as string;
}

export { valueFromProp };
