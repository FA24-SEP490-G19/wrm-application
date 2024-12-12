import React, { useState } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const ResponsiveGridLayout = WidthProvider(Responsive);

const ResizableLotGrid = ({ lots, onRemove }) => {
    const generateLayout = () => {
        return lots.map((lot, i) => ({
            i: i.toString(),
            x: (i * 2) % 12,
            y: Math.floor(i / 6) * 4,
            w: 2,
            h: 2,
            minW: 2,
            minH: 2
        }));
    };

    const [layouts, setLayouts] = useState({ lg: generateLayout() });

    const handleLayoutChange = (layout, layouts) => {
        setLayouts(layouts);
    };

    const getRandomPastelColor = () => {
        const hue = Math.floor(Math.random() * 360);
        return `hsl(${hue}, 70%, 90%)`;
    };

    return (
        <ResponsiveGridLayout
            className="layout"
            layouts={layouts}
            breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
            cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
            rowHeight={60}
            onLayoutChange={handleLayoutChange}
            isResizable={true}
            isDraggable={true}
            margin={[12, 12]}
        >
            {lots.map((lot, index) => (
                <div
                    key={index}
                    className="rounded-xl overflow-hidden transition-shadow hover:shadow-lg"
                    style={{
                        background: getRandomPastelColor(),
                        cursor: 'move'
                    }}
                >
                    <div className="p-4 h-full flex flex-col">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="font-medium text-gray-800 truncate">
                                {lot.description}
                            </h3>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onRemove(index);
                                }}
                                className="p-1 text-red-600 hover:text-red-800 rounded-full hover:bg-red-50"
                            >
                                <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>

                        <div className="space-y-1 text-sm text-gray-600">
                            <p>Kích thước: {lot.size} m²</p>
                            <p>Giá: {lot.price}</p>
                        </div>

                        <div className="mt-auto pt-2 text-xs text-gray-500">
                            Kéo để di chuyển • Kéo góc để thay đổi kích thước
                        </div>
                    </div>
                </div>
            ))}
        </ResponsiveGridLayout>
    );
};

export default ResizableLotGrid;