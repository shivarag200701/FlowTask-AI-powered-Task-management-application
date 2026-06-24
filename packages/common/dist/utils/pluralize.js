function pluralize(word, count, options = {}) {
    if (count === 1) {
        return word;
    }
    return options.plural || `${word}s`;
}
export default pluralize;
//# sourceMappingURL=pluralize.js.map