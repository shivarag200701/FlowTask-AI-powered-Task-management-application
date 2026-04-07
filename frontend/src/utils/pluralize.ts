function pluralize(
  word: string,
  count: number,
  options: {
    plural?: string;
  }={},
) {
  if (count === 1) {
    return word;
  }

  return options.plural || `${word}s`;
}
export default pluralize;
