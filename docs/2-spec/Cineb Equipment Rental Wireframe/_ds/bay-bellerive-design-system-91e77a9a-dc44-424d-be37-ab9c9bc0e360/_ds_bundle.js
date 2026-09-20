/* @ds-bundle: {"format":4,"namespace":"BayBelleriveDesignSystem_91e77a","components":[{"name":"Badge","sourcePath":"components/core/Badge.jsx"},{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"Card","sourcePath":"components/core/Card.jsx"},{"name":"Eyebrow","sourcePath":"components/core/Eyebrow.jsx"},{"name":"Rule","sourcePath":"components/core/Rule.jsx"},{"name":"SectionHeader","sourcePath":"components/core/SectionHeader.jsx"},{"name":"Wordmark","sourcePath":"components/core/Wordmark.jsx"},{"name":"Checkbox","sourcePath":"components/forms/Checkbox.jsx"},{"name":"Input","sourcePath":"components/forms/Input.jsx"},{"name":"Select","sourcePath":"components/forms/Select.jsx"},{"name":"MenuItem","sourcePath":"components/menu/MenuItem.jsx"},{"name":"MenuSection","sourcePath":"components/menu/MenuSection.jsx"},{"name":"EventCard","sourcePath":"components/venue/EventCard.jsx"},{"name":"HoursList","sourcePath":"components/venue/HoursList.jsx"}],"sourceHashes":{"components/core/Badge.jsx":"334b38f626b3","components/core/Button.jsx":"a7f8ea578e12","components/core/Card.jsx":"66afdad03881","components/core/Eyebrow.jsx":"fdf0dcf600a1","components/core/Rule.jsx":"a0a4e6ab2892","components/core/SectionHeader.jsx":"7d72df54a47e","components/core/Wordmark.jsx":"e47538582369","components/forms/Checkbox.jsx":"640f86c510d0","components/forms/Input.jsx":"1562adad9ab0","components/forms/Select.jsx":"3e81ab168831","components/menu/MenuItem.jsx":"2e855fb8a3f5","components/menu/MenuSection.jsx":"cf36d31dd5cf","components/venue/EventCard.jsx":"ef0cee7b5699","components/venue/HoursList.jsx":"09ff7f6321a6","ui_kits/print-menu/MenuSheet.jsx":"905ce5bb8497","ui_kits/website/BookScreen.jsx":"53d3479dd415","ui_kits/website/Chrome.jsx":"5037be96349c","ui_kits/website/EventsScreen.jsx":"571263f04a89","ui_kits/website/Home.jsx":"964b7df9c7e9","ui_kits/website/MenuScreen.jsx":"ae2419dd1697"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.BayBelleriveDesignSystem_91e77a = window.BayBelleriveDesignSystem_91e77a || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/core/Badge.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const tones = {
  open: {
    color: "var(--status-open)",
    dot: "var(--status-open)"
  },
  closed: {
    color: "var(--status-closed)",
    dot: "var(--status-closed)"
  },
  info: {
    color: "var(--status-info)",
    dot: "var(--status-info)"
  },
  neutral: {
    color: "var(--text-muted)",
    dot: "var(--ink-300)"
  }
};
const inverseText = {
  open: "var(--cream-100)",
  closed: "var(--ember-300)",
  info: "var(--tide-300)",
  neutral: "var(--tide-300)"
};
function Badge({
  tone = "neutral",
  dot = true,
  outline = false,
  inverse = false,
  children,
  style,
  ...rest
}) {
  const t = inverse ? {
    color: inverseText[tone],
    dot: tones[tone].dot
  } : tones[tone];
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: "var(--space-6)",
      fontFamily: "var(--font-ui)",
      fontSize: "var(--size-eyebrow)",
      fontWeight: "var(--weight-medium)",
      letterSpacing: "var(--tracking-eyebrow)",
      textTransform: "uppercase",
      color: t.color,
      padding: outline ? "5px 10px" : "0",
      border: outline ? "var(--border-hairline) solid currentColor" : "none",
      borderRadius: outline ? "var(--radius-pill)" : "0",
      ...style
    }
  }, rest), dot ? /*#__PURE__*/React.createElement("span", {
    style: {
      width: 6,
      height: 6,
      borderRadius: "var(--radius-pill)",
      background: t.dot,
      flex: "none"
    }
  }) : null, children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Badge.jsx", error: String((e && e.message) || e) }); }

// components/core/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const base = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "var(--space-8)",
  fontFamily: "var(--font-ui)",
  fontWeight: "var(--weight-medium)",
  letterSpacing: "var(--tracking-wide)",
  textTransform: "uppercase",
  textDecoration: "none",
  border: "var(--border-hairline) solid transparent",
  borderRadius: "var(--radius-xs)",
  cursor: "pointer",
  transition: "background var(--dur-fast) var(--ease-out), color var(--dur-fast) var(--ease-out), border-color var(--dur-fast) var(--ease-out), transform var(--dur-instant) var(--ease-out)"
};
const sizes = {
  sm: {
    fontSize: "var(--size-eyebrow)",
    padding: "9px 16px"
  },
  md: {
    fontSize: "0.75rem",
    padding: "13px 22px"
  },
  lg: {
    fontSize: "0.8125rem",
    padding: "17px 30px"
  }
};
const tones = {
  primary: {
    background: "var(--action-primary)",
    color: "var(--action-on-primary)"
  },
  secondary: {
    background: "transparent",
    color: "var(--text-heading)",
    borderColor: "var(--action-secondary-border)"
  },
  ghost: {
    background: "transparent",
    color: "var(--text-heading)",
    padding: "6px 2px",
    letterSpacing: "var(--tracking-eyebrow)"
  },
  inverse: {
    background: "var(--cream-100)",
    color: "var(--ink-900)"
  },
  quietInverse: {
    background: "transparent",
    color: "var(--text-on-inverse)",
    borderColor: "var(--line-inverse)"
  }
};
const hovers = {
  primary: {
    background: "var(--action-primary-hover)"
  },
  secondary: {
    background: "color-mix(in oklab, var(--ink-900) 6%, transparent)",
    borderColor: "var(--ink-900)"
  },
  ghost: {
    color: "var(--text-accent)"
  },
  inverse: {
    background: "var(--cream-050)"
  },
  quietInverse: {
    background: "color-mix(in oklab, var(--cream-100) 12%, transparent)",
    borderColor: "var(--cream-100)"
  }
};
function Button({
  variant = "primary",
  size = "md",
  as,
  href,
  disabled = false,
  fullWidth = false,
  children,
  style,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  const [press, setPress] = React.useState(false);
  const Tag = as || (href ? "a" : "button");
  const s = {
    ...base,
    ...sizes[size],
    ...tones[variant],
    ...(hover && !disabled ? hovers[variant] : null),
    ...(press && !disabled ? {
      transform: "scale(var(--press-scale))"
    } : null),
    ...(fullWidth ? {
      width: "100%"
    } : null),
    ...(disabled ? {
      opacity: .4,
      cursor: "not-allowed"
    } : null),
    ...style
  };
  const underline = variant === "ghost" ? {
    boxShadow: "inset 0 -1px 0 0 currentColor"
  } : null;
  return /*#__PURE__*/React.createElement(Tag, _extends({
    href: href,
    disabled: Tag === "button" ? disabled : undefined,
    style: {
      ...s,
      ...underline
    },
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => {
      setHover(false);
      setPress(false);
    },
    onMouseDown: () => setPress(true),
    onMouseUp: () => setPress(false)
  }, rest), children);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Button.jsx", error: String((e && e.message) || e) }); }

// components/core/Card.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Card({
  variant = "paper",
  interactive = false,
  padding = 24,
  children,
  style,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  const variants = {
    paper: {
      background: "var(--surface-card)",
      boxShadow: "var(--shadow-card)"
    },
    outline: {
      background: "transparent",
      border: "var(--border-hairline) solid var(--line-hairline)"
    },
    sunken: {
      background: "var(--surface-sunken)"
    },
    inverse: {
      background: "var(--surface-inverse)",
      color: "var(--text-on-inverse)"
    }
  };
  return /*#__PURE__*/React.createElement("div", _extends({
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      borderRadius: "var(--radius-xs)",
      padding: padding + "px",
      transition: "transform var(--dur-base) var(--ease-out), box-shadow var(--dur-base) var(--ease-out)",
      ...variants[variant],
      ...(interactive && hover ? {
        transform: "translateY(var(--hover-lift))",
        boxShadow: "var(--shadow-raised)",
        cursor: "pointer"
      } : null),
      ...style
    }
  }, rest), children);
}
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Card.jsx", error: String((e && e.message) || e) }); }

