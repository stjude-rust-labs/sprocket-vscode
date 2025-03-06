import * as vscode from "vscode";

export function generateParameterMeta() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        return;
    }

    const document = editor.document;
    const text = document.getText();
    
    // Regular Expression to extract input block variables
    const inputBlockRegex = /input\s*\{([\s\S]*?)\}/;
    const match = text.match(inputBlockRegex);

    if (!match) {
        vscode.window.showInformationMessage("No input block found.");
        return;
    }

    // Extract variables inside the input block
    const inputBlockContent = match[1].trim();
    const inputLines = inputBlockContent.split("\n").map(line => line.trim());

    const parameterMetaEntries = inputLines
        .filter(line => line.includes(" ")) // Ignore empty lines
        .map(line => {
            const parts = line.split(/\s+/); // Split by whitespace
            if (parts.length < 2) return null;
            const varName = parts[1].replace(";", ""); // Remove any trailing semicolon
            return `    ${varName}: "Description for ${varName}"`;
        })
        .filter(Boolean)
        .join("\n");

    if (!parameterMetaEntries) {
        vscode.window.showInformationMessage("No valid input parameters found.");
        return;
    }

    // Construct the parameter_meta block
    const parameterMetaBlock = `\n    parameter_meta {\n${parameterMetaEntries}\n    }\n`;

    editor.edit(editBuilder => {
        // Insert the parameter_meta block at the end of the task
        const position = new vscode.Position(document.lineCount, 0);
        editBuilder.insert(position, parameterMetaBlock);
    });

    vscode.window.showInformationMessage("parameter_meta block generated.");
}
