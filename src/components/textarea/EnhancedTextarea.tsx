import { useCallback, useState, useEffect, useRef } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { markdown } from '@codemirror/lang-markdown';
import { keymap } from '@codemirror/view';
import { useVersionHistory } from '@/hooks/use-version-history';
import { useAutoSave } from '@/hooks/use-auto-save';
import { markerHighlighting } from '@/extensions/codemirror/marker-highlighting';
import { VersionNav } from './VersionNav';
import './EnhancedTextarea.css';

interface EnhancedTextareaProps {
  contentId: string;
  initialValue?: string;
  externalValue?: string;
  onChange?: (value: string) => void;
  onEdit?: (value: string) => void;
  readOnly?: boolean;
  placeholder?: string;
}

export function EnhancedTextarea({
  contentId,
  initialValue = '',
  externalValue,
  onChange,
  onEdit,
  readOnly = false,
  placeholder = 'Start typing...'
}: EnhancedTextareaProps) {
  const [value, setValue] = useState(initialValue);
  const userEditedRef = useRef(false);
  const {
    currentVersion,
    versionCount,
    currentIndex,
    isViewingHistory,
    goBack,
    goForward,
    goToCurrent,
    saveManualVersion
  } = useVersionHistory(contentId);

  const { isSaving } = useAutoSave(contentId, value);

  // When viewing history, update the value to show historical content
  useEffect(() => {
    if (isViewingHistory && currentVersion) {
      setValue(currentVersion.content);
    }
  }, [isViewingHistory, currentVersion]);

  // Sync from externalValue when in controlled mode
  useEffect(() => {
    if (externalValue !== undefined && !isViewingHistory && !userEditedRef.current) {
      setValue(externalValue);
      userEditedRef.current = false;
    }
  }, [externalValue, isViewingHistory]);

  const handleChange = useCallback((newValue: string) => {
    // Only allow edits when not viewing history
    if (!isViewingHistory) {
      setValue(newValue);
      userEditedRef.current = true;
      onChange?.(newValue);
      onEdit?.(newValue);
    }
  }, [isViewingHistory, onChange, onEdit]);

  const handleManualSave = useCallback(async () => {
    await saveManualVersion(value);
    return true; // Prevent default browser save dialog
  }, [value, saveManualVersion]);

  // Custom keymap for Ctrl+S / Cmd+S
  const customKeymap = keymap.of([
    {
      key: 'Mod-s',
      preventDefault: true,
      run: () => {
        handleManualSave();
        return true;
      }
    }
  ]);

  return (
    <div className="enhanced-textarea">
      <VersionNav
        currentIndex={currentIndex}
        versionCount={versionCount}
        isViewingHistory={isViewingHistory}
        onBack={goBack}
        onForward={goForward}
        onReturnToCurrent={goToCurrent}
        isSaving={isSaving}
      />
      <div className="enhanced-textarea__editor">
        <CodeMirror
          value={value}
          onChange={handleChange}
          readOnly={isViewingHistory || readOnly}
          placeholder={placeholder}
          basicSetup={{
            lineNumbers: false,
            foldGutter: true,
            highlightActiveLine: true,
          }}
          extensions={[
            markdown(),
            customKeymap,
            markerHighlighting,
          ]}
          theme="dark"
          height="100%"
        />
      </div>
    </div>
  );
}
