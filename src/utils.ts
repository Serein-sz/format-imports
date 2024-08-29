import * as vscode from 'vscode';
import * as path from 'path';
import { readFileSync } from 'node:fs';
import type { Import } from './types';
export function readDependency(): string[] {
  // 获取当前工作区的文件夹
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders) {
    vscode.window.showErrorMessage('No workspace folder found.');
    return [];
  }
  // 假设读取第一个工作区文件夹中的 package.json
  const packageJsonPath = path.join(workspaceFolders[0].uri.fsPath, 'package.json');
  const data = readFileSync(packageJsonPath, 'utf8');
  const json = JSON.parse(data);
  return [...Object.keys(json.dependencies), ...Object.keys(json.devDependencies)];
}

export function formatImports(textEditor: vscode.TextEditor, edit: vscode.TextEditorEdit) {
  const dependencies = readDependency();
  const lineCount = textEditor.document.lineCount;
  let firstImportLine = -1;
  const importArray: Import[] = [];
  for (let i = 0; i < lineCount; i++) {
    // const line = textEditor.document.lineAt(i);
    // const match = line.text.match(/^import\s+{(.*)}\s+from\s+['"](.*)['"]/);
    // if (match) {
    //   const [_, imports, moduleName] = match;
    //   vscode.window.showInformationMessage('imports: ' + imports);
    // }
    const line = textEditor.document.lineAt(i);
    const lineText = line.text;
    // record first import line
    if (lineText.includes('import') && firstImportLine === -1) {
      firstImportLine = i;
    }

    if (lineText.includes('import') && lineText.includes('from')) {
      const range = new vscode.Range(new vscode.Position(i, 0), new vscode.Position(i + 1, 0));
      const importInfo = { text: line.text, range };
      importArray.push(importInfo);
    }

    if (lineText.includes('import') && !lineText.includes('from')) {
      const startPosition = new vscode.Position(i, 0);
      let text = line.text;
      for (let j = i + 1; j < lineCount; j++) {
        const currentLineText = textEditor.document.lineAt(j).text;
        text += currentLineText;
        if (currentLineText.includes('from')) {
          const endPosition = new vscode.Position(j + 1, 0);
          text = text.replace('\n', '').replace('\r', '');
          const importInfo = { text, range: new vscode.Range(startPosition, endPosition) };
          importArray.push(importInfo);
          break;
        }
      }
    }
  }
  importArray.sort((a, b) => {
    if (!isDependency(a.text, dependencies) && isDependency(b.text, dependencies)) {
      return 1;
    }
    if (isDependency(a.text, dependencies) && !isDependency(b.text, dependencies)) {
      return -1;
    }
    return 0;
  });
  for (let i = 0; i < importArray.length; i++) {
    edit.delete(importArray[i].range);
  }
  for (let i = 0; i < importArray.length; i++) {
    edit.insert(new vscode.Position(firstImportLine, 0), importArray[i].text + '\n');
  }
}

function isDependency(importText: string, dependencies: string[]) {
  return dependencies.some(dependency => importText.includes(dependency));
}
