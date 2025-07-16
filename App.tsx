import React, { useState, useEffect, useCallback } from 'react';
import { Theme } from './types.js';
import useDebounce from './hooks/useDebounce.js';
import Header from './components/Header.js';
import EditorWrapper from './components/EditorWrapper.js';
import PreviewTabs from './components/PreviewTabs.js';
import Outline from './components/Outline.js';
import CustomToolbar from './components/CustomToolbar.js';

const App = () => {
  const [theme, setTheme] = useState(Theme.LIGHT);
  const [editorHtml, setEditorHtml] = useState('<h1 id="heading-0-1">Welcome to Markdown Maestro!</h1><p><br></p><p>Start typing here to see the magic happen. Use the toolbar above to format your text.</p><p><br></p><h2 id="heading-1-2">Key Features:</h2><ul><li>Real-time Markdown &amp; HTML preview</li><li>Rich text formatting options</li><li>Document outline for easy navigation</li><li>Syntax highlighting for code blocks</li><li>Light &amp; Dark modes</li><li>Easy export to .md and .html</li></ul>');
  const [markdown, setMarkdown] = useState('');
  const [processedContent, setProcessedContent] = useState({ headings: [], html: '' });

  const debouncedHtml = useDebounce(editorHtml, 300);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove(theme === Theme.LIGHT ? Theme.DARK : Theme.LIGHT);
    root.classList.add(theme);
  }, [theme]);
  
  // Process HTML for outline and markdown conversion
  useEffect(() => {
    // Process for Outline
    const parser = new DOMParser();
    const doc = parser.parseFromString(debouncedHtml, 'text/html');
    const headingElements = doc.querySelectorAll('h1, h2, h3, h4, h5, h6');
    
    const newHeadings = Array.from(headingElements).map((el, index) => {
      const level = parseInt(el.tagName.substring(1), 10);
      const text = (el as HTMLElement).innerText;
      const id = `heading-${index}-${level}`;
      el.id = id; // IMPORTANT: Assign ID to the element in the parsed doc
      return { id, text, level };
    });
    
    const processedHtmlString = doc.body.innerHTML;
    setProcessedContent({ headings: newHeadings, html: processedHtmlString });

    // Process for Markdown
    if (window.TurndownService) {
      const turndownService = new window.TurndownService({
          headingStyle: 'atx',
          codeBlockStyle: 'fenced'
      });
      // Use the original debouncedHtml for markdown to avoid injected IDs
      const md = turndownService.turndown(debouncedHtml);
      setMarkdown(md);
    }
  }, [debouncedHtml]);

  const toggleTheme = useCallback(() => {
    setTheme((prevTheme) => (prevTheme === Theme.LIGHT ? Theme.DARK : Theme.LIGHT));
  }, []);

  const handleContentChange = useCallback((content) => {
    setEditorHtml(content);
  }, []);

  return React.createElement('div', { className: `flex flex-col h-screen font-sans transition-colors duration-300 text-gray-800 dark:text-gray-200` },
    React.createElement(Header, {
      theme: theme,
      toggleTheme: toggleTheme,
      markdownContent: markdown,
      htmlContent: editorHtml,
    }),
    React.createElement('main', { className: "flex-grow flex flex-col overflow-hidden" },
      React.createElement(CustomToolbar, null),
      React.createElement('div', { className: "flex-grow flex flex-row overflow-hidden" },
        React.createElement(Outline, { headings: processedContent.headings }),
        React.createElement('div', { className: "flex-grow w-1/2 flex flex-col border-r border-gray-200 dark:border-gray-700" },
          React.createElement(EditorWrapper, { value: editorHtml, onChange: handleContentChange })
        ),
        React.createElement('div', { className: "w-1/2 flex-grow" },
          React.createElement(PreviewTabs, { markdownContent: markdown, htmlContent: processedContent.html })
        )
      )
    )
  );
};

export default App;
