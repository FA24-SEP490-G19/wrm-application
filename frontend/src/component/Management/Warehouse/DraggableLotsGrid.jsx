import React from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { GripVertical, Trash2 } from 'lucide-react';

const DraggableLotsGrid = ({ lots, onReorder, onRemove }) => {
    const handleDragEnd = (result) => {
        if (!result.destination) return;

        const items = Array.from(lots);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        onReorder(items);
    };

    return (
        <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="lots">
                {(provided) => (
                    <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="space-y-2"
                    >
                        {lots.map((lot, index) => (
                            <Draggable
                                key={index}
                                draggableId={`lot-${index}`}
                                index={index}
                            >
                                {(provided, snapshot) => (
                                    <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        className={`
                      bg-white rounded-lg border p-4
                      ${snapshot.isDragging ? 'shadow-lg ring-2 ring-indigo-500 ring-opacity-50' : ''}
                      transition-shadow duration-200
                    `}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div {...provided.dragHandleProps} className="cursor-grab">
                                                <GripVertical className="w-5 h-5 text-gray-400" />
                                            </div>

                                            <div className="flex-1 grid grid-cols-3 gap-4">
                                                <div>
                                                    <p className="text-sm font-medium text-gray-600">Mô tả</p>
                                                    <p className="text-sm text-gray-900">{lot.description}</p>
                                                </div>

                                                <div>
                                                    <p className="text-sm font-medium text-gray-600">Kích thước</p>
                                                    <p className="text-sm text-gray-900">{lot.size} m²</p>
                                                </div>

                                                <div>
                                                    <p className="text-sm font-medium text-gray-600">Giá</p>
                                                    <p className="text-sm text-gray-900">{lot.price}</p>
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => onRemove(index)}
                                                className="p-1 text-red-600 hover:text-red-800 rounded-full hover:bg-red-50 transition-colors"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </Draggable>
                        ))}
                        {provided.placeholder}
                    </div>
                )}
            </Droppable>
        </DragDropContext>
    );
};

export default DraggableLotsGrid;