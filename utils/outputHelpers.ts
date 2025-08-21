import { Output, OutputType, OutputConfig } from '../types/outputTypes';

// Helper function to create text output
export const printLine = (content: string, config?: OutputConfig): Output => ({
  type: OutputType.TEXT,
  content,
  config
});

// Helper function to create multi-line text output with different styling for each line
export const printMultiLine = (
  lines: Array<{ text: string; styleType?: string; className?: string }>,
  config?: OutputConfig
): Output => ({
  type: OutputType.MULTI_LINE,
  content: { lines },
  config
});

// Helper function to create success output
export const printSuccess = (content: string, config?: OutputConfig): Output => ({
  type: OutputType.SUCCESS,
  content,
  config: { styleType: 'textPrimary', ...config }
});

// Helper function to create error output
export const printError = (content: string, config?: OutputConfig): Output => ({
  type: OutputType.ERROR,
  content,
  config: { styleType: 'textError', ...config }
});

// Helper function to create warning output
export const printWarning = (content: string, config?: OutputConfig): Output => ({
  type: OutputType.WARNING,
  content,
  config: { styleType: 'textError', ...config }
});

// Helper function to create code output
export const printCode = (content: string, config?: OutputConfig): Output => ({
  type: OutputType.CODE,
  content,
  config
});

// Helper function to create list output
export const printList = (
  items: Array<{ content: string; type?: 'success' | 'warning' | 'error' | 'default'; styleType?: string; className?: string }>,
  config?: OutputConfig
): Output => ({
  type: OutputType.LIST,
  content: items,
  config
});

// Helper function to create table output
export const printTable = (
  data: { headers: string[]; rows: string[][] },
  config?: OutputConfig
): Output => ({
  type: OutputType.TABLE,
  content: data,
  config
});

// Helper function to create JSON output
export const printJson = (data: any, config?: OutputConfig): Output => ({
  type: OutputType.JSON,
  content: data,
  config
});

// Helper function to create markdown output
export const printMarkdown = (content: string, config?: OutputConfig): Output => ({
  type: OutputType.MARKDOWN,
  content,
  config
});

// Helper function to create custom output
export const printCustom = (content: React.ReactNode, config?: OutputConfig): Output => ({
  type: OutputType.CUSTOM,
  content: { content },
  config
});