import React from "react";
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"
import { cn } from "@/lib/utils";



export const TaskListPag = ({
    handleNextPage,
    handlePrevPage,
    handlePageChange,
    Page,
    totalPage
}) => {

    const generatePage = () => {
        const pages = [];
        if (totalPage < 4) {
            for (let i = 1; i <= totalPage; i++) {
                pages.push(i);
            }
        } else {
            if (Page <= 2) {
                pages.push(1, 2, 3, '...', totalPage);
            } else if (Page >= totalPage - 1) {
                pages.push(1, '...', totalPage - 2, totalPage - 1, totalPage);
            }
            else {
                pages.push(1, '...', Page - 1, Page, Page + 1, '...', totalPage);
            }
        }
        return pages;
    }

    const pageToShow = generatePage();
    return (
        <div className="flex justify-center mt-4">
            <Pagination>
                <PaginationContent>

                    <PaginationItem>
                        <PaginationPrevious
                            onClick={Page === 1 ? null : handlePrevPage}
                            className={cn("cursor-pointer",
                                Page === 1 ? "pointer-events-none opacity-50" : ""
                            )}
                        />
                    </PaginationItem>

                    {pageToShow.map((pageNumber, index) => {
                        return (
                            <PaginationItem key={index}>
                                {pageNumber === '...' ? (
                                    <PaginationEllipsis/>
                                ) : (
                                <PaginationLink
                                    isActive={pageNumber === Page ? true : false}
                                    onClick={() => {
                                        if (pageNumber !== Page) {
                                            handlePageChange(pageNumber)
                                        }
                                    }}
                                    className="cursor-pointer"
                                >
                                    {pageNumber}
                                </PaginationLink>)}
                            </PaginationItem>
                        )
                    })}
                    <PaginationItem>
                        <PaginationNext
                            onClick={Page === totalPage ? null : handleNextPage}
                            className={cn("cursor-pointer",
                                Page === totalPage ? "pointer-events-none opacity-50" : ""
                            )}
                        />
                    </PaginationItem>

                </PaginationContent>
            </Pagination>
        </div>
    )
}

export default TaskListPag;