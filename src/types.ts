import {
	type FlattenInterpolation,
	type ThemedStyledProps,
} from "styled-components";

// eslint-disable-next-line @typescript-eslint/no-empty-interface -- To be overwritten by importing libraries
export interface DefaultTheme {}

// Doesn't work with Record<string, unknown>
export type CssDeclaration<P extends object> = FlattenInterpolation<
	ThemedStyledProps<P, DefaultTheme>
>;
