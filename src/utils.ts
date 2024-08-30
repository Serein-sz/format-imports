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
  return [...Object.keys(json.dependencies ? json.dependencies : {}), ...Object.keys(json.devDependencies ? json.devDependencies : {})];
}
export function buildAllText(ranges: vscode.Range[], document: vscode.TextDocument) {
  let result = '';
  let left = new vscode.Range(new vscode.Position(0, 0), new vscode.Position(0, 0)),
    right = new vscode.Range(new vscode.Position(0, 0), new vscode.Position(0, 0));
  for (let i = 0; i < ranges.length; i++) {
    const range = ranges[i];
    right = range;
    if (i === ranges.length - 1) {
      left = right;
      const endLines = document.lineCount - 1;
      const endLine = document.lineAt(endLines).text;
      right = new vscode.Range(new vscode.Position(endLines, endLine.length), new vscode.Position(endLines, endLine.length));
    }
    const textRange = new vscode.Range(left.end, right.start);
    result += document.getText(textRange);
    left = range;
  }
  return result;
}

export function buildImportInfoArray(document: vscode.TextDocument): [number, Import[]] {
  const lineCount = document.lineCount;
  let firstImportLine = -1;
  const importArray: Import[] = [];
  for (let i = 0; i < lineCount; i++) {
    const line = document.lineAt(i);
    const lineText = line.text;
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
        const currentLineText = document.lineAt(j).text;
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
  return [firstImportLine, importArray];
}

export function sortImportArray(importArray: Import[], dependencies: string[]) {
  importArray.sort((a, b) => {
    if (!isDependency(a.text, dependencies) && isDependency(b.text, dependencies)) {
      return 1;
    }
    if (isDependency(a.text, dependencies) && !isDependency(b.text, dependencies)) {
      return -1;
    }
    return 0;
  });
}

export function processingImportText(importText: string, allText: string): string {
  const startIndex = importText.indexOf('{') !== -1 ? importText.indexOf('{') + 1 : importText.indexOf('import') + 6;
  const endIndex = importText.indexOf('{') !== -1 ? importText.lastIndexOf('}') : importText.lastIndexOf('from');
  const quotes = importText.slice(startIndex, endIndex).split(',')
    .map(item => item.trim())
    .map(processIncludeAsImportText)
    .filter(item => {
      let quote = item;
      if (item.includes('as')) {
        quote = item.split('as')[1].trim();
      }
      const regex = new RegExp(`(?<!\\.)\\b${quote}\\b[^a-zA-Z]*`);
      return regex.test(allText);
    });
  if (quotes.length === 0) {
    return '';
  }
  const fromPath = importText.slice(importText.lastIndexOf('from') + 4).trim();
  if (importText.indexOf('{') !== -1) {
    return `import { ${quotes.join(', ')} } from ${fromPath}`;
  } else {
    return `import ${quotes.join(', ')} from ${fromPath}`;
  }
}

export function processIncludeAsImportText(importText: string): string {
  if (!importText.includes('as')) {
    return importText;
  }
  return `${importText.split('as')[0].trim()} as ${importText.split('as')[1].trim()}`;
}

export function isDependency(importText: string, dependencies: string[]) {
  return dependencies.some(dependency => importText.includes(dependency));
}

export function removeAndInsertImports(edit: vscode.TextEditorEdit, firstImportLine: number, importArray: Import[], dependencies: string[]) {
  for (let i = 0; i < importArray.length; i++) {
    edit.delete(importArray[i].range);
  }
  for (let i = 0; i < importArray.length; i++) {
    if (importArray[i].text === '') {
      continue;
    }
    if (i > 0 && isDependency(importArray[i - 1].text, dependencies) && !isDependency(importArray[i].text, dependencies)) {
      edit.insert(new vscode.Position(firstImportLine, 0), '\n');
    }
    edit.insert(new vscode.Position(firstImportLine, 0), importArray[i].text + '\n');
  }
}
