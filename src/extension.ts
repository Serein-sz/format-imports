import * as vscode from 'vscode';
import { formatImports } from './utils';

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerTextEditorCommand('format-imports.format', formatImportsHandler);
  context.subscriptions.push(disposable);
}

function formatImportsHandler(textEditor: vscode.TextEditor, edit: vscode.TextEditorEdit) {
  formatImports(textEditor, edit);
}

export function deactivate() { }
