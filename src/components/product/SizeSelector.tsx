'use client';

interface SizeSelectorProps {
  sizes: string[];
  stock: Record<string, number>;
  selected: string | null;
  onSelect: (size: string) => void;
}

export default function SizeSelector({
  sizes,
  stock,
  selected,
  onSelect,
}: SizeSelectorProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">Select Size</span>
        <button className="text-xs text-blue-600 hover:underline">Size Chart</button>
      </div>
      <div className="flex flex-wrap gap-2">
        {sizes.map((size) => {
          const isSelected = selected === size;
          return (
            <button
              key={size}
              onClick={() => onSelect(size)}
              className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all duration-150 ${
                isSelected
                  ? 'border-blue-600 bg-blue-600 text-white shadow-sm'
                  : 'border-gray-200 text-gray-700 hover:border-blue-400 hover:text-blue-600'
              }`}
            >
              {size}
            </button>
          );
        })}
      </div>
    </div>
  );
}
