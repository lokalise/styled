import { useTheme as useOriginalTheme } from "styled-components";
import { DefaultTheme } from "../types";

export const useTheme = useOriginalTheme as () => DefaultTheme;
