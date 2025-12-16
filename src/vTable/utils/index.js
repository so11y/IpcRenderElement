import { toValue } from "vue";

export function where(when, truly, falsy) {
  const test = typeof when === "function" ? when() : when;
  return test ? toValue(truly) : toValue(falsy);
}

export function parseBool(value) {
  switch (value) {
    case "true":
      return true;
    case "false":
      return false;
  }
  return value;
}
