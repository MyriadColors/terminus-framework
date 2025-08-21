import React from 'react';

// Output types for the declarative system
export enum OutputType {
  TEXT = 'text',
  SUCCESS = 'success',
  ERROR = 'error',
  WARNING = 'warning',
  CODE = 'code',
  LIST = 'list',
  TABLE = 'table',
  JSON = 'json',
  MARKDOWN = 'markdown',
  CUSTOM = 'custom',
  MULTI_LINE = 'multi_line'
}

// Configuration types for different output types
interface BaseOutputConfig {
  className?: string;
}

interface TextOutputConfig extends BaseOutputConfig {
  styleType?: 'textPrimary' | 'textSecondary' | 'textSuccess' | 'textError' | 'textWarning' | 'textTertiary' | 'textFaded';
}

interface ListOutputConfig extends BaseOutputConfig {
  ordered?: boolean;
  itemStyleType?: string;
  itemClassName?: string;
}

interface TableOutputConfig extends BaseOutputConfig {
  headerStyleType?: string;
  rowStyleType?: string;
  cellStyleType?: string;
}

interface JsonOutputConfig extends BaseOutputConfig {
  pretty?: boolean;
  indentSize?: number;
}

// Content types for different output types
export type TextContent = string;

export interface MultiLineContent {
  lines: Array<{
    text: string;
    styleType?: 'textPrimary' | 'textSecondary' | 'textSuccess' | 'textError' | 'textWarning' | 'textTertiary' | 'textFaded';
    className?: string;
  }>;
}

export interface ListItem {
  content: string;
  type?: 'success' | 'warning' | 'error' | 'default';
  styleType?: string;
  className?: string;
  // For complex items with multiple styled parts
  parts?: Array<{ text: string; styleType?: string; className?: string }>;
}

export type ListContent = ListItem[];

export interface TableContent {
  headers: string[];
  rows: string[][];
}

export type JsonContent = any;

export interface CustomContent {
  content: React.ReactNode;
}

// Union of all content types
export type OutputContent = 
  | TextContent
  | MultiLineContent
  | ListContent
  | TableContent
  | JsonContent
  | CustomContent
  | React.ReactNode; // For backward compatibility

// Union of all config types
export type OutputConfig = 
  | TextOutputConfig
  | ListOutputConfig
  | TableOutputConfig
  | JsonOutputConfig
  | BaseOutputConfig;

export interface Output {
  type: OutputType;
  content: OutputContent;
  config?: OutputConfig;
}

// Type guard for checking if output is an Output object
export function isOutputObject(output: any): output is Output {
  return output && typeof output === 'object' && 'type' in output && 'content' in output;
}