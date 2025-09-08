export function normalizeName(name: string) {
    return name.normalize('NFKC').trim().replace(/\s+/g, ' ').toLowerCase();
}