// components/core/Eyebrow.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Eyebrow({
  children,
  tone = "muted",
  as = "div",
  style,
  ...rest
}) {
  const colors = {
    muted: "var(--text-muted)",
    accent: "var(--text-accent)",
    inverse: "var(--text-on-inverse-muted)",
    heading: "var(--text-heading)"
  };
  const Tag = as;
  return /*#__PURE__*/React.createElement(Tag, _extends({
    style: {
      fontFamily: "var(--font-ui)",
      fontSize: "var(--size-eyebrow)",
      fontWeight: "var(--weight-medium)",
      letterSpacing: "var(--tracking-eyebrow)",
      textTransform: "uppercase",
      color: colors[tone],
      ...style
    }
  }, rest), children);
}
Object.assign(__ds_scope, { Eyebrow });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Eyebrow.jsx", error: String((e && e.message) || e) }); }

// components/core/Rule.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Rule({
  tone = "hairline",
  inset = 0,
  vertical = false,
  style,
  ...rest
}) {
  const c = tone === "strong" ? "var(--line-strong)" : tone === "inverse" ? "var(--line-inverse)" : "var(--line-hairline)";
  const s = vertical ? {
    width: 0,
    alignSelf: "stretch",
    border: "none",
    borderLeft: "var(--border-hairline) solid " + c,
    margin: inset + "px 0"
  } : {
    height: 0,
    border: "none",
    borderTop: "var(--border-hairline) solid " + c,
    margin: "0 " + inset + "px"
  };
  return /*#__PURE__*/React.createElement("hr", _extends({
    style: {
      ...s,
      ...style
    }
  }, rest));
}
Object.assign(__ds_scope, { Rule });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Rule.jsx", error: String((e && e.message) || e) }); }

// components/core/SectionHeader.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function SectionHeader({
  eyebrow,
  title,
  intro,
  align = "left",
  tone = "default",
  action,
  style,
  ...rest
}) {
  const inverse = tone === "inverse";
  return /*#__PURE__*/React.createElement("header", _extends({
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-12)",
      alignItems: align === "center" ? "center" : "flex-start",
      textAlign: align,
      maxWidth: align === "center" ? "var(--measure-narrow)" : "none",
      margin: align === "center" ? "0 auto" : undefined,
      ...style
    }
  }, rest), eyebrow ? /*#__PURE__*/React.createElement(__ds_scope.Eyebrow, {
    tone: inverse ? "inverse" : "muted"
  }, eyebrow) : null, /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: 0,
      fontFamily: "var(--font-display)",
      fontWeight: "var(--weight-light)",
      fontSize: "var(--size-display-m)",
      lineHeight: "var(--leading-snug)",
      letterSpacing: "var(--tracking-display)",
      textTransform: "lowercase",
      color: inverse ? "var(--text-on-inverse)" : "var(--text-heading)"
    }
  }, title), intro ? /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontFamily: "var(--font-editorial)",
      fontSize: "var(--size-body-l)",
      lineHeight: "var(--leading-loose)",
      color: inverse ? "var(--text-on-inverse-muted)" : "var(--text-muted)",
      maxWidth: "var(--measure-prose)",
      textWrap: "pretty"
    }
  }, intro) : null, action ? /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: "var(--space-8)"
    }
  }, action) : null);
}
Object.assign(__ds_scope, { SectionHeader });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/SectionHeader.jsx", error: String((e && e.message) || e) }); }

// components/core/Wordmark.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const SRC = {
  cream: "logo-bay-cream-trimmed.png",
  ink: "logo-bay-ink.png"
};
function Wordmark({
  tone = "ink",
  height = 40,
  assetBase = "assets",
  subtitle,
  style,
  ...rest
}) {
  const src = assetBase.replace(/\/+$/, "") + "/" + SRC[tone];
  const color = tone === "cream" ? "var(--cream-100)" : "var(--ink-900)";
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      display: "inline-flex",
      flexDirection: "column",
      alignItems: "flex-start",
      gap: Math.max(4, height * 0.16),
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("img", {
    src: src,
    alt: "bay",
    style: {
      height: height + "px",
      width: "auto",
      display: "block"
    }
  }), subtitle ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-ui)",
      fontSize: Math.max(9, height * 0.2) + "px",
      letterSpacing: "var(--tracking-eyebrow)",
      textTransform: "uppercase",
      color: color,
      opacity: .72
    }
  }, subtitle) : null);
}
Object.assign(__ds_scope, { Wordmark });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Wordmark.jsx", error: String((e && e.message) || e) }); }

// components/forms/Checkbox.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Checkbox({
  label,
  checked,
  onChange,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("label", {
    style: {
      display: "flex",
      gap: "var(--space-12)",
      alignItems: "flex-start",
      cursor: "pointer",
      ...style
    }
  }, /*#__PURE__*/React.createElement("input", _extends({
    type: "checkbox",
    checked: checked,
    onChange: onChange,
    style: {
      appearance: "none",
      width: 18,
      height: 18,
      flex: "none",
      marginTop: 2,
      border: "var(--border-hairline) solid var(--line-strong)",
      borderRadius: "var(--radius-xs)",
      background: checked ? "var(--ink-900)" : "var(--surface-raised)",
      cursor: "pointer",
      transition: "background var(--dur-fast) var(--ease-out)"
    }
  }, rest)), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-editorial)",
      fontSize: "var(--size-body)",
      lineHeight: "var(--leading-normal)",
      color: "var(--text-body)"
    }
  }, label));
}
Object.assign(__ds_scope, { Checkbox });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Checkbox.jsx", error: String((e && e.message) || e) }); }

// components/forms/Input.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const label = {
  fontFamily: "var(--font-ui)",
  fontSize: "var(--size-eyebrow)",
  fontWeight: "var(--weight-medium)",
  letterSpacing: "var(--tracking-eyebrow)",
  textTransform: "uppercase",
  color: "var(--text-muted)"
};
const control = {
  fontFamily: "var(--font-ui)",
  fontSize: "var(--size-body)",
  color: "var(--text-body)",
  background: "var(--surface-raised)",
  border: "var(--border-hairline) solid var(--line-strong)",
  borderRadius: "var(--radius-xs)",
  padding: "13px 14px",
  width: "100%",
  outline: "none",
  transition: "border-color var(--dur-fast) var(--ease-out), box-shadow var(--dur-fast) var(--ease-out)"
};
function Input({
  label: labelText,
  hint,
  error,
  type = "text",
  style,
  ...rest
}) {
  const [focus, setFocus] = React.useState(false);
  return /*#__PURE__*/React.createElement("label", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-8)",
      ...style
    }
  }, labelText ? /*#__PURE__*/React.createElement("span", {
    style: label
  }, labelText) : null, /*#__PURE__*/React.createElement("input", _extends({
    type: type,
    onFocus: () => setFocus(true),
    onBlur: () => setFocus(false),
    style: {
      ...control,
      borderColor: error ? "var(--status-closed)" : focus ? "var(--ink-900)" : "var(--line-strong)",
      boxShadow: focus ? "0 0 0 2px color-mix(in oklab, var(--focus-ring) 34%, transparent)" : "none"
    }
  }, rest)), error ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-ui)",
      fontSize: "var(--size-caption)",
      color: "var(--status-closed)"
    }
  }, error) : hint ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-ui)",
      fontSize: "var(--size-caption)",
      color: "var(--text-quiet)"
    }
  }, hint) : null);
}
Object.assign(__ds_scope, { Input });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Input.jsx", error: String((e && e.message) || e) }); }

