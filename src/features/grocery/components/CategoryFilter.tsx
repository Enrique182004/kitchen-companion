import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useGroceryStore } from "../grocery.store";
import type { Category } from "@/types";

interface Props {
  categories: Category[];
}

export function CategoryFilter({ categories }: Props) {
  const selectedCategory = useGroceryStore((state) => state.selectedCategory);
  const setSelectedCategory = useGroceryStore(
    (state) => state.setSelectedCategory,
  );

  return (
    <ScrollArea className="w-full" orientation="horizontal">
      <div className="flex gap-2 pb-1">
        <Button
          size="sm"
          variant={selectedCategory === null ? "default" : "outline"}
          onClick={() => setSelectedCategory(null)}
          className="shrink-0"
        >
          All
        </Button>
        {categories.map((cat) => (
          <Button
            key={cat.id}
            size="sm"
            variant={selectedCategory === cat.id ? "default" : "outline"}
            onClick={() => setSelectedCategory(cat.id)}
            className="shrink-0"
          >
            {cat.name}
          </Button>
        ))}
      </div>
    </ScrollArea>
  );
}
