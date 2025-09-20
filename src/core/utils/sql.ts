export function toSqlArrayText(arr?: string[] | null): string | null {
    if (!arr || arr.length === 0) return null;
    // Escaping tanda kutip tunggal agar aman dari karakter berbahaya
    const escaped = arr.map((v) => `"${v.replace(/"/g, '\\"')}"`);
    return `{${escaped.join(",")}}`; // hasil: {"url1","url2"}
}
