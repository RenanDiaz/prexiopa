/**
 * Analytics Hooks
 * React Query hooks for fetching admin analytics data
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '../supabaseClient';
import type {
  ContributionTrendData,
  ContributionsByType,
  ReviewTimeStats,
  CompletenessByCategory,
  DailyActivityStats,
} from '@/types/analytics';

/**
 * Hook to fetch contribution trends over time
 */
export const useContributionTrends = (days: number = 30) => {
  return useQuery<ContributionTrendData[], Error>({
    queryKey: ['contribution-trends', days],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_contribution_trends', {
        p_days: days,
      });

      if (error) {
        console.error('Error fetching contribution trends:', error);
        throw error;
      }

      return data || [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Hook to fetch contributions grouped by type
 */
export const useContributionsByType = () => {
  return useQuery<ContributionsByType[], Error>({
    queryKey: ['contributions-by-type'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_contributions_by_type');

      if (error) {
        console.error('Error fetching contributions by type:', error);
        throw error;
      }

      return data || [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Hook to fetch review time statistics
 */
export const useReviewTimeStats = () => {
  return useQuery<ReviewTimeStats, Error>({
    queryKey: ['review-time-stats'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_review_time_stats');

      if (error) {
        console.error('Error fetching review time stats:', error);
        throw error;
      }

      return data?.[0] || {
        avg_review_hours: 0,
        median_review_hours: 0,
        fastest_review_hours: 0,
        slowest_review_hours: 0,
        total_reviewed: 0,
      };
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Hook to fetch active contributors count
 */
export const useActiveContributorsCount = (days: number = 30) => {
  return useQuery<number, Error>({
    queryKey: ['active-contributors-count', days],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_active_contributors_count', {
        p_days: days,
      });

      if (error) {
        console.error('Error fetching active contributors count:', error);
        throw error;
      }

      return data || 0;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Hook to fetch completeness statistics by category
 */
export const useCompletenessByCategory = () => {
  return useQuery<CompletenessByCategory[], Error>({
    queryKey: ['completeness-by-category'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_completeness_by_category');

      if (error) {
        console.error('Error fetching completeness by category:', error);
        throw error;
      }

      return data || [];
    },
    staleTime: 1000 * 60 * 10, // 10 minutes (slower changing data)
  });
};

/**
 * Hook to fetch daily activity statistics
 */
export const useDailyActivityStats = () => {
  return useQuery<DailyActivityStats, Error>({
    queryKey: ['daily-activity-stats'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_daily_activity_stats');

      if (error) {
        console.error('Error fetching daily activity stats:', error);
        throw error;
      }

      return data?.[0] || {
        contributions_today: 0,
        contributions_yesterday: 0,
        reviews_today: 0,
        reviews_yesterday: 0,
        new_products_today: 0,
        new_products_yesterday: 0,
      };
    },
    staleTime: 1000 * 60 * 2, // 2 minutes (frequently changing data)
    refetchInterval: 1000 * 60 * 5, // Auto-refetch every 5 minutes
  });
};

/**
 * Composite hook that fetches all analytics data
 * Useful for the main dashboard page
 */
export const useAdminAnalytics = (trendDays: number = 30) => {
  const trends = useContributionTrends(trendDays);
  const byType = useContributionsByType();
  const reviewStats = useReviewTimeStats();
  const activeContributors = useActiveContributorsCount(trendDays);
  const completeness = useCompletenessByCategory();
  const dailyStats = useDailyActivityStats();

  return {
    trends,
    byType,
    reviewStats,
    activeContributors,
    completeness,
    dailyStats,
    isLoading:
      trends.isLoading ||
      byType.isLoading ||
      reviewStats.isLoading ||
      activeContributors.isLoading ||
      completeness.isLoading ||
      dailyStats.isLoading,
    isError:
      trends.isError ||
      byType.isError ||
      reviewStats.isError ||
      activeContributors.isError ||
      completeness.isError ||
      dailyStats.isError,
  };
};
