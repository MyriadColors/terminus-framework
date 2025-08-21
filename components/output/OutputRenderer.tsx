import React from 'react';
import { Output, isOutputObject } from '../../types';
import { OutputType } from '../../types/outputTypes';
import { ThemeStyle } from '../../styles/themes';

interface OutputRendererProps {
  output: Output | React.ReactNode;
  theme: ThemeStyle;
}

const OutputRenderer: React.FC<OutputRendererProps> = ({ output, theme }) => {
  // Handle legacy React nodes
  if (!isOutputObject(output)) {
    return <>{output}</>;
  }

  const { type, content, config = {} } = output;

  // Get the appropriate theme class based on styleType or default for the type
  const getThemeClass = (styleType?: string, defaultClass?: string): string => {
    if (styleType && (theme as any)[styleType]) {
      return (theme as any)[styleType];
    }
    return defaultClass || '';
  };

  switch (type) {
    case OutputType.TEXT:
      const textConfig = config as { styleType?: string; className?: string };
      const textClass = `${getThemeClass(textConfig.styleType, theme.textPrimary)} ${textConfig.className || ''}`.trim();
      return <p className={textClass}>{content as string}</p>;

    case OutputType.MULTI_LINE:
      const multiLineContent = content as { lines: Array<{ text: string; styleType?: string; className?: string }> };
      return (
        <div>
          {multiLineContent.lines.map((line, index) => {
            const lineClass = `${getThemeClass(line.styleType, theme.textPrimary)} ${line.className || ''}`.trim();
            return <p key={index} className={lineClass}>{line.text}</p>;
          })}
        </div>
      );

    case OutputType.SUCCESS:
      const successConfig = config as { styleType?: string; className?: string };
      const successClass = `${getThemeClass(successConfig.styleType, theme.textPrimary)} ${successConfig.className || ''}`.trim();
      return <p className={successClass}>{content as string}</p>;

    case OutputType.ERROR:
      const errorConfig = config as { styleType?: string; className?: string };
      const errorClass = `${getThemeClass(errorConfig.styleType, theme.textError)} ${errorConfig.className || ''}`.trim();
      return <p className={errorClass}>{content as string}</p>;

    case OutputType.WARNING:
      const warningConfig = config as { styleType?: string; className?: string };
      const warningClass = `${getThemeClass(warningConfig.styleType, theme.textError)} ${warningConfig.className || ''}`.trim();
      return <p className={warningClass}>{content as string}</p>;

    case OutputType.CODE:
      const codeConfig = config as { styleType?: string; className?: string };
      const codeClass = `${getThemeClass(codeConfig.styleType, theme.textPrimary)} ${codeConfig.className || ''}`.trim();
      return <pre className={codeClass}>{content as string}</pre>;

    case OutputType.LIST:
      const listConfig = config as { ordered?: boolean; itemStyleType?: string; itemClassName?: string; className?: string };
      const ListTag = listConfig.ordered ? 'ol' : 'ul';
      const listClass = `${listConfig.className || ''}`.trim();
      
      return (
        <ListTag className={listClass}>
          {(content as Array<{ content: string; type?: string; styleType?: string; className?: string; parts?: Array<{ text: string; styleType?: string; className?: string }> }>).map((item, index) => {
            const itemClass = `${getThemeClass(item.styleType, '')} ${item.className || ''}`.trim();
            
            // If the item has parts, render them with individual styling
            if (item.parts && item.parts.length > 0) {
              return (
                <li key={index} className={itemClass}>
                  {item.parts.map((part, partIndex) => {
                    const partClass = `${getThemeClass(part.styleType, theme.textPrimary)} ${part.className || ''}`.trim();
                    return <span key={partIndex} className={partClass}>{part.text}</span>;
                  })}
                </li>
              );
            }
            
            // Otherwise, render the content as a simple string
            return (
              <li key={index} className={itemClass}>
                {item.content}
              </li>
            );
          })}
        </ListTag>
      );

    case OutputType.TABLE:
      const tableConfig = config as { headerStyleType?: string; rowStyleType?: string; cellStyleType?: string; className?: string };
      const tableContent = content as { headers: string[]; rows: string[][] };
      
      const tableClass = `${tableConfig.className || ''}`.trim();
      const headerClass = `${getThemeClass(tableConfig.headerStyleType, theme.textSecondary)} ${tableConfig.cellStyleType || ''}`.trim();
      const cellClass = `${getThemeClass(tableConfig.cellStyleType, '')}`.trim();
      
      return (
        <table className={tableClass}>
          <thead>
            <tr>
              {tableContent.headers.map((header, index) => (
                <th key={index} className={headerClass}>
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableContent.rows.map((row, rowIndex) => (
              <tr key={rowIndex} className={getThemeClass(tableConfig.rowStyleType, '')}>
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} className={cellClass}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      );

    case OutputType.JSON:
      const jsonConfig = config as { pretty?: boolean; indentSize?: number; className?: string };
      const jsonString = jsonConfig.pretty 
        ? JSON.stringify(content, null, jsonConfig.indentSize || 2)
        : JSON.stringify(content);
      
      const jsonClass = `${getThemeClass(undefined, theme.textPrimary)} ${jsonConfig.className || ''}`.trim();
      return <pre className={jsonClass}>{jsonString}</pre>;

    case OutputType.MARKDOWN:
      const markdownConfig = config as { styleType?: string; className?: string };
      const markdownClass = `${getThemeClass(markdownConfig.styleType, theme.textPrimary)} ${markdownConfig.className || ''}`.trim();
      return <div className={markdownClass}>{content as string}</div>;

    case OutputType.CUSTOM:
      // For custom content, just render the React node directly
      return <>{(content as { content: React.ReactNode }).content}</>;

    default:
      // Fallback for unknown types
      return <p className={theme.textPrimary}>{String(content)}</p>;
  }
};

export default OutputRenderer;