// components/forms/Select.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const label = {
  fontFamily: "var(--font-ui)",
  fontSize: "var(--size-eyebrow)",
  fontWeight: "var(--weight-medium)",
  letterSpacing: "var(--tracking-eyebrow)",
  textTransform: "uppercase",
  color: "var(--text-muted)"
};
const control = {
  fontFamily: "var(--font-ui)",
  fontSize: "var(--size-body)",
  color: "var(--text-body)",
  background: "var(--surface-raised)",
  border: "var(--border-hairline) solid var(--line-strong)",
  borderRadius: "var(--radius-xs)",
  padding: "13px 14px",
  width: "100%",
  outline: "none",
  transition: "border-color var(--dur-fast) var(--ease-out), box-shadow var(--dur-fast) var(--ease-out)"
};
function Select({
  label: labelText,
  hint,
  children,
  style,
  ...rest
}) {
  const [focus, setFocus] = React.useState(false);
  return /*#__PURE__*/React.createElement("label", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-8)",
      ...style
    }
  }, labelText ? /*#__PURE__*/React.createElement("span", {
    style: label
  }, labelText) : null, /*#__PURE__*/React.createElement("span", {
    style: {
      position: "relative",
      display: "block"
    }
  }, /*#__PURE__*/React.createElement("select", _extends({
    onFocus: () => setFocus(true),
    onBlur: () => setFocus(false),
    style: {
      ...control,
      appearance: "none",
      paddingRight: "36px",
      borderColor: focus ? "var(--ink-900)" : "var(--line-strong)",
      boxShadow: focus ? "0 0 0 2px color-mix(in oklab, var(--focus-ring) 34%, transparent)" : "none"
    }
  }, rest), children), /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true",
    style: {
      position: "absolute",
      right: 14,
      top: "50%",
      transform: "translateY(-50%)",
      fontFamily: "var(--font-ui)",
      fontSize: "0.7rem",
      color: "var(--text-muted)",
      pointerEvents: "none"
    }
  }, "\u25BE")), hint ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-ui)",
      fontSize: "var(--size-caption)",
      color: "var(--text-quiet)"
    }
  }, hint) : null);
}
Object.assign(__ds_scope, { Select });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Select.jsx", error: String((e && e.message) || e) }); }

// components/menu/MenuItem.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function MenuItem({
  name,
  description,
  price,
  tags = [],
  note,
  dense = false,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("li", _extends({
    style: {
      listStyle: "none",
      display: "flex",
      flexDirection: "column",
      gap: dense ? "var(--space-2)" : "var(--space-4)",
      padding: dense ? "var(--space-8) 0" : "var(--space-12) 0",
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "baseline",
      gap: "var(--space-12)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-ui)",
      fontSize: "var(--size-body-l)",
      fontWeight: "var(--weight-medium)",
      color: "var(--text-heading)",
      letterSpacing: "var(--tracking-normal)"
    }
  }, name), tags.length ? /*#__PURE__*/React.createElement("span", {
    style: {
      display: "flex",
      gap: "var(--space-6)"
    }
  }, tags.map(t => /*#__PURE__*/React.createElement("span", {
    key: t,
    style: {
      fontFamily: "var(--font-ui)",
      fontSize: "var(--size-eyebrow)",
      letterSpacing: "var(--tracking-eyebrow)",
      textTransform: "uppercase",
      color: "var(--text-quiet)",
      border: "var(--border-hairline) solid var(--line-hairline)",
      borderRadius: "var(--radius-pill)",
      padding: "2px 7px"
    }
  }, t))) : null, /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true",
    style: {
      flex: 1,
      borderBottom: "var(--border-hairline) dotted var(--line-strong)",
      transform: "translateY(-4px)",
      opacity: .5
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-ui)",
      fontSize: "var(--size-body)",
      fontVariantNumeric: "tabular-nums",
      color: "var(--text-heading)"
    }
  }, price)), description ? /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontFamily: "var(--font-editorial)",
      fontSize: "var(--size-body)",
      lineHeight: "var(--leading-normal)",
      color: "var(--text-muted)",
      maxWidth: "var(--measure-prose)",
      textWrap: "pretty"
    }
  }, description) : null, note ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-ui)",
      fontSize: "var(--size-caption)",
      color: "var(--text-quiet)",
      fontStyle: "italic"
    }
  }, note) : null);
}
Object.assign(__ds_scope, { MenuItem });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/menu/MenuItem.jsx", error: String((e && e.message) || e) }); }

// components/menu/MenuSection.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function MenuSection({
  title,
  note,
  children,
  columns = 1,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("section", _extends({
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-16)",
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "baseline",
      justifyContent: "space-between",
      gap: "var(--space-16)",
      borderBottom: "var(--border-strong) solid var(--ink-900)",
      paddingBottom: "var(--space-8)"
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: 0,
      fontFamily: "var(--font-display)",
      fontWeight: "var(--weight-light)",
      fontSize: "var(--size-h2)",
      textTransform: "lowercase",
      letterSpacing: "var(--tracking-display)",
      color: "var(--text-heading)"
    }
  }, title), note ? /*#__PURE__*/React.createElement(__ds_scope.Eyebrow, null, note) : null), /*#__PURE__*/React.createElement("ul", {
    style: {
      margin: 0,
      padding: 0,
      display: "grid",
      gridTemplateColumns: "repeat(" + columns + ",minmax(0,1fr))",
      columnGap: "var(--space-56)"
    }
  }, children));
}
Object.assign(__ds_scope, { MenuSection });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/menu/MenuSection.jsx", error: String((e && e.message) || e) }); }

