export function extractProjectNameFromUrl(url) {
    try {
        const match = url.match(/\/([^\/]+)\/graphql$/);
        return match ? match[1] : 'default-api';
    }
    catch {
        return 'default-api';
    }
}
