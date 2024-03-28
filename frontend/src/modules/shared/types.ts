export type Page<T> = {
  data: Array<T>
  meta: {
    itemsPerPage: number
    totalItems: number
    currentPage: number
    totalPages: number
    sortBy: Array<Array<string>>
  }
  links: {
    first: string
    previous: string
    current: string
    next: string
    last: string
  }
}

export class Pageable<T> {
  constructor(
    public limit: number = 10,
    public page: number = 1,
    public sortBys?: Array<string>,
    public search?: string,
    public filter?: T
  ) {}
}

export interface PaginatorProps {
  /**
   * Number of total records.
   * @defaultValue 0
   */
  totalRecords?: number | undefined
  /**
   * Data count to display per page.
   * @defaultValue 10
   */
  rows?: number | undefined

  /**
   * Number of page links to display.
   * @defaultValue 5
   */
  pageLinkSize?: number | undefined
  /**
   * Array of integer values to display inside rows per page dropdown.
   */
  rowsPerPageOptions?: number[] | undefined
}

/**
 * Paginator page state metadata.
 */
export interface PageState {
  /**
   * Index of first record
   */
  first: number
  /**
   * Number of rows to display in new page
   */
  rows: number
  /**
   * New page number
   */
  page: number
  /**
   * Total number of pages
   */
  pageCount: number
}