// components/venue/EventCard.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function EventCard({
  date,
  title,
  time,
  description,
  status,
  imageCaption = "Photography TBD",
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement(__ds_scope.Card, _extends({
    interactive: true,
    padding: 0,
    style: {
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("div", {
    style: {
      aspectRatio: "4 / 3",
      background: "var(--cream-300)",
      display: "grid",
      placeItems: "center",
      borderBottom: "var(--border-hairline) solid var(--line-hairline)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-ui)",
      fontSize: "var(--size-eyebrow)",
      letterSpacing: "var(--tracking-eyebrow)",
      textTransform: "uppercase",
      color: "var(--sand-500)"
    }
  }, imageCaption)), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "var(--space-20) var(--space-24) var(--space-24)",
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-8)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: "var(--space-12)"
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Eyebrow, null, date, time ? " · " + time : ""), status ? /*#__PURE__*/React.createElement(__ds_scope.Badge, {
    tone: status === "Booked out" ? "closed" : "info"
  }, status) : null), /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: 0,
      fontFamily: "var(--font-display)",
      fontWeight: "var(--weight-light)",
      fontSize: "var(--size-h3)",
      textTransform: "lowercase",
      color: "var(--text-heading)"
    }
  }, title), description ? /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontFamily: "var(--font-editorial)",
      fontSize: "var(--size-body)",
      lineHeight: "var(--leading-normal)",
      color: "var(--text-muted)",
      textWrap: "pretty"
    }
  }, description) : null));
}
Object.assign(__ds_scope, { EventCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/venue/EventCard.jsx", error: String((e && e.message) || e) }); }

// components/venue/HoursList.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function HoursList({
  rows = [],
  tone = "default",
  style,
  ...rest
}) {
  const inverse = tone === "inverse";
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      display: "flex",
      flexDirection: "column",
      ...style
    }
  }, rest), rows.map((r, i) => /*#__PURE__*/React.createElement(React.Fragment, {
    key: r.day
  }, i > 0 ? /*#__PURE__*/React.createElement(__ds_scope.Rule, {
    tone: inverse ? "inverse" : "hairline"
  }) : null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      gap: "var(--space-24)",
      padding: "var(--space-12) 0"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-ui)",
      fontSize: "var(--size-eyebrow)",
      letterSpacing: "var(--tracking-eyebrow)",
      textTransform: "uppercase",
      color: inverse ? "var(--text-on-inverse-muted)" : "var(--text-muted)"
    }
  }, r.day), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-ui)",
      fontSize: "var(--size-body-s)",
      fontVariantNumeric: "tabular-nums",
      color: r.closed ? inverse ? "var(--text-on-inverse-muted)" : "var(--text-quiet)" : inverse ? "var(--text-on-inverse)" : "var(--text-heading)"
    }
  }, r.closed ? "Closed" : r.hours)))));
}
Object.assign(__ds_scope, { HoursList });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/venue/HoursList.jsx", error: String((e && e.message) || e) }); }

