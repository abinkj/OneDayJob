import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import Toast from "react-native-toast-message";

import { useTheme } from "../../../contexts/ThemeContext";
import { Header } from "../../../components/header";
import JobCard from "../../../components/jobCard";
import StatusFilter from "../../../components/statusFilter";
import { JobCardSkeleton } from "../../../components/Shimmer/Skeletons";
import { useUserJobPostings, useDeleteJob } from "../../../hooks/useJobs";
import { JobPost } from "../../../types";
import { getJobStatusInfo, JOB_STATUSES } from "../../../utilities/statusUtils";
import { createStyles } from "./styles";

const JobPostingHistory = () => {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const navigation = useNavigation<any>();

  const userData = useSelector((state: any) => state.authentication.userData);
  const userId = userData?.id || userData?._id;

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    refetch,
    isRefetching,
    isFetching,
  } = useUserJobPostings(userId);

  const deleteJobMutation = useDeleteJob();
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  // Flatten data from paginated response
  const posts = useMemo(() => {
    return data?.pages.flatMap((page) => page.data) || [];
  }, [data]);

  const [filteredPosts, setFilteredPosts] = useState<JobPost[]>([]);
  const flatListRef = useRef<FlatList<JobPost>>(null);

  // Filter posts based on selected status
  useEffect(() => {
    if (selectedStatus === null) {
      setFilteredPosts(posts);
    } else {
      const filtered = posts.filter((post) => {
        const statusInfo = getJobStatusInfo(post.jobStatus || "posted");
        return statusInfo.label === selectedStatus;
      });
      setFilteredPosts(filtered);
    }
  }, [selectedStatus, posts]);

  const handleNext = (jobId: string) => {
    navigation.navigate("RequestVerification", { jobId: jobId });
  };

  const handleDelete = async (jobId: string) => {
    try {
      await deleteJobMutation.mutateAsync(jobId);
      Toast.show({
        type: "success",
        text1: "Deleted",
        text2: "Job post deleted successfully",
      });
    } catch (error: any) {
      console.error("Delete failed:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error.response?.data?.message || "Failed to delete job",
      });
    }
  };

  const handleSummary = (jobId: string, jobName: string) => {
    navigation.navigate("JobTimer", {
      jobId,
      jobName,
      isEmployer: true,
    });
  };

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const availableStatuses = [
    getJobStatusInfo(JOB_STATUSES.POSTED),
    getJobStatusInfo(JOB_STATUSES.IN_PROGRESS),
    getJobStatusInfo(JOB_STATUSES.COMPLETED),
    getJobStatusInfo(JOB_STATUSES.CANCELLED),
  ];

  if (isLoading && !isRefetching && posts.length === 0) {
    return (
      <View style={styles.container}>
        <Header title="Job Posting History" showBackButton />
        <JobCardSkeleton />
        <JobCardSkeleton />
        <JobCardSkeleton />
      </View>
    );
  }

  const renderItem = ({ item }: { item: JobPost }) => (
    <JobCard
      key={item._id}
      data={item}
      onPress={() => handleNext(item._id)}
      onDelete={() => handleDelete(item._id)}
      onSummary={() => handleSummary(item._id, item.name)}
      isEmployer={true}
    />
  );

  const renderFooter = () => {
    if (!isFetchingNextPage) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  };

  const renderEmpty = () => {
    if (isFetching || isLoading) return null;

    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="document-outline" size={64} color={colors.grey} />
        <Text style={styles.emptyText}>
          {selectedStatus
            ? `No ${selectedStatus.toLowerCase()} jobs`
            : "No job posts yet"}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Header title="Job Posting History" showBackButton />

      {/* {posts.length > 0 && (
        <StatusFilter
          statuses={availableStatuses}
          selectedStatus={selectedStatus}
          onStatusSelect={setSelectedStatus}
          showAll={true}
        />
      )} */}

      <FlatList
        ref={flatListRef}
        data={filteredPosts}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={[
          styles.listContent,
          filteredPosts.length === 0 && { flexGrow: 1 },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() => refetch()}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
      />
    </View>
  );
};

export default JobPostingHistory;
