export const getApiUrl = (path) => {
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
        return `http://localhost:3001${path}`;
    }
    return path;
};
