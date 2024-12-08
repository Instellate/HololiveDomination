import { PaginationEllipsis, PaginationItem, PaginationLink } from '~/components/ui/pagination';

export function generatePaginationLinks(
  currentPage: number,
  totalPages: number,
  onPageChange: (page: number) => void,
) {
  const pages: JSX.Element[] = [];
  if (totalPages <= 11) {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(
        <PaginationItem key={i}>
          <PaginationLink onClick={() => onPageChange(i)} isActive={i === currentPage}>
            {i}
          </PaginationLink>
        </PaginationItem>,
      );
    }

    return pages;
  }

  if (currentPage - 6 >= 0) {
    pages.push(
      <PaginationItem key={1}>
        <PaginationLink onClick={() => onPageChange(1)} isActive={false}>
          {1}
        </PaginationLink>
      </PaginationItem>,
      <PaginationItem>
        <PaginationEllipsis />
      </PaginationItem>,
    );
  }

  if (currentPage - 5 <= 0) {
    for (let i = 1; i <= 9; i++) {
      pages.push(
        <PaginationItem key={i}>
          <PaginationLink onClick={() => onPageChange(i)} isActive={i === currentPage}>
            {i}
          </PaginationLink>
        </PaginationItem>,
      );
    }
  }

  if (currentPage - 5 > 0 && currentPage + 5 < totalPages) {
    for (let i = currentPage - 3; i <= currentPage + 3; i++) {
      pages.push(
        <PaginationItem key={i}>
          <PaginationLink onClick={() => onPageChange(i)} isActive={i === currentPage}>
            {i}
          </PaginationLink>
        </PaginationItem>,
      );
    }
  }

  if (currentPage + 5 >= totalPages) {
    for (let i = totalPages - 8; i <= totalPages; i++) {
      pages.push(
        <PaginationItem key={i}>
          <PaginationLink onClick={() => onPageChange(i)} isActive={i === currentPage}>
            {i}
          </PaginationLink>
        </PaginationItem>,
      );
    }
  }

  if (currentPage + 5 < totalPages) {
    pages.push(
      <PaginationItem>
        <PaginationEllipsis />
      </PaginationItem>,
      <PaginationItem key={totalPages}>
        <PaginationLink onClick={() => onPageChange(totalPages)} isActive={false}>
          {totalPages}
        </PaginationLink>
      </PaginationItem>,
    );
  }

  return pages;
}
