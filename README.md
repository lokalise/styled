# Lokalise styled components

## Project Purpose

This project acts as abstraction for React component styling in Lokalise org.

Currently, we're just proxying styled-components lib with additional helpers.

## Styled components

Library exposes `styled`, `css`, `createGlobalStyle` and `keyframes` helpers
from [styled-components](https://styled-components.com/docs/api).

## Helpers

On top of basic API, we also expose higher level abstractions like [`modifier`](#modifier) and [`variants`](#variants).

To enable declarative reference to theme, we expose [`generateHelpers`](#generateHelpers) function that generates
theme helpers to be used in `css` and `styled` based on your theme.

### generateHelpers

`generateHelpers(theme: YourTheme, config?: { spacingName?: 'spacing', objectKeys?: string[] }): Record<keyof YourTheme, Helper>`

`generateHelpers` generates declarative helper functions based on your theme that allow you referencing
values from theme without referencing theme directly. This is useful when you want your theme to be dynamic
and provided by context (to switch light / dark themes, for example).

```tsx
const {
	colors: color,
	spacing,
	typography,
} = generateHelpers(
	{
		color: { background: { primary: "gray" } },
		spacing: { 0: "0", 1: "4px" },
		typography: {
			default: {
				fontSize: "16px",
				lineHeight: "20px",
			},
		},
	},
	{ objectKeys: ["typography"] },
);

const Description = styled.p`
	${typography("default")};
	color: ${color("background.primary")};
	padding: ${spacing(1, 0)};
`;
```

`spacing` key (configurable in `config` under `spacingKey` and defaults to `spacing`) is a special key that
constructs function that accepts 1-4 arguments and concatenates results allowing to provide up to for spacing
factors in one call.

By default, exposed functions have typed inputs (path) that are constructed only for scalar values. In the
example above, `color('background')` is not a valid path as it references object, not scalar (string) value.
But in cases you want to enable paths for objects, for example for typography above, you need to provide
`objectKeys` config value with relevant theme keys.

#### Special helpers

There are also some special helpers that are not generated based on theme, but are available in generated helpers.

`breakpoints` (`breakpoints.min(breakpoint: string) => string` and `breakpoints.max(breakpoint: string) => string`)
are helpers that allow you to reference breakpoints from theme with min / max syntax.

```tsx
const { breakpoints } = generateHelpers({
	breakpoints: {
		sm: "480px",
		md: "920px",
	},
});

const Tile = styled.article`
	font-size: 10px;
	${breakpoints.min("sm")} {
		font-size: 12px;
	}
`;
```

`value` (`value(path: string) => string`)
is a helper that allows you to reference any value from theme

```tsx
const { value } = generateHelpers(
	{
		typography: {
			default: {
				fontSize: "16px",
				lineHeight: "20px",
			},
		},
	},
	{ objectKeys: ["typography"] },
);

const Section = styled.section`
	padding: calc(${value("typography.default.lineHeight")} / 2);
`;
```

`valueFromProp` (`valueFromProp(prop: string, path: string, fallback?: string) => string`)
is a helper that allows you to reference any value from theme based on prop value

```tsx
const { valueFromProp } = generateHelpers({
	color: { background: { primary: "gray", secondary: "black" } },
});

const Section = styled.section`
	color: ${valueFromProp("textColor", "color.background")};
	// Or, if you want, you can provide fallback value in which case prop is not required
	color: ${valueFromProp("textColor", "color.background", "primary")};
`;
```

### modifier

`modifier(prop: string | (props) => boolean, css: CssDeclaration)`

`modifier` allows us to specify a set of styles based on a boolean prop.
Perfect for `disabled`, `checked` use cases.

- `prop | string / (props) => boolean`: Name of the property being checked, or function that accepts all props and returns boolean for more complex decisions.
- `css | CssDeclaration`: The style that should be applied when value of prop is true-ish (loose check). Return value from `css` function. May use other theme helpers.

Usage example using styled-components:

```tsx
import { css, styled, modifier } from '@lokalise/styled';
import { color } from '../my-theme-helpers';

interface ExampleProps {
    $checked?: boolean;
    $disabled?: boolean;
}

const Example = styled.div<ExampleProps>`
    color: ${color('default')}

    ${modifier(
        '$checked',
        css`
            color: ${color('primaryText')}
        `,
    )}
    ${modifier(
        ({ $checked, $disabled }: ExampleProps) => $checked && $disabled,
        css`
            color: ${color('checkedDisabled')}
        `,
    )}
`;

<Example /> // Will render with "default" color
<Example $checked /> // Will render with "primaryText" color
<Example $checked $disabled /> // Will render with "checkedDisabled" color
```

### variants

`variants(prop: string | (props) => string, variantsMap: Record<string, CssDeclaration>, defaultVariant: string)`

`variant` enables a "switch" type of behavior where we want to apply a set of styles based on a prop.
Great for cases like `variant` etc.

- `prop | string / (props) => string`: Name of the property being checked. You may also provide function that returns variant name (key from `variants` prop) or undefined.
- `variantsMap | Record<string, CssDeclaration>` An object with variants as keys and result of `css` as value.
- `defaultVariant | string`: The variant used when prop value is not provided. Providing default means prop is optional. Leaving default out means prop is required.

Usage examples using styled-components:

```tsx
import { css, styled, variants } from '@lokalise/styled';
import { color } from '../my-theme-helpers';

interface ExampleProps {
    $variant?: 'primary' | 'secondary' | 'default';
}

const Example = styled.div<ExampleProps>`
    ${variants(
        '$variant',
        {
            primary: css`
                color: ${color('primaryText')}
            `,
            secondary: css`
                color: ${color('secondaryText')}
            `,
            default: css`
                color: ${color('black')}
            `,
        },
        'default'
)};
`;

<Example $variant="primary" /> // Will render with "primaryText" color
<Example /> // Will render with "black" color
```

```tsx
import { css, styled, variants } from '@lokalise/styled';
import { color } from '../my-theme-helpers';

interface ExampleProps {
    $progress: number;
}

const Example = styled.div<ExampleProps>`
    ${variants(
        ({ $progress }: ExampleProps) => $progress >= 90 ? 'done' : 'pending',
        {
            done: css`
                color: ${color('green')}
            `,
            pending: css`
                color: ${color('orange')}
            `,
        },
)};
`;

<Example $progress={42} /> // Will render with "orange" color
<Example $progress={99} /> // Will render with "green" color
```

### excludeProps

`excludeProps(props: string[])`

Generally, you should use props prefixed with `$` to indicate that the given prop should not be passed to DOM.

In case you can't do that, `excludeProps` can be used to make it easier to exclude props using
styled-components `shouldForwardProp`. We should always do this when using custom props.

```tsx
import { css, styled, excludeProps, modifier } from "@lokalise/styled";

const Example = styled.div.withConfig<{ active?: boolean }>({
	shouldForwardProp: excludeProps(["active"]),
})`
	${modifier("active", css`...`)};
`;
```

## License

This project is APACHE, VERSION 2.0 licensed, see LICENSE.md for details.

## Support Us

**lokalise-npm-package-template** was created by Lokalise Engineering Team. Support our work by keeping this line in your README.
