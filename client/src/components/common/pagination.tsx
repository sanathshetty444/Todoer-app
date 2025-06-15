import { Button } from "../ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

function Pagination(props: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    limit: number;
    handlePrevious: () => void;
    handleNext: () => void;
    handlePageChange: (page: number) => void;
}) {
    console.log("Pagination component rendered with props:", props);

    const {
        currentPage,
        limit,
        totalItems,
        totalPages,
        handlePrevious,
        handleNext,
        handlePageChange,
    } = props;

    const startIndex = (currentPage - 1) * limit; // Assuming 10 items per page
    const endIndex = startIndex + limit;
    const getPageNumbers = () => {
        const pages = [];
        const maxVisiblePages = 5;

        if (totalPages <= maxVisiblePages) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            const startPage = Math.max(1, currentPage - 2);
            const endPage = Math.min(
                totalPages,
                startPage + maxVisiblePages - 1
            );

            for (let i = startPage; i <= endPage; i++) {
                pages.push(i);
            }
        }

        return pages;
    };
    return (
        <>
            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between fixed bg-white bottom-0 w-[100%] p-5 right-0 z-1000">
                    <div className="text-lg text-gray-700 ">
                        Showing {startIndex + 1} to {endIndex} of {totalItems}{" "}
                        results
                    </div>

                    <div className="flex items-center space-x-2">
                        {/* Previous Button */}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handlePrevious}
                            disabled={currentPage === 1}
                            className="flex items-center gap-1"
                        >
                            <ChevronLeft className="h-4 w-4" />
                            Previous
                        </Button>

                        {/* Page Numbers */}
                        <div className="flex items-center space-x-1">
                            {getPageNumbers().map((pageNumber) => (
                                <Button
                                    key={pageNumber}
                                    variant={
                                        currentPage === pageNumber
                                            ? "default"
                                            : "outline"
                                    }
                                    size="sm"
                                    onClick={() => handlePageChange(pageNumber)}
                                    className={
                                        currentPage === pageNumber
                                            ? "bg-blue-600 hover:bg-blue-700"
                                            : ""
                                    }
                                >
                                    {pageNumber}
                                </Button>
                            ))}
                        </div>

                        {/* Next Button */}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleNext}
                            disabled={currentPage === totalPages}
                            className="flex items-center gap-1"
                        >
                            Next
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}
        </>
    );
}

export default Pagination;
