import { defineRecipe } from "@pandacss/dev";

export const buttonRecipe = defineRecipe({
  className: "button",
  description: "Styles for the Button component",

  base: {
    display: "inline-flex",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: "md",
    fontSize: "md",
    lineHeight: "1",
    fontWeight: "medium",
    whiteSpace: "nowrap",
    transitionProperty:
      "color, background-color, border-color, text-decoration-color, fill, stroke",
    transitionTimingFunction: "in-out",
    transitionDuration: "fast",
    cursor: "pointer",
    '&:disabled:not([data-loading], [aria-busy="true"])': {
      opacity: "50%",
      cursor: "default",
    },
    _loading: {
      cursor: "default",
    },
  },
  variants: {
    variant: {
      default: {
        bg: "primary",
        color: "text.primaryForeground",
        _hover: {
          bg: "primaryHover",
        },
      },
      link: {
        bg: "transparent",
        display: "inline",
        color: "current",
        fontWeight: "inherit",
        fontSize: "inherit",
        textDecoration: "underline",
      },
      outline: {
        bg: "transparent",
        borderColor: "current",
        borderStyle: "solid",
        borderWidth: "1px",
      },
    },
    size: {
      default: {
        px: "6",
        py: "3",
      },
      large: {
        px: "6",
        py: "4",
        width: "full",
      },
    },
  },
  compoundVariants: [
    {
      variant: "link",
      size: "default",
      css: {
        p: "0",
      },
    },
    {
      variant: "link",
      size: "large",
      css: {
        p: "0",
        width: "auto",
      },
    },
  ],
  defaultVariants: {
    variant: "default",
    size: "default",
  },
  staticCss: [{ variant: ["*"], size: ["*"] }],
});
