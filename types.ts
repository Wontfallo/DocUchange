export const Theme = {
  LIGHT: 'light',
  DARK: 'dark',
};

export const PreviewTab = {
    PREVIEW: 'Preview',
    MARKDOWN: 'Markdown',
    HTML: 'HTML'
};

// Add types for global libraries
declare global {
  interface Window {
    Quill: any;
    quillBetterTable: any;
    TurndownService: any;
    Prism: any;
  }
}
