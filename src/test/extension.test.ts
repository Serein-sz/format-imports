import * as assert from 'assert';
import * as vscode from 'vscode';
import { processingImportText } from '../utils';

suite('Extension Test Suite', () => {
  vscode.window.showInformationMessage('Start all tests.');
  test('import-1', () => {
    const example = "import {   getCenterPositionListConfig,   getRightComponentConfigListConfig } from '@/components/common/2D/buildConfigData'";
    const allText = `import {   getCenterPositionListConfig,   getRightComponentConfigListConfig } from '@/components/common/2D/buildConfigData'
    getCenterPositionListConfig()
    getRightComponentConfigListConfig()
`;
    const result = "import { getCenterPositionListConfig, getRightComponentConfigListConfig } from '@/components/common/2D/buildConfigData'";
    assert.strictEqual(result, processingImportText(example, allText));
  });

  test('import-2', () => {
    const example = "import {   getCenterPositionListConfig,   getRightComponentConfigListConfig } from '@/components/common/2D/buildConfigData'";
    const allText = `import {   getCenterPositionListConfig,   getRightComponentConfigListConfig } from '@/components/common/2D/buildConfigData'
    getCenterPositionListConfig()
`;
    const result = "import { getCenterPositionListConfig } from '@/components/common/2D/buildConfigData'";
    assert.strictEqual(result, processingImportText(example, allText));
  });

  test('import-3', () => {
    const example = "import {   getCenterPositionListConfig,   getRightComponentConfigListConfig } from '@/components/common/2D/buildConfigData'";
    const allText = `import {   getCenterPositionListConfig,   getRightComponentConfigListConfig } from '@/components/common/2D/buildConfigData'
`;
    const result = "";
    assert.strictEqual(result, processingImportText(example, allText));
  });

  test('As import-1', () => {
    const example = "import {   getCenterPositionListConfig,   getRightComponentConfigListConfig as get } from '@/components/common/2D/buildConfigData'";
    const allText = `import {   getCenterPositionListConfig,   getRightComponentConfigListConfig as get } from '@/components/common/2D/buildConfigData'
    getCenterPositionListConfig()
`;
    const result = "import { getCenterPositionListConfig } from '@/components/common/2D/buildConfigData'";
    assert.strictEqual(result, processingImportText(example, allText));
  });

  test('As import-2', () => {
    const example = "import {   getCenterPositionListConfig,   getRightComponentConfigListConfig as get } from '@/components/common/2D/buildConfigData'";
    const allText = `import {   getCenterPositionListConfig,   getRightComponentConfigListConfig as get } from '@/components/common/2D/buildConfigData'
    get()
`;
    const result = "import { getRightComponentConfigListConfig as get } from '@/components/common/2D/buildConfigData'";
    assert.strictEqual(result, processingImportText(example, allText));
  });

  test('As import-3', () => {
    const example = "import {   getCenterPositionListConfig,   getRightComponentConfigListConfig as get } from '@/components/common/2D/buildConfigData'";
    const allText = `import {   getCenterPositionListConfig,   getRightComponentConfigListConfig as get } from '@/components/common/2D/buildConfigData'
    getCenterPositionListConfig()
`;
    const result = "import { getCenterPositionListConfig, getRightComponentConfigListConfig as get } from '@/components/common/2D/buildConfigData'";
    assert.strictEqual(result, processingImportText(example, allText));
  });

  test('As import-4', () => {
    const example = "import {   getCenterPositionListConfig,   getRightComponentConfigListConfig as get } from '@/components/common/2D/buildConfigData'";
    const allText = `import {   getCenterPositionListConfig,   getRightComponentConfigListConfig as get } from '@/components/common/2D/buildConfigData'
`;
    const result = "";
    assert.strictEqual(result, processingImportText(example, allText));
  });

});
