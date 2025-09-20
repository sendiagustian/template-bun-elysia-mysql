import { readFileSync } from "fs";
import { join } from "path";

export class TemplateRenderer {
    private static templateCache = new Map<string, string>();

    static renderTemplate(templateName: string, variables: Record<string, string> = {}): string {
        // Get template content
        let template = this.getTemplate(templateName);

        // Replace variables
        for (const [key, value] of Object.entries(variables)) {
            const placeholder = `{{${key}}}`;
            template = template.replace(new RegExp(placeholder, "g"), value);
        }

        // Remove unused placeholders
        template = template.replace(/\{\{[^}]+\}\}/g, "");

        return template;
    }

    private static getTemplate(templateName: string): string {
        // Check cache first
        if (this.templateCache.has(templateName)) {
            return this.templateCache.get(templateName)!;
        }

        try {
            const templatePath = join(process.cwd(), "templates", `${templateName}.html`);
            const content = readFileSync(templatePath, "utf-8");

            // Cache the template
            this.templateCache.set(templateName, content);

            return content;
        } catch (error) {
            console.error(`Failed to load template: ${templateName}`, error);
            return `<h1>Template Error</h1><p>Could not load template: ${templateName}</p>`;
        }
    }

    static clearCache(): void {
        this.templateCache.clear();
    }
}
