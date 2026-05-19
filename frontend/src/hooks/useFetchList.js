import { useCallback, useEffect, useRef, useState } from "react";
import { parseApiError } from "../services/api";

export default function useFetchList(fetchFn, deps = []) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Pagination state
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [pageSize, setPageSize] = useState(20);

  const hasLoadedDataRef = useRef(false);
  const fetchFnRef = useRef(fetchFn);

  // Update ref without triggering re-fetch if function reference changes
  // This prevents unnecessary re-fetches when parent re-renders
  useEffect(() => {
    fetchFnRef.current = fetchFn;
  }, [fetchFn]);

  const load = useCallback(async (pageNum = 1, limit = pageSize) => {
    setLoading(true);
    setError("");
    try {
      // Call fetch function with pagination params
      const response = await fetchFnRef.current({ page: pageNum, limit });
      
      // Handle both array response and paginated object response
      let items = [];
      let pagData = {
        total: 0,
        page: pageNum,
        limit: limit,
        pages: 0
      };
      
      if (Array.isArray(response.data)) {
        // Simple array response (backward compatibility)
        items = response.data;
        pagData.total = items.length;
        pagData.pages = Math.ceil(items.length / limit);
      } else if (response.data?.items) {
        // Paginated response format
        items = response.data.items || [];
        pagData = {
          total: response.data.total || 0,
          page: response.data.page || pageNum,
          limit: response.data.limit || limit,
          pages: response.data.pages || Math.ceil((response.data.total || 0) / limit)
        };
      } else {
        // Fallback
        items = response.data || [];
        pagData.total = items.length;
        pagData.pages = Math.ceil(items.length / limit);
      }
      
      setData(items);
      setPage(pagData.page);
      setTotalPages(pagData.pages);
      setTotalCount(pagData.total);
      setPageSize(limit);
      
      if (items.length > 0) {
        hasLoadedDataRef.current = true;
      }
    } catch (err) {
      // Keep already-rendered data visible when a transient retry/timeout happens.
      if (hasLoadedDataRef.current) {
        setError("");
      } else {
        setError(parseApiError(err));
      }
    } finally {
      setLoading(false);
    }
  }, [pageSize]);

  // Only fetch once on mount + when deps change
  useEffect(() => {
    load(1, pageSize);
  }, deps.length > 0 ? deps : []);

  const goToPage = useCallback((pageNum) => {
    if (pageNum >= 1 && pageNum <= totalPages) {
      load(pageNum, pageSize);
    }
  }, [load, totalPages, pageSize]);

  const nextPage = useCallback(() => {
    if (page < totalPages) {
      goToPage(page + 1);
    }
  }, [page, totalPages, goToPage]);

  const prevPage = useCallback(() => {
    if (page > 1) {
      goToPage(page - 1);
    }
  }, [page, goToPage]);

  return {
    data,
    loading,
    error,
    reload: () => load(page, pageSize),
    setData,
    // Pagination
    page,
    totalPages,
    totalCount,
    pageSize,
    goToPage,
    nextPage,
    prevPage,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
}
