// Names to show in a dropdown: every active value, plus the record's current value
// when it was deactivated later, so an old record never shows a blank selection.
export function statusOptionNames(values: { name: string }[], current?: string | null): string[] {
  const names = values.map((v) => v.name);
  if (current && !names.includes(current)) names.push(current);
  return names;
}
