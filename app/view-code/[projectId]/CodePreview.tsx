'use client';

import React from 'react';
import { Sandpack } from "@codesandbox/sandpack-react";
import { nightOwl } from "@codesandbox/sandpack-themes";

export default function CodePreview({ generatedCode }: { generatedCode: string | null }) {
    if (generatedCode === null) {
        return null; // The loading state is handled by the parent component
    }

    return (
        <div className="h-full w-full">
            <Sandpack
                theme={nightOwl}
                template="react"
                options={{ 
                    showLineNumbers: true,
                    showTabs: true,
                    closableTabs: false,
                    showConsole: true,
                    showConsoleButton: true,
                    editorHeight: 'calc(100vh - 40px)', // Full height minus some padding
                    externalResources: ["https://cdn.tailwindcss.com"], 
                }}
                customSetup={{
                    dependencies: {
                        "react": "latest",
                        "react-dom": "latest",
                        "tailwindcss": "^3.4.1"
                    },
                    entry: "/index.js",
                }}
                files={{
                    "/App.js": {
                        code: generatedCode,
                        active: true
                    },
                    "/index.js": {
                        code: `
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`,
                        hidden: true
                    },
                    "/styles.css": {
                        code: `@tailwind base;
@tailwind components;
@tailwind utilities;`,
                        hidden: true
                    },
                    "/public/index.html": {
                        code: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Preview</title>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`,
                        hidden: true
                    }
                }}
            />
        </div>
    );
}