// ui_kits/print-menu/MenuSheet.jsx
try { (() => {
const {
  MenuSection,
  MenuItem,
  Eyebrow,
  Rule
} = window.BayBelleriveDesignSystem_91e77a;
function MenuSheet({
  date = "thursday 10 september"
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      width: "595px",
      minHeight: "842px",
      background: "var(--cream-100)",
      padding: "56px 56px 40px",
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-40)",
      boxShadow: "var(--shadow-raised)"
    }
  }, /*#__PURE__*/React.createElement("header", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-12)",
      alignItems: "center",
      textAlign: "center"
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/logo-bay-ink.png",
    alt: "bay",
    style: {
      height: 44,
      width: "auto"
    }
  }), /*#__PURE__*/React.createElement(Eyebrow, null, "bar & kitchen \xB7 bellerive"), /*#__PURE__*/React.createElement(Rule, {
    inset: 0,
    style: {
      width: "100%",
      marginTop: 8
    }
  }), /*#__PURE__*/React.createElement(Eyebrow, {
    tone: "accent"
  }, date)), /*#__PURE__*/React.createElement(MenuSection, {
    title: "to start"
  }, /*#__PURE__*/React.createElement(MenuItem, {
    name: "Bruny oysters",
    price: "6 ea",
    description: "Natural, finger lime and shallot vinegar.",
    tags: ["GF"],
    note: "min 6"
  }), /*#__PURE__*/React.createElement(MenuItem, {
    name: "Warm bread, cultured butter",
    price: "9",
    tags: ["V"]
  }), /*#__PURE__*/React.createElement(MenuItem, {
    name: "Smoked eel, potato, dill",
    price: "19",
    description: "From the Derwent, smoked out the back."
  })), /*#__PURE__*/React.createElement(MenuSection, {
    title: "from the coals",
    note: "to share"
  }, /*#__PURE__*/React.createElement(MenuItem, {
    name: "Whole flounder, brown butter",
    price: "46",
    description: "Caught off Betsey Island this morning. Enough for two."
  }), /*#__PURE__*/React.createElement(MenuItem, {
    name: "Coal-roast carrots, macadamia",
    price: "22",
    tags: ["V", "GF"]
  }), /*#__PURE__*/React.createElement(MenuItem, {
    name: "Lamb shoulder, green sauce",
    price: "58",
    note: "min 2 people"
  })), /*#__PURE__*/React.createElement(MenuSection, {
    title: "sweet"
  }, /*#__PURE__*/React.createElement(MenuItem, {
    name: "Burnt honey custard",
    price: "14",
    tags: ["GF"]
  }), /*#__PURE__*/React.createElement(MenuItem, {
    name: "Pear, walnut, blue cheese",
    price: "18"
  })), /*#__PURE__*/React.createElement("footer", {
    style: {
      marginTop: "auto",
      paddingTop: "var(--space-24)",
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-8)"
    }
  }, /*#__PURE__*/React.createElement(Rule, null), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontFamily: "var(--font-ui)",
      fontSize: "var(--size-caption)",
      color: "var(--text-quiet)",
      lineHeight: "var(--leading-normal)"
    }
  }, "GF gluten free \xB7 V vegetarian \xB7 VE vegan. Tell us what you can't eat and we'll work around it. 10% public holiday surcharge. No split bills over eight.")));
}
Object.assign(window, {
  MenuSheet
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/print-menu/MenuSheet.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/BookScreen.jsx
try { (() => {
const {
  SectionHeader,
  Eyebrow,
  Button,
  Card,
  Input,
  Select,
  Checkbox,
  Rule,
  HoursList,
  Badge
} = window.BayBelleriveDesignSystem_91e77a;
const TIMES = ["12:00", "12:30", "1:00", "5:30", "6:00", "6:30", "7:00", "7:30", "8:15"];
const TAKEN = ["1:00", "7:00"];
function BookScreen() {
  const [step, setStep] = React.useState(1);
  const [guests, setGuests] = React.useState("4");
  const [time, setTime] = React.useState("6:30");
  const [note, setNote] = React.useState(true);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: "var(--width-content)",
      margin: "0 auto",
      padding: "var(--space-72) var(--gutter-page-wide) var(--space-96)",
      display: "grid",
      gridTemplateColumns: "1.25fr 0.75fr",
      gap: "var(--space-72)",
      alignItems: "start"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-40)"
    }
  }, /*#__PURE__*/React.createElement(SectionHeader, {
    eyebrow: "Bookings",
    title: step === 3 ? "you're in" : "book a table",
    intro: step === 3 ? "We've sent a note to your email. Change or cancel any time from that link." : "Tables of six or fewer online. We hold every booking for ten minutes."
  }), step < 3 && /*#__PURE__*/React.createElement(Card, {
    padding: 32,
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-24)"
    }
  }, step === 1 && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "var(--space-20)"
    }
  }, /*#__PURE__*/React.createElement(Select, {
    label: "Guests",
    value: guests,
    onChange: e => setGuests(e.target.value)
  }, ["2", "3", "4", "5", "6"].map(n => /*#__PURE__*/React.createElement("option", {
    key: n
  }, n))), /*#__PURE__*/React.createElement(Input, {
    label: "Date",
    type: "date",
    defaultValue: "2026-09-12"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-12)"
    }
  }, /*#__PURE__*/React.createElement(Eyebrow, null, "Sitting"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexWrap: "wrap",
      gap: "var(--space-8)"
    }
  }, TIMES.map(t => {
    const off = TAKEN.includes(t);
    const on = t === time;
    return /*#__PURE__*/React.createElement("button", {
      key: t,
      disabled: off,
      onClick: () => setTime(t),
      style: {
        appearance: "none",
        cursor: off ? "not-allowed" : "pointer",
        fontFamily: "var(--font-ui)",
        fontSize: "var(--size-body-s)",
        fontVariantNumeric: "tabular-nums",
        padding: "10px 16px",
        borderRadius: "var(--radius-xs)",
        border: "var(--border-hairline) solid " + (on ? "var(--ink-900)" : "var(--line-strong)"),
        background: on ? "var(--ink-900)" : "transparent",
        color: on ? "var(--cream-100)" : "var(--text-body)",
        opacity: off ? .35 : 1,
        transition: "all var(--dur-fast) var(--ease-out)"
      }
    }, t);
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-ui)",
      fontSize: "var(--size-caption)",
      color: "var(--text-quiet)"
    }
  }, "Greyed sittings are full. Kitchen closes at 9.")), /*#__PURE__*/React.createElement(Rule, null), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Button, {
    onClick: () => setStep(2)
  }, "Continue"))), step === 2 && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "var(--space-20)"
    }
  }, /*#__PURE__*/React.createElement(Input, {
    label: "Name",
    placeholder: "Who's booking?"
  }), /*#__PURE__*/React.createElement(Input, {
    label: "Phone",
    hint: "We'll only call if something changes."
  })), /*#__PURE__*/React.createElement(Input, {
    label: "Email",
    type: "email",
    placeholder: "you@example.com"
  }), /*#__PURE__*/React.createElement(Input, {
    label: "Anything we should know?",
    placeholder: "Allergies, a birthday, a pram"
  }), /*#__PURE__*/React.createElement(Checkbox, {
    label: "Send me the monthly what's-on note. One email, no more.",
    checked: note,
    onChange: e => setNote(e.target.checked)
  }), /*#__PURE__*/React.createElement(Rule, null), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: "var(--space-16)",
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement(Button, {
    onClick: () => setStep(3)
  }, "Confirm booking"), /*#__PURE__*/React.createElement(Button, {
    variant: "ghost",
    onClick: () => setStep(1)
  }, "Back")))), step === 3 && /*#__PURE__*/React.createElement(Card, {
    padding: 32,
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-16)"
    }
  }, /*#__PURE__*/React.createElement(Badge, {
    tone: "open"
  }, "Confirmed"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-display)",
      fontWeight: "var(--weight-light)",
      fontSize: "var(--size-h1)",
      textTransform: "lowercase",
      letterSpacing: "var(--tracking-display)",
      color: "var(--text-heading)"
    }
  }, "table for " + guests + " · fri 12 sep · " + time + "pm"), /*#__PURE__*/React.createElement(Rule, null), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontFamily: "var(--font-editorial)",
      fontSize: "var(--size-body-l)",
      lineHeight: "var(--leading-loose)",
      color: "var(--text-muted)"
    }
  }, "Come to the bar when you arrive \u2014 we'll walk you over. If you're running late, call rather than rebook."), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    onClick: () => setStep(1)
  }, "Book another")))), /*#__PURE__*/React.createElement(Card, {
    variant: "inverse",
    padding: 32,
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-24)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-8)"
    }
  }, /*#__PURE__*/React.createElement(Eyebrow, {
    tone: "inverse"
  }, "Good to know"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontFamily: "var(--font-editorial)",
      fontSize: "var(--size-body)",
      lineHeight: "var(--leading-loose)",
      color: "var(--text-on-inverse-muted)"
    }
  }, "Bar seats are walk-in only. Groups over six, send a note and we'll sort it by hand.")), /*#__PURE__*/React.createElement(Rule, {
    tone: "inverse"
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Eyebrow, {
    tone: "inverse"
  }, "Hours"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: "var(--space-8)"
    }
  }, /*#__PURE__*/React.createElement(HoursList, {
    tone: "inverse",
    rows: [{
      day: "Mon",
      closed: true
    }, {
      day: "Tue – Thu",
      hours: "11am – late"
    }, {
      day: "Fri – Sat",
      hours: "11am – 1am"
    }, {
      day: "Sun",
      hours: "10am – 10pm"
    }]
  }))), /*#__PURE__*/React.createElement(PhotoWell, {
    tone: "deep",
    label: "Map / foreshore photograph TBD",
    ratio: "4 / 3"
  })));
}
Object.assign(window, {
  BookScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/BookScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/Chrome.jsx
try { (() => {
const {
  Button,
  Wordmark,
  Eyebrow,
  Rule,
  HoursList
} = window.BayBelleriveDesignSystem_91e77a;
const NAV = [["home", "Home"], ["menu", "Menu"], ["events", "What's on"], ["book", "Bookings"]];
function TopBar({
  route,
  go
}) {
  const [scrolled, setScrolled] = React.useState(false);
  React.useEffect(() => {
    const el = document.getElementById("scroller");
    if (!el) return;
    const h = () => setScrolled(el.scrollTop > 24);
    el.addEventListener("scroll", h);
    return () => el.removeEventListener("scroll", h);
  }, []);
  return /*#__PURE__*/React.createElement("header", {
    style: {
      position: "sticky",
      top: 0,
      zIndex: 20,
      background: scrolled ? "color-mix(in oklab, var(--cream-100) 88%, transparent)" : "transparent",
      backdropFilter: scrolled ? "var(--blur-overlay)" : "none",
      borderBottom: scrolled ? "var(--border-hairline) solid var(--line-hairline)" : "var(--border-hairline) solid transparent",
      transition: "background var(--dur-base) var(--ease-out), border-color var(--dur-base) var(--ease-out)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: "var(--width-content)",
      margin: "0 auto",
      padding: "var(--space-20) var(--gutter-page-wide)",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "var(--space-32)"
    }
  }, /*#__PURE__*/React.createElement("a", {
    href: "#",
    onClick: e => {
      e.preventDefault();
      go("home");
    },
    style: {
      display: "block",
      lineHeight: 0
    }
  }, /*#__PURE__*/React.createElement(Wordmark, {
    tone: "ink",
    height: 30,
    assetBase: "../../assets"
  })), /*#__PURE__*/React.createElement("nav", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: "var(--space-32)"
    }
  }, NAV.map(([id, label]) => /*#__PURE__*/React.createElement("a", {
    key: id,
    href: "#" + id,
    onClick: e => {
      e.preventDefault();
      go(id);
    },
    style: {
      fontFamily: "var(--font-ui)",
      fontSize: "var(--size-eyebrow)",
      fontWeight: "var(--weight-medium)",
      letterSpacing: "var(--tracking-eyebrow)",
      textTransform: "uppercase",
      textDecoration: "none",
      paddingBottom: 3,
      color: route === id ? "var(--text-heading)" : "var(--text-muted)",
      boxShadow: route === id ? "inset 0 -1px 0 0 var(--ink-900)" : "none",
      transition: "color var(--dur-fast) var(--ease-out)"
    }
  }, label)), /*#__PURE__*/React.createElement(Button, {
    size: "sm",
    onClick: () => go("book")
  }, "Book a table"))));
}
function PhotoWell({
  label,
  ratio = "16 / 9",
  tone = "sand",
  style
}) {
  const bg = tone === "kelp" ? "var(--kelp-600)" : tone === "deep" ? "var(--kelp-900)" : "var(--cream-300)";
  const fg = tone === "sand" ? "var(--sand-500)" : "color-mix(in oklab, var(--cream-100) 52%, transparent)";
  return /*#__PURE__*/React.createElement("div", {
    style: {
      aspectRatio: ratio,
      background: bg,
      display: "grid",
      placeItems: "center",
      borderRadius: "var(--radius-xs)",
      ...style
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-ui)",
      fontSize: "var(--size-eyebrow)",
      letterSpacing: "var(--tracking-eyebrow)",
      textTransform: "uppercase",
      color: fg,
      textAlign: "center",
      padding: "0 var(--space-24)"
    }
  }, label));
}
function Footer({
  go
}) {
  return /*#__PURE__*/React.createElement("footer", {
    style: {
      background: "var(--surface-ink)",
      color: "var(--text-on-inverse)",
      padding: "var(--space-72) var(--gutter-page-wide) var(--space-40)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: "var(--width-content)",
      margin: "0 auto",
      display: "grid",
      gridTemplateColumns: "1.4fr 1fr 1fr",
      gap: "var(--space-56)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-20)"
    }
  }, /*#__PURE__*/React.createElement(Wordmark, {
    tone: "cream",
    height: 38,
    subtitle: "bar & kitchen \xB7 bellerive",
    assetBase: "../../assets"
  }), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontFamily: "var(--font-editorial)",
      fontSize: "var(--size-body)",
      lineHeight: "var(--leading-loose)",
      color: "var(--text-on-inverse-muted)",
      maxWidth: "38ch",
      textWrap: "pretty"
    }
  }, "On the Bellerive waterfront, five minutes from the ferry. Walk-ins welcome at the bar.")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-12)"
    }
  }, /*#__PURE__*/React.createElement(Eyebrow, {
    tone: "inverse"
  }, "Hours"), /*#__PURE__*/React.createElement(HoursList, {
    tone: "inverse",
    rows: [{
      day: "Mon",
      closed: true
    }, {
      day: "Tue – Thu",
      hours: "11am – late"
    }, {
      day: "Fri – Sat",
      hours: "11am – 1am"
    }, {
      day: "Sun",
      hours: "10am – 10pm"
    }]
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-12)"
    }
  }, /*#__PURE__*/React.createElement(Eyebrow, {
    tone: "inverse"
  }, "Find us"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-ui)",
      fontSize: "var(--size-body-s)",
      lineHeight: "var(--leading-loose)",
      color: "var(--text-on-inverse)"
    }
  }, "Victoria Esplanade", /*#__PURE__*/React.createElement("br", null), "Bellerive TAS 7018", /*#__PURE__*/React.createElement("br", null), "(03) 6244 0000", /*#__PURE__*/React.createElement("br", null), "hello@baybellerive.com.au"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: "var(--space-8)",
      display: "flex",
      gap: "var(--space-16)"
    }
  }, /*#__PURE__*/React.createElement("a", {
    href: "#book",
    onClick: e => {
      e.preventDefault();
      go("book");
    },
    style: {
      fontFamily: "var(--font-ui)",
      fontSize: "var(--size-eyebrow)",
      letterSpacing: "var(--tracking-eyebrow)",
      textTransform: "uppercase",
      color: "var(--cream-100)",
      textDecoration: "none",
      boxShadow: "inset 0 -1px 0 0 currentColor"
    }
  }, "Bookings"), /*#__PURE__*/React.createElement("a", {
    href: "#",
    onClick: e => e.preventDefault(),
    style: {
      fontFamily: "var(--font-ui)",
      fontSize: "var(--size-eyebrow)",
      letterSpacing: "var(--tracking-eyebrow)",
      textTransform: "uppercase",
      color: "var(--tide-300)",
      textDecoration: "none"
    }
  }, "Instagram")))), /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: "var(--width-content)",
      margin: "var(--space-56) auto 0"
    }
  }, /*#__PURE__*/React.createElement(Rule, {
    tone: "inverse"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      paddingTop: "var(--space-20)",
      display: "flex",
      justifyContent: "space-between",
      fontFamily: "var(--font-ui)",
      fontSize: "var(--size-caption)",
      color: "var(--text-on-inverse-muted)"
    }
  }, /*#__PURE__*/React.createElement("span", null, "We acknowledge the muwinina people, traditional owners of this land and water."), /*#__PURE__*/React.createElement("span", null, "\xA9 2026 bay"))));
}
Object.assign(window, {
  TopBar,
  Footer,
  PhotoWell,
  NAV
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/Chrome.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/EventsScreen.jsx
try { (() => {
const {
  SectionHeader,
  EventCard,
  Card,
  Eyebrow,
  Button,
  Rule
} = window.BayBelleriveDesignSystem_91e77a;
function EventsScreen({
  go
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: "var(--width-content)",
      margin: "0 auto",
      padding: "var(--space-72) var(--gutter-page-wide) var(--space-96)",
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-56)"
    }
  }, /*#__PURE__*/React.createElement(SectionHeader, {
    eyebrow: "What's on",
    title: "september at the bay",
    intro: "A handful of nights each month. Most sell out by word of mouth, so the list here is what's left."
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(3,1fr)",
      gap: "var(--space-32)"
    }
  }, /*#__PURE__*/React.createElement(EventCard, {
    date: "Fri 12 Sep",
    time: "7pm",
    title: "oysters & vinyl",
    status: "Few seats left",
    description: "Bruny oysters by the dozen, a rotating record, no bookings after 9."
  }), /*#__PURE__*/React.createElement(EventCard, {
    date: "Sun 21 Sep",
    time: "12pm",
    title: "long table lunch",
    status: "Booked out",
    description: "One sitting, one menu, forty seats down the middle of the room."
  }), /*#__PURE__*/React.createElement(EventCard, {
    date: "Thu 25 Sep",
    time: "6pm",
    title: "growers at the bar",
    description: "Five Coal River makers pouring what they've got open."
  }), /*#__PURE__*/React.createElement(EventCard, {
    date: "Fri 3 Oct",
    time: "7pm",
    title: "whole fish friday",
    description: "One fish, four ways, until it's gone."
  }), /*#__PURE__*/React.createElement(EventCard, {
    date: "Sat 11 Oct",
    time: "4pm",
    title: "regatta afternoon",
    description: "Bar only, tables held for an hour at a time."
  }), /*#__PURE__*/React.createElement(EventCard, {
    date: "Sun 26 Oct",
    time: "12pm",
    title: "long table lunch",
    description: "Same idea, new menu. Bookings open the first of the month."
  })), /*#__PURE__*/React.createElement(Rule, null), /*#__PURE__*/React.createElement(Card, {
    variant: "sunken",
    padding: 40,
    style: {
      display: "grid",
      gridTemplateColumns: "1.2fr 1fr",
      gap: "var(--space-56)",
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-12)"
    }
  }, /*#__PURE__*/React.createElement(Eyebrow, null, "Private events"), /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: 0,
      fontFamily: "var(--font-display)",
      fontWeight: "var(--weight-light)",
      fontSize: "var(--size-display-m)",
      textTransform: "lowercase",
      letterSpacing: "var(--tracking-display)",
      color: "var(--text-heading)"
    }
  }, "the whole room, if you like"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontFamily: "var(--font-editorial)",
      fontSize: "var(--size-body-l)",
      lineHeight: "var(--leading-loose)",
      color: "var(--text-muted)",
      maxWidth: "48ch",
      textWrap: "pretty"
    }
  }, "Forty-eight seated, seventy standing. Set menus from 75 a head. We'll need a fortnight's notice and a rough headcount.")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-12)"
    }
  }, /*#__PURE__*/React.createElement(Button, {
    onClick: () => go("book")
  }, "Send an enquiry"), /*#__PURE__*/React.createElement(Button, {
    variant: "ghost"
  }, "Download the events pack"))));
}
Object.assign(window, {
  EventsScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/EventsScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/Home.jsx
try { (() => {
const {
  Button,
  SectionHeader,
  Eyebrow,
  Badge,
  Card,
  Rule,
  MenuSection,
  MenuItem,
  EventCard
} = window.BayBelleriveDesignSystem_91e77a;
function Hero({
  go
}) {
  return /*#__PURE__*/React.createElement("section", {
    style: {
      position: "relative",
      minHeight: 640,
      display: "grid"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      inset: 0,
      background: "var(--brand-primary)"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      inset: 0,
      display: "flex",
      justifyContent: "flex-end",
      alignItems: "flex-start",
      padding: "var(--space-24) var(--gutter-page-wide)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-ui)",
      fontSize: "var(--size-eyebrow)",
      letterSpacing: "var(--tracking-eyebrow)",
      textTransform: "uppercase",
      color: "color-mix(in oklab, var(--cream-100) 30%, transparent)",
      textAlign: "right"
    }
  }, "Full-bleed hero photography TBD \u2014 waterfront at dusk")), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      inset: 0,
      background: "var(--scrim-image)"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      maxWidth: "var(--width-content)",
      margin: "0 auto",
      width: "100%",
      padding: "var(--space-128) var(--gutter-page-wide) var(--space-56)",
      alignSelf: "end",
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-24)"
    }
  }, /*#__PURE__*/React.createElement(Badge, {
    tone: "open",
    style: {
      color: "var(--cream-100)"
    }
  }, "Open now \xB7 kitchen til 9"), /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: 0,
      fontFamily: "var(--font-display)",
      fontWeight: "var(--weight-light)",
      fontSize: "var(--size-display-xl)",
      lineHeight: "var(--leading-tight)",
      letterSpacing: "var(--tracking-display)",
      textTransform: "lowercase",
      color: "var(--cream-100)",
      maxWidth: "18ch"
    }
  }, "eat by the water"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontFamily: "var(--font-editorial)",
      fontSize: "var(--size-body-l)",
      lineHeight: "var(--leading-loose)",
      color: "color-mix(in oklab, var(--cream-100) 78%, transparent)",
      maxWidth: "46ch",
      textWrap: "pretty"
    }
  }, "A bar and kitchen on the Bellerive foreshore. Coals, cold wine, and the ferry going past."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: "var(--space-16)",
      marginTop: "var(--space-8)"
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "inverse",
    size: "lg",
    onClick: () => go("book")
  }, "Book a table"), /*#__PURE__*/React.createElement(Button, {
    variant: "quietInverse",
    size: "lg",
    onClick: () => go("menu")
  }, "See the menu"))));
}
function Home({
  go
}) {
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Hero, {
    go: go
  }), /*#__PURE__*/React.createElement("section", {
    style: {
      maxWidth: "var(--width-content)",
      margin: "0 auto",
      padding: "var(--space-96) var(--gutter-page-wide)",
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "var(--space-72)",
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement(PhotoWell, {
    label: "Room photography TBD \u2014 bar, late afternoon light",
    ratio: "4 / 5"
  }), /*#__PURE__*/React.createElement(SectionHeader, {
    eyebrow: "The room",
    title: "a short walk and a long lunch",
    intro: "We took over the old boatshed office in 2019 and kept most of it: the terrazzo, the window that doesn't quite close, the view. The kitchen is small on purpose \u2014 fifteen or so dishes, most of them cooked over coals, all of them meant for the middle of the table.",
    action: /*#__PURE__*/React.createElement(Button, {
      variant: "ghost",
      onClick: () => go("events")
    }, "What's on this month")
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      background: "var(--surface-sunken)"
    }
  }, /*#__PURE__*/React.createElement("section", {
    style: {
      maxWidth: "var(--width-content)",
      margin: "0 auto",
      padding: "var(--space-96) var(--gutter-page-wide)",
      display: "grid",
      gridTemplateColumns: "0.8fr 1.2fr",
      gap: "var(--space-72)"
    }
  }, /*#__PURE__*/React.createElement(SectionHeader, {
    eyebrow: "Kitchen",
    title: "today's short list",
    intro: "It changes when the boats do.",
    action: /*#__PURE__*/React.createElement(Button, {
      variant: "secondary",
      size: "sm",
      onClick: () => go("menu")
    }, "Full menu")
  }), /*#__PURE__*/React.createElement(MenuSection, {
    title: "from the coals",
    note: "to share"
  }, /*#__PURE__*/React.createElement(MenuItem, {
    name: "Bruny oysters",
    price: "6 ea",
    description: "Natural, finger lime and shallot vinegar.",
    tags: ["GF"],
    note: "min 6"
  }), /*#__PURE__*/React.createElement(MenuItem, {
    name: "Whole flounder, brown butter",
    price: "46",
    description: "Caught off Betsey Island this morning. Enough for two."
  }), /*#__PURE__*/React.createElement(MenuItem, {
    name: "Coal-roast carrots, macadamia",
    price: "22",
    description: "With a spoonful of last summer's honey.",
    tags: ["V", "GF"]
  })))), /*#__PURE__*/React.createElement("section", {
    style: {
      maxWidth: "var(--width-content)",
      margin: "0 auto",
      padding: "var(--space-96) var(--gutter-page-wide)",
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-40)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-end",
      gap: "var(--space-32)"
    }
  }, /*#__PURE__*/React.createElement(SectionHeader, {
    eyebrow: "What's on",
    title: "september at the bay"
  }), /*#__PURE__*/React.createElement(Button, {
    variant: "ghost",
    onClick: () => go("events")
  }, "All events")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(3,1fr)",
      gap: "var(--space-32)"
    }
  }, /*#__PURE__*/React.createElement(EventCard, {
    date: "Fri 12 Sep",
    time: "7pm",
    title: "oysters & vinyl",
    status: "Few seats left",
    description: "Bruny oysters by the dozen, a rotating record, no bookings after 9."
  }), /*#__PURE__*/React.createElement(EventCard, {
    date: "Sun 21 Sep",
    time: "12pm",
    title: "long table lunch",
    status: "Booked out",
    description: "One sitting, one menu, forty seats down the middle of the room."
  }), /*#__PURE__*/React.createElement(EventCard, {
    date: "Thu 25 Sep",
    time: "6pm",
    title: "growers at the bar",
    description: "Five Coal River makers pouring what they've got open."
  }))), /*#__PURE__*/React.createElement("section", {
    style: {
      background: "var(--surface-inverse)",
      color: "var(--text-on-inverse)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: "var(--width-narrow)",
      margin: "0 auto",
      padding: "var(--space-96) var(--gutter-page-wide)",
      textAlign: "center",
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-24)",
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement(Eyebrow, {
    tone: "inverse"
  }, "Bookings"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontFamily: "var(--font-editorial)",
      fontSize: "clamp(1.5rem,3vw,2.25rem)",
      lineHeight: "1.34",
      color: "var(--cream-100)",
      textWrap: "pretty"
    }
  }, "Tables of six or fewer, book online. Anything bigger, send us a note and we'll work it out."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: "var(--space-16)",
      marginTop: "var(--space-8)"
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "inverse",
    onClick: () => go("book")
  }, "Book a table"), /*#__PURE__*/React.createElement(Button, {
    variant: "quietInverse"
  }, "Large groups")))));
}
Object.assign(window, {
  Home
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/Home.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/MenuScreen.jsx
try { (() => {
const {
  SectionHeader,
  Eyebrow,
  Rule,
  Badge,
  MenuSection,
  MenuItem,
  Button
} = window.BayBelleriveDesignSystem_91e77a;
const TABS = ["Kitchen", "Bar", "Sunday"];
function MenuScreen() {
  const [tab, setTab] = React.useState("Kitchen");
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: "var(--width-content)",
      margin: "0 auto",
      padding: "var(--space-72) var(--gutter-page-wide) var(--space-40)"
    }
  }, /*#__PURE__*/React.createElement(SectionHeader, {
    eyebrow: "Menu",
    title: "fifteen or so dishes",
    intro: "Written each morning, printed each afternoon. Everything is for the middle of the table unless we say otherwise."
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "sticky",
      top: 71,
      zIndex: 10,
      background: "color-mix(in oklab, var(--cream-100) 92%, transparent)",
      backdropFilter: "var(--blur-overlay)",
      borderTop: "var(--border-hairline) solid var(--line-hairline)",
      borderBottom: "var(--border-hairline) solid var(--line-hairline)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: "var(--width-content)",
      margin: "0 auto",
      padding: "0 var(--gutter-page-wide)",
      display: "flex",
      gap: "var(--space-32)"
    }
  }, TABS.map(t => /*#__PURE__*/React.createElement("button", {
    key: t,
    onClick: () => setTab(t),
    style: {
      appearance: "none",
      background: "none",
      border: "none",
      cursor: "pointer",
      padding: "var(--space-16) 0",
      fontFamily: "var(--font-ui)",
      fontSize: "var(--size-eyebrow)",
      fontWeight: "var(--weight-medium)",
      letterSpacing: "var(--tracking-eyebrow)",
      textTransform: "uppercase",
      color: tab === t ? "var(--text-heading)" : "var(--text-muted)",
      boxShadow: tab === t ? "inset 0 -1.5px 0 0 var(--ink-900)" : "none",
      transition: "color var(--dur-fast) var(--ease-out)"
    }
  }, t)), /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: "auto",
      alignSelf: "center"
    }
  }, /*#__PURE__*/React.createElement(Badge, {
    tone: "info",
    dot: false
  }, "Prices in AUD")))), /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: "var(--width-narrow)",
      margin: "0 auto",
      padding: "var(--space-56) var(--gutter-page-wide) var(--space-96)",
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-56)"
    }
  }, tab === "Kitchen" && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(MenuSection, {
    title: "to start",
    note: "til 4pm"
  }, /*#__PURE__*/React.createElement(MenuItem, {
    name: "Bruny oysters",
    price: "6 ea",
    description: "Natural, finger lime and shallot vinegar.",
    tags: ["GF"],
    note: "min 6"
  }), /*#__PURE__*/React.createElement(MenuItem, {
    name: "Warm bread, cultured butter",
    price: "9",
    tags: ["V"]
  }), /*#__PURE__*/React.createElement(MenuItem, {
    name: "Smoked eel, potato, dill",
    price: "19",
    description: "From the Derwent, smoked out the back."
  })), /*#__PURE__*/React.createElement(MenuSection, {
    title: "from the coals",
    note: "to share"
  }, /*#__PURE__*/React.createElement(MenuItem, {
    name: "Whole flounder, brown butter",
    price: "46",
    description: "Caught off Betsey Island this morning. Enough for two."
  }), /*#__PURE__*/React.createElement(MenuItem, {
    name: "Coal-roast carrots, macadamia",
    price: "22",
    description: "With a spoonful of last summer's honey.",
    tags: ["V", "GF"]
  }), /*#__PURE__*/React.createElement(MenuItem, {
    name: "Lamb shoulder, green sauce",
    price: "58",
    description: "Slow over coals since ten this morning.",
    note: "min 2 people"
  })), /*#__PURE__*/React.createElement(MenuSection, {
    title: "sweet"
  }, /*#__PURE__*/React.createElement(MenuItem, {
    name: "Burnt honey custard",
    price: "14",
    tags: ["GF"]
  }), /*#__PURE__*/React.createElement(MenuItem, {
    name: "Pear, walnut, blue cheese",
    price: "18",
    description: "Or the cheese on its own, if you'd rather."
  }))), tab === "Bar" && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(MenuSection, {
    title: "wine by the glass",
    columns: 2
  }, /*#__PURE__*/React.createElement(MenuItem, {
    dense: true,
    name: "Freycinet riesling",
    price: "14"
  }), /*#__PURE__*/React.createElement(MenuItem, {
    dense: true,
    name: "Coal River p\xE9t-nat",
    price: "17"
  }), /*#__PURE__*/React.createElement(MenuItem, {
    dense: true,
    name: "Derwent pinot noir",
    price: "16"
  }), /*#__PURE__*/React.createElement(MenuItem, {
    dense: true,
    name: "Tamar chardonnay",
    price: "15"
  }), /*#__PURE__*/React.createElement(MenuItem, {
    dense: true,
    name: "Huon cider",
    price: "11"
  }), /*#__PURE__*/React.createElement(MenuItem, {
    dense: true,
    name: "Sparkling, NV",
    price: "15"
  })), /*#__PURE__*/React.createElement(MenuSection, {
    title: "mixed"
  }, /*#__PURE__*/React.createElement(MenuItem, {
    name: "Esplanade spritz",
    price: "18",
    description: "Local vermouth, soda, a lot of ice."
  }), /*#__PURE__*/React.createElement(MenuItem, {
    name: "Cold martini",
    price: "22",
    description: "Gin or vodka. Olive or twist. That's the whole conversation."
  })), /*#__PURE__*/React.createElement(MenuSection, {
    title: "no alcohol",
    columns: 2
  }, /*#__PURE__*/React.createElement(MenuItem, {
    dense: true,
    name: "Seltzer, sour cherry",
    price: "9"
  }), /*#__PURE__*/React.createElement(MenuItem, {
    dense: true,
    name: "Coffee",
    price: "5"
  }))), tab === "Sunday" && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      background: "var(--surface-accent)",
      padding: "var(--space-24)",
      borderRadius: "var(--radius-xs)",
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-8)"
    }
  }, /*#__PURE__*/React.createElement(Eyebrow, {
    tone: "accent"
  }, "Sundays only"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontFamily: "var(--font-editorial)",
      fontSize: "var(--size-body-l)",
      lineHeight: "var(--leading-loose)",
      color: "var(--ink-800)"
    }
  }, "One sitting from noon. 68 a head, the whole table eats the same thing, and we stop when the food runs out.")), /*#__PURE__*/React.createElement(MenuSection, {
    title: "the sunday table",
    note: "68 a head"
  }, /*#__PURE__*/React.createElement(MenuItem, {
    name: "Oysters, bread, butter",
    price: "\u2014",
    description: "While you sit down."
  }), /*#__PURE__*/React.createElement(MenuItem, {
    name: "Whole fish or lamb shoulder",
    price: "\u2014",
    description: "Whatever came in on Friday."
  }), /*#__PURE__*/React.createElement(MenuItem, {
    name: "Two things from the garden",
    price: "\u2014",
    tags: ["V"]
  }), /*#__PURE__*/React.createElement(MenuItem, {
    name: "Burnt honey custard",
    price: "\u2014"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Button, {
    variant: "secondary"
  }, "Enquire about Sunday"))), /*#__PURE__*/React.createElement(Rule, null), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontFamily: "var(--font-ui)",
      fontSize: "var(--size-caption)",
      color: "var(--text-quiet)",
      lineHeight: "var(--leading-normal)"
    }
  }, "GF gluten free \xB7 V vegetarian \xB7 VE vegan. We can work around most things \u2014 tell us when you book. 10% surcharge on public holidays. No split bills after eight people.")));
}
Object.assign(window, {
  MenuScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/MenuScreen.jsx", error: String((e && e.message) || e) }); }

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.Eyebrow = __ds_scope.Eyebrow;

__ds_ns.Rule = __ds_scope.Rule;

__ds_ns.SectionHeader = __ds_scope.SectionHeader;

__ds_ns.Wordmark = __ds_scope.Wordmark;

__ds_ns.Checkbox = __ds_scope.Checkbox;

__ds_ns.Input = __ds_scope.Input;

__ds_ns.Select = __ds_scope.Select;

__ds_ns.MenuItem = __ds_scope.MenuItem;

__ds_ns.MenuSection = __ds_scope.MenuSection;

__ds_ns.EventCard = __ds_scope.EventCard;

__ds_ns.HoursList = __ds_scope.HoursList;

})();
