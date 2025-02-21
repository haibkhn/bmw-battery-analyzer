export const formatValue = (value: number): string => {
  return value.toFixed(4);
};

export const getDomainPadding = (
  min: number,
  max: number
): [number, number] => {
  const range = max - min;
  const padding = range * 0.05;
  return [min - padding, max + padding];
};
