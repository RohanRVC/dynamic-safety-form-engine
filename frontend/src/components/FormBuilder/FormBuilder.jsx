import { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  GripVertical,
  Trash2,
  Type,
  Hash,
  List,
  Circle,
  Video,
  Calendar,
  AlignLeft,
  Save,
  Eye,
  EyeOff,
  Copy,
  MoreHorizontal,
  Settings2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useFormStore } from "@/store/formStore";
import { formApi } from "@/services/api";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

const FIELD_TYPES = [
  { type: "text", icon: Type, label: "Text" },
  { type: "textarea", icon: AlignLeft, label: "Text Area" },
  { type: "number", icon: Hash, label: "Number" },
  { type: "select", icon: List, label: "Dropdown" },
  { type: "radio_group", icon: Circle, label: "Radio Group" },
  { type: "video_upload", icon: Video, label: "Video Upload" },
  { type: "date", icon: Calendar, label: "Date" },
];

const fieldTypeIcon = (type) => {
  const found = FIELD_TYPES.find((ft) => ft.type === type);
  return found ? found.icon : Type;
};

export default function FormBuilder({ editId = null }) {
  const {
    formName,
    setFormName,
    fields,
    addField,
    removeField,
    reorderFields,
    selectField,
    selectedFieldId,
    previewMode,
    togglePreview,
    getFormPayload,
  } = useFormStore();

  const [saving, setSaving] = useState(false);
  const [showAddField, setShowAddField] = useState(false);

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    reorderFields(result.source.index, result.destination.index);
  };

  const handleSave = async () => {
    if (fields.length === 0) {
      toast.error("Add at least one field before saving");
      return;
    }
    setSaving(true);
    try {
      const payload = getFormPayload();
      if (editId) {
        await formApi.update(editId, payload);
        toast.success("Form template updated!");
      } else {
        await formApi.create(payload);
        toast.success("Form template saved successfully!");
      }
    } catch (err) {
      toast.error(err.message || "Failed to save form");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b bg-background/50 backdrop-blur-sm space-y-3">
        <div className="flex items-center gap-3 flex-wrap">
          <h2 className="text-lg font-semibold">Form Builder</h2>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted">
            <FileTextIcon className="h-4 w-4 text-muted-foreground" />
            <Input
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              className="h-6 border-0 bg-transparent p-0 text-sm font-medium focus-visible:ring-0 w-48"
              placeholder="Form name"
            />
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={togglePreview}>
            {previewMode ? <EyeOff className="h-4 w-4 mr-1" /> : <Eye className="h-4 w-4 mr-1" />}
            {previewMode ? "Edit" : "Preview"}
          </Button>
          <Button size="sm" onClick={handleSave} disabled={saving} className="bg-primary">
            <Save className="h-4 w-4 mr-1" />
            {saving ? "Saving..." : "Save Template"}
          </Button>
        </div>
      </div>

      {/* Field Type Palette */}
      <div className="p-4 border-b">
        <div className="flex items-center gap-2 mb-3">
          <Plus className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Add Field</span>
          <span className="text-xs text-muted-foreground">Add cards</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {FIELD_TYPES.map((ft) => (
            <Button
              key={ft.type}
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => {
                const id = addField(ft.type);
                selectField(id);
              }}
            >
              <ft.icon className="h-3.5 w-3.5" />
              {ft.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Field List */}
      <div className="flex-1 overflow-auto p-4">
        {fields.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
            <Plus className="h-8 w-8 mb-2 opacity-30" />
            <p className="text-sm">Click a field type above to get started</p>
          </div>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="fields">
              {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-2">
                  <AnimatePresence>
                    {fields.map((field, idx) => {
                      const Icon = fieldTypeIcon(field.type);
                      return (
                        <Draggable key={field.id} draggableId={field.id} index={idx}>
                          {(provided, snapshot) => (
                            <motion.div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, x: -20 }}
                              className={cn(
                                "flex items-center gap-3 p-3 rounded-xl border bg-card transition-all cursor-pointer",
                                snapshot.isDragging && "shadow-xl ring-2 ring-primary/30",
                                selectedFieldId === field.id && "ring-2 ring-primary border-primary"
                              )}
                              onClick={() => selectField(field.id)}
                            >
                              <div {...provided.dragHandleProps} className="cursor-grab active:cursor-grabbing">
                                <GripVertical className="h-4 w-4 text-muted-foreground" />
                              </div>
                              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                <Icon className="h-4 w-4 text-primary" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{field.label}</p>
                                <p className="text-xs text-muted-foreground capitalize">
                                  {field.type.replace("_", " ")}
                                  {field.required && " • Required"}
                                </p>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 opacity-0 group-hover:opacity-100 hover:opacity-100 text-destructive"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeField(field.id);
                                }}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </motion.div>
                          )}
                        </Draggable>
                      );
                    })}
                  </AnimatePresence>
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}
      </div>

      {/* Sticky Save at bottom so it's always visible */}
      <div className="p-4 border-t bg-background/80 flex-shrink-0">
        <Button className="w-full" onClick={handleSave} disabled={saving || fields.length === 0}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? "Saving..." : "Save Template"}
        </Button>
        {fields.length === 0 && (
          <p className="text-xs text-muted-foreground text-center mt-2">Add at least one field to save</p>
        )}
      </div>
    </div>
  );
}

function FileTextIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
    </svg>
  );
}
