import { FilterType } from "@/lib/data";
import { Filter } from "lucide-react";
import React from "react";
import { Button } from "./ui/button";
import { Badge } from "@/components/ui/badge";
export const StartAndFilters = ({
    completedTaskCount = 0,
    activeTaskCount = 0,
    filter = "all",
    setFilter
}) => {

    return (
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div className="flex gap-3">
                <Badge
                    variant="secondary"
                    className="capitalize bg-white/50 text-accent-foreground border-info/10"
                >
                    {activeTaskCount} {FilterType.active}
                </Badge>
                <Badge
                    variant="secondary"
                    className="capitalize bg-white/50 text-success border-success/20"

                >
                    {completedTaskCount} {FilterType.completed}
                </Badge>
            </div>
            <div className="flex flex-col gap-4 sm:flex-row">
                {
                    Object.keys(FilterType).map((type) => {
                        return (
                            <Button
                                key={type}
                                variant={filter === type ? 'gradient' : 'outline'}
                                size='sm'
                                className='capitalize'
                                onClick={() => {
                                    setFilter(type)
                                }}
                            >
                                <Filter className="size-4" />
                                {FilterType[type]}
                            </Button>
                        )
                    })
                    
                }
            </div>
        </div>
    )
}

export default StartAndFilters;