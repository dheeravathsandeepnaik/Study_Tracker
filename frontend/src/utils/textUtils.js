export const toTitleCase = (str) => {
    if (!str) return '';
    return str.split(' ').map(word => {
        if (word.length === 0) return '';
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    }).join(' ');
};

export const normalizeInput = (str) => {
    if (!str) return '';
    return str.trim().toLowerCase();
};
