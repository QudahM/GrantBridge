import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { SlidersHorizontal, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface FilterOptions {
  amountMin: number;
  amountMax: number;
  deadlineRange: "all" | "week" | "month" | "3months" | "6months";
  eligibilityCriteria: string[];
  difficulty: string[];
}

interface AdvancedFiltersProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  availableEligibility: string[];
}

export const AdvancedFilters = ({
  filters,
  onFiltersChange,
  availableEligibility,
}: AdvancedFiltersProps) => {
  const [localFilters, setLocalFilters] = useState<FilterOptions>(filters);
  const [isOpen, setIsOpen] = useState(false);

  const handleApply = () => {
    onFiltersChange(localFilters);
    setIsOpen(false);
  };

  const handleReset = () => {
    const defaultFilters: FilterOptions = {
      amountMin: 0,
      amountMax: 100000,
      deadlineRange: "all",
      eligibilityCriteria: [],
      difficulty: [],
    };
    setLocalFilters(defaultFilters);
    onFiltersChange(defaultFilters);
  };

  const toggleEligibility = (criterion: string) => {
    setLocalFilters((prev) => ({
      ...prev,
      eligibilityCriteria: prev.eligibilityCriteria.includes(criterion)
        ? prev.eligibilityCriteria.filter((c) => c !== criterion)
        : [...prev.eligibilityCriteria, criterion],
    }));
  };

  const toggleDifficulty = (level: string) => {
    setLocalFilters((prev) => ({
      ...prev,
      difficulty: prev.difficulty.includes(level)
        ? prev.difficulty.filter((d) => d !== level)
        : [...prev.difficulty, level],
    }));
  };

  const activeFilterCount =
    (filters.amountMin > 0 || filters.amountMax < 100000 ? 1 : 0) +
    (filters.deadlineRange !== "all" ? 1 : 0) +
    (filters.eligibilityCriteria.length > 0 ? 1 : 0) +
    (filters.difficulty.length > 0 ? 1 : 0);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="gap-2 relative">
          <SlidersHorizontal size={16} />
          Advanced Filters
          {activeFilterCount > 0 && (
            <Badge
              variant="secondary"
              className="ml-1 h-5 w-5 rounded-full p-0 flex items-center justify-center"
            >
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Advanced Filters</SheetTitle>
          <SheetDescription>
            Refine your grant search with detailed criteria
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 py-6">
          {/* Amount Range */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Amount Range</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amountMin" className="text-sm text-muted-foreground">
                  Minimum ($)
                </Label>
                <Input
                  id="amountMin"
                  type="number"
                  min="0"
                  step="1000"
                  value={localFilters.amountMin}
                  onChange={(e) =>
                    setLocalFilters((prev) => ({
                      ...prev,
                      amountMin: parseInt(e.target.value) || 0,
                    }))
                  }
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amountMax" className="text-sm text-muted-foreground">
                  Maximum ($)
                </Label>
                <Input
                  id="amountMax"
                  type="number"
                  min="0"
                  step="1000"
                  value={localFilters.amountMax}
                  onChange={(e) =>
                    setLocalFilters((prev) => ({
                      ...prev,
                      amountMax: parseInt(e.target.value) || 100000,
                    }))
                  }
                  placeholder="100000"
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Showing grants between ${localFilters.amountMin.toLocaleString()} and $
              {localFilters.amountMax.toLocaleString()}
            </p>
          </div>

          {/* Deadline Range */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Deadline</Label>
            <Select
              value={localFilters.deadlineRange}
              onValueChange={(value: any) =>
                setLocalFilters((prev) => ({ ...prev, deadlineRange: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select deadline range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Deadlines</SelectItem>
                <SelectItem value="week">Within 1 Week</SelectItem>
                <SelectItem value="month">Within 1 Month</SelectItem>
                <SelectItem value="3months">Within 3 Months</SelectItem>
                <SelectItem value="6months">Within 6 Months</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Difficulty Level */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Difficulty Level</Label>
            <div className="space-y-2">
              {["Easy", "Medium", "Hard"].map((level) => (
                <div key={level} className="flex items-center space-x-2">
                  <Checkbox
                    id={`difficulty-${level}`}
                    checked={localFilters.difficulty.includes(level)}
                    onCheckedChange={() => toggleDifficulty(level)}
                  />
                  <Label
                    htmlFor={`difficulty-${level}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {level}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Eligibility Criteria */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Eligibility Criteria</Label>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {availableEligibility.length > 0 ? (
                availableEligibility.map((criterion) => (
                  <div key={criterion} className="flex items-center space-x-2">
                    <Checkbox
                      id={`eligibility-${criterion}`}
                      checked={localFilters.eligibilityCriteria.includes(criterion)}
                      onCheckedChange={() => toggleEligibility(criterion)}
                    />
                    <Label
                      htmlFor={`eligibility-${criterion}`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {criterion}
                    </Label>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  No eligibility criteria available
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 pt-4 border-t">
          <Button onClick={handleApply} className="w-full">
            Apply Filters
          </Button>
          <Button onClick={handleReset} variant="outline" className="w-full gap-2">
            <X size={16} />
            Reset Filters
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};
