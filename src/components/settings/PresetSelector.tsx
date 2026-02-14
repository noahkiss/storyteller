import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSettingsStore } from '@/stores/settings-store';
import { getDatabase } from '@/services/db';
import type { Preset } from '@/types';
import './PresetSelector.css';

/**
 * Preset selector with built-in and user-created presets
 * Allows loading, saving, and deleting presets
 */
export function PresetSelector() {
  const { generationParams, updateGenerationParams } = useSettingsStore();
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [newPresetName, setNewPresetName] = useState('');

  // Query presets from database
  const { data: presets = [] } = useQuery({
    queryKey: ['presets'],
    queryFn: async (): Promise<Preset[]> => {
      const db = await getDatabase();
      if (!db) return [];

      const results: Preset[] = [];
      db.exec({
        sql: 'SELECT * FROM presets ORDER BY is_builtin DESC, name ASC',
        callback: (row: unknown[]) => {
          results.push({
            id: row[0] as number,
            name: row[1] as string,
            temperature: row[2] as number,
            max_tokens: row[3] as number,
            top_p: row[4] as number,
            frequency_penalty: row[5] as number,
            presence_penalty: row[6] as number,
            is_builtin: (row[7] as number) === 1,
          });
        },
      });

      return results;
    },
  });

  // Mutation to save new preset
  const savePreset = useMutation({
    mutationFn: async (name: string) => {
      const db = await getDatabase();
      if (!db) throw new Error('Database not initialized');

      db.exec({
        sql: `
          INSERT INTO presets (name, temperature, max_tokens, top_p, frequency_penalty, presence_penalty, is_builtin)
          VALUES (?, ?, ?, ?, ?, ?, 0)
        `,
        bind: [
          name,
          generationParams.temperature,
          generationParams.maxTokens,
          generationParams.topP,
          generationParams.frequencyPenalty,
          generationParams.presencePenalty,
        ],
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['presets'] });
      setIsCreating(false);
      setNewPresetName('');
    },
  });

  // Mutation to delete preset
  const deletePreset = useMutation({
    mutationFn: async (id: number) => {
      const db = await getDatabase();
      if (!db) throw new Error('Database not initialized');

      db.exec({
        sql: 'DELETE FROM presets WHERE id = ? AND is_builtin = 0',
        bind: [id],
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['presets'] });
    },
  });

  const handleLoadPreset = (preset: Preset) => {
    updateGenerationParams({
      temperature: preset.temperature,
      maxTokens: preset.max_tokens,
      topP: preset.top_p,
      frequencyPenalty: preset.frequency_penalty,
      presencePenalty: preset.presence_penalty,
    });
  };

  const handleSavePreset = () => {
    if (newPresetName.trim()) {
      savePreset.mutate(newPresetName.trim());
    }
  };

  return (
    <div className="preset-selector">
      <div className="preset-header">
        <label>Presets</label>
        <button
          className="btn-text"
          onClick={() => setIsCreating(!isCreating)}
        >
          {isCreating ? 'Cancel' : '+ New Preset'}
        </button>
      </div>

      {isCreating && (
        <div className="preset-create">
          <input
            type="text"
            value={newPresetName}
            onChange={(e) => setNewPresetName(e.target.value)}
            placeholder="Preset name"
            onKeyDown={(e) => e.key === 'Enter' && handleSavePreset()}
          />
          <button className="btn-primary" onClick={handleSavePreset}>
            Save
          </button>
        </div>
      )}

      <div className="preset-list">
        {presets.map((preset) => (
          <div key={preset.id} className="preset-item">
            <button
              className="preset-name"
              onClick={() => handleLoadPreset(preset)}
            >
              {preset.name}
            </button>
            {!preset.is_builtin && (
              <button
                className="preset-delete"
                onClick={() => deletePreset.mutate(preset.id)}
              >
                ×
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
