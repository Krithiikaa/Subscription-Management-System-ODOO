import { Search, X, RotateCcw } from 'lucide-react';

export default function InvoiceFilters({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  metrics,
  filteredCount,
  totalCount,
  onResetFilters
}) {
  const statusTabs = [
    { id: 'all', label: 'All', count: metrics.totalCount },
    { id: 'paid', label: 'Paid', count: metrics.paidCount },
    { id: 'draft', label: 'Draft', count: metrics.draftCount },
    { id: 'overdue', label: 'Overdue', count: metrics.overdueCount }
  ];

  const hasActiveFilters = searchQuery.trim() !== '' || statusFilter !== 'all';

  return (
    <div className="card-toolbar">
      <div className="search-filter-wrap">
        {/* Search Input for Invoice Number or Customer Name */}
        <div className="search-box">
          <Search className="search-icon" size={16} aria-hidden="true" />
          <input
            type="text"
            className="search-input"
            placeholder="Search by invoice # or customer name..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            aria-label="Search invoices by invoice number or customer name"
          />
          {searchQuery && (
            <button
              type="button"
              className="search-clear-btn"
              onClick={() => onSearchChange('')}
              aria-label="Clear search query"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Status Filter Tabs */}
        <div className="filter-tabs" role="tablist" aria-label="Filter invoices by status">
          {statusTabs.map((tab) => {
            const isActive = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                className={`filter-tab ${isActive ? 'active' : ''}`}
                onClick={() => onStatusChange(tab.id)}
              >
                <span>{tab.label}</span>
                <span className="filter-count">{tab.count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter Stats & Reset */}
      <div className="active-filters-info">
        <span>
          Showing <strong>{filteredCount}</strong> of {totalCount} invoices
        </span>
        {hasActiveFilters && (
          <button
            type="button"
            className="btn-link"
            onClick={onResetFilters}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
          >
            <RotateCcw size={12} />
            Reset filters
          </button>
        )}
      </div>
    </div>
  );
}
