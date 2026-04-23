import { create } from 'zustand';
import type { Product } from './products';

interface ProductManagementState {
  filters: {
    search: string;
    category: string;
    status: 'all' | 'in-stock' | 'low-stock' | 'out-of-stock';
    sortBy: 'name' | 'price' | 'stock' | 'date';
    sortOrder: 'asc' | 'desc';
  };
  selectedProduct: Product | null;
  isLoading: boolean;
  error: string | null;
  setFilter: (key: keyof ProductManagementState['filters'], value: string) => void;
  setSelectedProduct: (product: Product | null) => void;
  clearFilters: () => void;
  getFilteredProducts: (products: Product[]) => Product[];
}

export const useProductManagementStore = create<ProductManagementState>((set, get) => ({
  filters: {
    search: '',
    category: 'all',
    status: 'all',
    sortBy: 'name',
    sortOrder: 'asc',
  },
  selectedProduct: null,
  isLoading: false,
  error: null,

  setFilter: (key, value) => set(state => ({
    filters: {
      ...state.filters,
      [key]: value
    }
  })),

  setSelectedProduct: (product) => set({ selectedProduct: product }),

  clearFilters: () => set({
    filters: {
      search: '',
      category: 'all',
      status: 'all',
      sortBy: 'name',
      sortOrder: 'asc',
    }
  }),

  getFilteredProducts: (products) => {
    const filters = get().filters;
    let filtered = [...products];

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(product => 
        product.name.en.toLowerCase().includes(searchLower) ||
        product.name.en.toLowerCase().includes(searchLower) ||
        product.sku.toLowerCase().includes(searchLower)
      );
    }

    // Apply category filter
    if (filters.category !== 'all') {
      filtered = filtered.filter(product =>
        product.categories.some(c => c.categoryId.toString() === filters.category)
      );
    }

    // Apply status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(product => {
        const variant = product.variants[0]; // Assuming first variant is primary
        if (!variant) return false;

        switch (filters.status) {
          case 'in-stock':
            return variant.inventory.stockStatus === 'in_stock';
          case 'low-stock':
            return variant.inventory.stockStatus === 'low_stock';
          case 'out-of-stock':
            return variant.inventory.stockStatus === 'out_of_stock';
          default:
            return true;
        }
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const variant1 = a.variants[0];
      const variant2 = b.variants[0];
      
      switch (filters.sortBy) {
        case 'name':
          return filters.sortOrder === 'asc' 
            ? a.name.en.localeCompare(b.name.en)
            : b.name.en.localeCompare(a.name.en);
        
        case 'price':
          if (!variant1 || !variant2) return 0;
          return filters.sortOrder === 'asc'
            ? variant1.price.sale - variant2.price.sale
            : variant2.price.sale - variant1.price.sale;
        
        case 'stock':
          if (!variant1 || !variant2) return 0;
          return filters.sortOrder === 'asc'
            ? variant1.inventory.stockLevel - variant2.inventory.stockLevel
            : variant2.inventory.stockLevel - variant1.inventory.stockLevel;
        
        case 'date':
          return filters.sortOrder === 'asc'
            ? new Date(a.metadata.createdAt).getTime() - new Date(b.metadata.createdAt).getTime()
            : new Date(b.metadata.createdAt).getTime() - new Date(a.metadata.createdAt).getTime();
        
        default:
          return 0;
      }
    });

    return filtered;
  }
}));
