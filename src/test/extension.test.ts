import * as assert from 'assert';
import * as vscode from 'vscode';

// import example from 'example.ts' -> 
// import * as example from 'example.ts' -> 
// import { assert } from 'example.ts' -> 
// import { assert as newAssert } from 'example.ts' -> 
// import { assert, vscode } from 'example.ts' -> import { assert } from 'example.ts'
// import { assert, vscode } from 'example.ts' -> import { vscode } from 'example.ts'
// import { assert as newAssert, vscode } from 'example.ts' -> import { assert as newAssert } from 'example.ts'
// import { assert as newAssert, vscode } from 'example.ts' -> import { vscode } from 'example.ts'

suite('Extension Test Suite', () => {
  vscode.window.showInformationMessage('Start all tests.');
  test('Simple default import', () => {
    const simpleDefaultImport = ``;
    assert.strictEqual(simpleDefaultImport, simpleDefaultImport);
  });

});
