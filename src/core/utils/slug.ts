export function generateSlug(text: string): string {
    return (
        text
            .toLowerCase()
            .trim()
            // Replace spaces with hyphens
            .replace(/\s+/g, "-")
            // Remove special characters except hyphens
            .replace(/[^a-z0-9-]/g, "")
            // Remove multiple consecutive hyphens
            .replace(/-+/g, "-")
            // Remove leading and trailing hyphens
            .replace(/^-|-$/g, "")
    );
}

export function generateUniqueSlug(baseSlug: string, existingSlugs: string[]): string {
    let slug = baseSlug;
    let counter = 1;

    while (existingSlugs.includes(slug)) {
        slug = `${baseSlug}-${counter}`;
        counter++;
    }

    return slug;
}
