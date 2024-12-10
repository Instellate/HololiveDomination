import { generatePaginationLinks } from '~/lib/generate-page';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from './ui/pagination';

type PaginatorProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (pageNumber: number) => void;
  showPreviousNext: boolean;
};

export default function Paginator({
  currentPage,
  totalPages,
  onPageChange,
  showPreviousNext,
}: PaginatorProps) {
  return (
    <Pagination>
      <PaginationContent className="flex-wrap justify-center">
        {showPreviousNext && totalPages ? (
          <PaginationItem>
            <PaginationPrevious
              onClick={() => onPageChange(currentPage - 1)}
              isActive={!(currentPage - 1 < 1)}
              className={currentPage - 1 < 1 ? 'pointer-events-none opacity-50' : undefined}
            />
          </PaginationItem>
        ) : null}
        {generatePaginationLinks(currentPage, totalPages, onPageChange)}
        {showPreviousNext && totalPages ? (
          <PaginationItem>
            <PaginationNext
              onClick={() => onPageChange(currentPage + 1)}
              isActive={!(currentPage > totalPages - 1)}
              className={
                currentPage > totalPages - 1 ? 'pointer-events-none opacity-50' : undefined
              }
            />
          </PaginationItem>
        ) : null}
      </PaginationContent>
    </Pagination>
  );
}
