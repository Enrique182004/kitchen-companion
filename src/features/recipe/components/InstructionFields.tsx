import type { Control, UseFieldArrayReturn } from "react-hook-form";
import { useFieldArray } from "react-hook-form";
import { Plus, Trash2, GripVertical } from "lucide-react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { RecipeFormValues } from "../recipe.store";

interface StepProps {
  id: string;
  index: number;
  control: Control<RecipeFormValues>;
  canRemove: boolean;
  onRemove: () => void;
}

function SortableStep({ id, index, control, canRemove, onRemove }: StepProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
      }}
      className="flex items-center gap-2"
    >
      <button
        type="button"
        className="shrink-0 cursor-grab touch-none text-muted-foreground hover:text-foreground active:cursor-grabbing"
        {...attributes}
        {...listeners}
        aria-label="Drag to reorder step"
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
        {index + 1}
      </span>
      <Input
        {...control.register(`instructions.${index}.text` as const)}
        placeholder={`Step ${index + 1}`}
        className="flex-1"
      />
      <Button
        type="button"
        size="icon"
        variant="ghost"
        onClick={onRemove}
        disabled={!canRemove}
        aria-label="Remove step"
        className="h-9 w-9 shrink-0 text-destructive hover:text-destructive disabled:opacity-30"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}

interface Props {
  control: Control<RecipeFormValues>;
}

export function InstructionFields({ control }: Props) {
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "instructions",
  }) as UseFieldArrayReturn<RecipeFormValues, "instructions">;

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = fields.findIndex((f) => f.id === active.id);
      const newIndex = fields.findIndex((f) => f.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        move(oldIndex, newIndex);
      }
    }
  };

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">Steps</p>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={fields.map((f) => f.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {fields.map((field, i) => (
              <SortableStep
                key={field.id}
                id={field.id}
                index={i}
                control={control}
                canRemove={fields.length > 1}
                onRemove={() => remove(i)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => append({ text: "" })}
        className="w-full"
      >
        <Plus className="mr-1 h-4 w-4" />
        Add Step
      </Button>
    </div>
  );
}
