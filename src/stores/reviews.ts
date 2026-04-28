import { create } from "zustand";

export interface Review {
  id: string;
  orderId: string;
  productId: number;
  rating: number;
  comment: string;
  createdAt: string;
  images?: string[];
}

interface ReviewsState {
  reviews: Review[];
  isLoading: boolean;
  error: string | null;
  addReview: (review: Omit<Review, "id" | "createdAt">) => void;
  getReviewByOrderId: (orderId: string) => Review | undefined;
}

export const useReviewsStore = create<ReviewsState>((set, get) => ({
  reviews: [],
  isLoading: false,
  error: null,

  addReview: (review) => {
    const { reviews } = get();
    const newReview: Review = {
      ...review,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    set({
      reviews: [...reviews, newReview],
    });
  },

  getReviewByOrderId: (orderId) => {
    return get().reviews.find((review) => review.orderId === orderId);
  },
}));
