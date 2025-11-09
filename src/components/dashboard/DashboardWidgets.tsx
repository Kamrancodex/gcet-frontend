import React, { useState, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { motion } from "framer-motion";
import {
  GripVertical,
  X,
  Settings as SettingsIcon,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

export interface Widget {
  id: string;
  title: string;
  component: React.ComponentType<any>;
  size: "small" | "medium" | "large" | "full";
  removable?: boolean;
  configurable?: boolean;
  data?: any;
}

interface DashboardWidgetsProps {
  widgets: Widget[];
  onWidgetsChange?: (widgets: Widget[]) => void;
  className?: string;
}

interface SortableWidgetProps {
  widget: Widget;
  onRemove?: (id: string) => void;
  onConfigure?: (id: string) => void;
}

const SortableWidget: React.FC<SortableWidgetProps> = ({
  widget,
  onRemove,
  onConfigure,
}) => {
  const [showActions, setShowActions] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: widget.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(pointer: coarse)");
    const handleChange = () => {
      const isTouch = mediaQuery.matches;
      setIsTouchDevice(isTouch);
      if (isTouch) {
        setShowActions(true);
      } else {
        setShowActions(false);
      }
    };

    handleChange();
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const getSizeClasses = (size: string) => {
    switch (size) {
      case "small":
        return "col-span-1 row-span-1";
      case "medium":
        return "col-span-2 row-span-1";
      case "large":
        return "col-span-2 row-span-2";
      case "full":
        return "col-span-full row-span-1";
      default:
        return "col-span-1 row-span-1";
    }
  };

  const WidgetComponent = widget.component;
  const actionsVisible = showActions || isTouchDevice || isDragging;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${getSizeClasses(widget.size)} ${
        isDragging ? "z-50" : "z-0"
      }`}
    >
      <motion.div
        layout
        className={`bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 h-full relative group ${
          isDragging ? "shadow-lg ring-2 ring-blue-500 ring-opacity-50" : ""
        }`}
        onMouseEnter={() => !isTouchDevice && setShowActions(true)}
        onMouseLeave={() => !isTouchDevice && setShowActions(false)}
        onTouchStart={() => setShowActions(true)}
      >
        {/* Widget Header */}
        <div className="flex items-center justify-between gap-3 p-4 pb-2 sm:p-5 sm:pb-3">
          <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">
            {widget.title}
          </h3>

          <div
            className={`flex items-center gap-1 transition-opacity ${
              actionsVisible ? "opacity-100" : "opacity-0"
            } md:group-hover:opacity-100`}
          >
            {widget.configurable && onConfigure && (
              <button
                onClick={() => onConfigure(widget.id)}
                className="p-1 rounded hover:bg-gray-100"
                title="Configure widget"
              >
                <SettingsIcon className="w-4 h-4 text-gray-500" />
              </button>
            )}

            {widget.removable && onRemove && (
              <button
                onClick={() => onRemove(widget.id)}
                className="p-1 rounded hover:bg-gray-100"
                title="Remove widget"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            )}

            <button
              {...attributes}
              {...listeners}
              className="p-1 rounded hover:bg-gray-100 cursor-grab active:cursor-grabbing"
              title="Drag to reorder"
            >
              <GripVertical className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Widget Content */}
        <div className="px-4 pb-4 pt-0 sm:px-5 sm:pb-5 h-full">
          <WidgetComponent {...widget.data} />
        </div>
      </motion.div>
    </div>
  );
};

const DashboardWidgets: React.FC<DashboardWidgetsProps> = ({
  widgets: initialWidgets,
  onWidgetsChange,
  className = "",
}) => {
  const [widgets, setWidgets] = useState<Widget[]>(initialWidgets);
  const { user } = useAuth();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Load saved layout from localStorage
  useEffect(() => {
    if (user?.role) {
      const savedLayout = localStorage.getItem(`dashboard-layout-${user.role}`);
      if (savedLayout) {
        try {
          const parsedLayout = JSON.parse(savedLayout);
          // Merge saved order with current widgets
          const orderedWidgets = parsedLayout
            .map((id: string) => initialWidgets.find((w) => w.id === id))
            .filter(Boolean)
            .concat(initialWidgets.filter((w) => !parsedLayout.includes(w.id)));
          setWidgets(orderedWidgets);
        } catch (error) {
          console.error("Failed to parse saved layout:", error);
          setWidgets(initialWidgets);
        }
      }
    }
  }, [user?.role, initialWidgets]);

  // Save layout to localStorage when widgets change
  useEffect(() => {
    if (user?.role && widgets.length > 0) {
      const widgetIds = widgets.map((w) => w.id);
      localStorage.setItem(
        `dashboard-layout-${user.role}`,
        JSON.stringify(widgetIds)
      );
      onWidgetsChange?.(widgets);
    }
  }, [widgets, user?.role, onWidgetsChange]);

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setWidgets((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleRemoveWidget = (id: string) => {
    setWidgets((prev) => prev.filter((w) => w.id !== id));
  };

  const handleConfigureWidget = (id: string) => {
    console.log("Configure widget:", id);
    // Implement widget configuration logic
  };

  return (
    <div className={`w-full ${className}`}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={widgets} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 lg:gap-6 auto-rows-fr">
            {widgets.map((widget) => (
              <SortableWidget
                key={widget.id}
                widget={widget}
                onRemove={handleRemoveWidget}
                onConfigure={handleConfigureWidget}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {widgets.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <GripVertical className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No widgets</h3>
          <p className="text-gray-500">
            Add some widgets to customize your dashboard
          </p>
        </div>
      )}
    </div>
  );
};

export default DashboardWidgets;
