export {
	default as styled,
	css,
	createGlobalStyle,
	keyframes,
	StyleSheetManager,
	ThemeProvider,
} from "styled-components";

/**
 * @deprecated Use `csstype` package directly if you need this.
 */
export type { Properties as CSSProperties } from "csstype";

export { useTheme } from "./hooks/useTheme";
export * from "./tokens";

export { type CssDeclaration, type DefaultTheme } from "./types";
