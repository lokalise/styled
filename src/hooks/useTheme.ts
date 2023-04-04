import { useTheme as useOriginalTheme } from "styled-components";

import { type DefaultTheme } from "../types";

export const useTheme = useOriginalTheme as () => DefaultTheme;
