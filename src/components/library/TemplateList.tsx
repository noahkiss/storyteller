import { useState } from 'react';
import { useTemplates, useCreateTemplate, useDeleteTemplate } from '@/hooks/use-templates';
import { Template, TemplateType } from '@/types';
import './TemplateList.css';

const TEMPLATE_TYPES: { value: TemplateType; label: string }[] = [
  { value: 'character', label: 'Character' },
  { value: 'setting', label: 'Setting' },
  { value: 'theme', label: 'Theme' },
  { value: 'outline', label: 'Outline' },
  { value: 'ai_config', label: 'AI Config' }
];

export function TemplateList() {
  const { data: templates, isLoading } = useTemplates();
  const createTemplate = useCreateTemplate();
  const deleteTemplate = useDeleteTemplate();
  const [showNewTemplateInput, setShowNewTemplateInput] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateType, setNewTemplateType] = useState<TemplateType>('character');

  const handleCreate = async () => {
    if (!newTemplateName.trim()) return;
    await createTemplate.mutateAsync({
      type: newTemplateType,
      name: newTemplateName.trim()
    });
    setNewTemplateName('');
    setShowNewTemplateInput(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this template?')) {
      try {
        await deleteTemplate.mutateAsync(id);
      } catch (error) {
        alert(error instanceof Error ? error.message : 'Failed to delete');
      }
    }
  };

  const handleLoadTemplate = (id: string) => {
    // Signal to load this template into the textarea
    window.dispatchEvent(new CustomEvent('load-content', {
      detail: { contentId: `template-${id}` }
    }));
  };

  // Group templates by type
  const groupedTemplates = templates?.reduce((groups, template) => {
    if (!groups[template.type]) {
      groups[template.type] = [];
    }
    groups[template.type].push(template);
    return groups;
  }, {} as Record<TemplateType, Template[]>) || {} as Record<TemplateType, Template[]>;

  const renderTemplateCard = (template: Template) => {
    return (
      <div key={template.id} className="template-card">
        <div className="template-card__header" onClick={() => handleLoadTemplate(template.id)}>
          <h3 className="template-card__name">{template.name}</h3>
          {template.is_builtin && (
            <span className="template-card__builtin-badge">Built-in</span>
          )}
        </div>
        {!template.is_builtin && (
          <div className="template-card__actions">
            <button
              className="template-card__delete-btn"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(template.id);
              }}
            >
              Delete
            </button>
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return <div className="template-list__loading">Loading templates...</div>;
  }

  return (
    <div className="template-list">
      <div className="template-list__header">
        <h2 className="template-list__title">Templates</h2>
        {!showNewTemplateInput ? (
          <button
            className="template-list__new-btn"
            onClick={() => setShowNewTemplateInput(true)}
          >
            + New Template
          </button>
        ) : (
          <div className="template-list__new-input">
            <select
              value={newTemplateType}
              onChange={(e) => setNewTemplateType(e.target.value as TemplateType)}
              className="template-list__type-select"
            >
              {TEMPLATE_TYPES.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Template name..."
              value={newTemplateName}
              onChange={(e) => setNewTemplateName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreate();
                if (e.key === 'Escape') {
                  setShowNewTemplateInput(false);
                  setNewTemplateName('');
                }
              }}
              autoFocus
            />
            <button onClick={handleCreate} disabled={!newTemplateName.trim()}>
              Create
            </button>
            <button onClick={() => {
              setShowNewTemplateInput(false);
              setNewTemplateName('');
            }}>
              Cancel
            </button>
          </div>
        )}
      </div>

      <div className="template-list__groups">
        {TEMPLATE_TYPES.map(({ value, label }) => {
          const groupTemplates = groupedTemplates[value] || [];
          if (groupTemplates.length === 0) return null;

          return (
            <section key={value} className="template-group">
              <h3 className="template-group__title">{label} Templates</h3>
              <div className="template-group__list">
                {groupTemplates.map(renderTemplateCard)}
              </div>
            </section>
          );
        })}

        {Object.keys(groupedTemplates).length === 0 && (
          <div className="template-list__empty">
            No templates yet. Click "New Template" to create one.
          </div>
        )}
      </div>
    </div>
  );
}
