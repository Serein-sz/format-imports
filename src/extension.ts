import * as vscode from 'vscode';
import { buildAllText, buildImportInfoArray, processingImportText, readDependency , removeAndInsertImports, sortImportArray} from './utils';

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerTextEditorCommand('format-imports.format', formatImportsHandler);
  context.subscriptions.push(disposable);
}

function formatImportsHandler(textEditor: vscode.TextEditor, edit: vscode.TextEditorEdit) {
  const dependencies = readDependency();

  let [firstImportLine, importArray] = buildImportInfoArray(textEditor.document);

  const allText = buildAllText(importArray.map(item => item.range), textEditor.document).replace(/\/\/.*|\/\*[\s\S]*?\*\//g, '').match(/\b\w+\b/g)?.join(' ');

  if (!allText) {
    vscode.window.showErrorMessage('not match quote');
  }

  importArray.map(item => (item.text = processingImportText(item.text, allText!), item));

  sortImportArray(importArray, dependencies);

  removeAndInsertImports(edit, firstImportLine, importArray, dependencies);
}


export function deactivate() { }
