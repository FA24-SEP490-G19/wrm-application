import React, { useState, useEffect } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import { X } from 'lucide-react';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const ResponsiveGridLayout = WidthProvider(Responsive);

const ResizableLotGrid = ({ lots, onRemove, onChange }) => {
    const calculateGridDimensions = (size) => {
        // Convert size to grid units (1 grid unit = 1m²)
        const area = parseFloat(size);
        const width = Math.max(2, Math.round(Math.sqrt(area)));
        const height = Math.max(2, Math.ceil(area / width));
        return { width, height };
    };

    const generateLayout = (lotsData) => {
        return lotsData.map((lot, i) => {
            const { width, height } = calculateGridDimensions(lot.size);
            return {
                i: i.toString(),
                x: (i * 2) % 12,
                y: Math.floor(i / 6) * 4,
                w: width,
                h: height,
                minW: 2,
                minH: 2
            };
        });
    };

    const [layouts, setLayouts] = useState({ lg: generateLayout(lots) });

    useEffect(() => {
        setLayouts({ lg: generateLayout(lots) });
    }, [lots.length]); // Regenerate layout when lots array changes

    const handleLayoutChange = (currentLayout) => {
        const updatedLots = lots.map((lot, index) => {
            const layoutItem = currentLayout.find(item => item.i === index.toString());
            if (layoutItem) {
                // Direct size calculation: width * height = area in m²
                const newSize = layoutItem.w * layoutItem.h;
                return {
                    ...lot,
                    size: newSize.toFixed(2)
                };
            }
            return lot;
        });

        onChange(updatedLots);
    };

    // Prevent event bubbling and ensure removal works consistently
    const handleRemove = (index, event) => {
        event.preventDefault();
        event.stopPropagation();
        onRemove(index);
    };

    return (
        <ResponsiveGridLayout
            className="layout"
            layouts={layouts}
            breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
            cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
            rowHeight={50}
            onLayoutChange={handleLayoutChange}
            isResizable={true}
            isDraggable={true}
            margin={[10, 10]}
            preventCollision={true}
        >
            {lots.map((lot, index) => (
                <div
                    key={index}
                    className="rounded-xl border border-gray-200 bg-white shadow-sm"
                >
                    <div className="p-4 h-full flex flex-col relative">
                        <div
                            className="absolute top-2 right-2 z-50"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                type="button"
                                onClick={(e) => handleRemove(index, e)}
                                className="p-1 bg-red-100 text-red-600 hover:bg-red-200 rounded-lg"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="mt-4">
                            <h3 className="font-medium text-gray-800 truncate">
                                {lot.description}
                            </h3>

                            <div className="mt-2 space-y-1 text-sm text-gray-600">
                                <p>Kích thước: {lot.size} m²</p>
                                <p>Giá: {lot.price}</p>
                            </div>

                            <div className="mt-4 text-xs text-gray-500">
                                Kéo để di chuyển • Kéo góc để thay đổi kích thước
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </ResponsiveGridLayout>
    );
};

export default ResizableLotGrid;