import {
	type FlattenInterpolation,
	type ThemedStyledProps,
} from "styled-components";

// eslint-disable-next-line @typescript-eslint/no-empty-interface -- To be overwritten by importing libraries
export interface DefaultTheme {}

// We need alias because styled-component uses same name for interface.
// And we want to use the same name for consistency.
type MyDefaultTheme = DefaultTheme;

// Doesn't work with Record<string, unknown>
export type CssDeclaration<P extends object> = FlattenInterpolation<
	ThemedStyledProps<P, DefaultTheme>
>;

declare module "styled-components" {
	interface DefaultTheme extends MyDefaultTheme {
		/**
		 * This is here just to force this type to remain interface in order for
		 * us to augment it.
		 */
		__forceInterfaceHack__?: never;
	}
}
