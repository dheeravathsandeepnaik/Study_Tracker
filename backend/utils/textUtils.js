exports.normalizeText = (input) => {
    if (!input) return input;
    return input.toString().trim().toLowerCase();
};
