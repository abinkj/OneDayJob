import api from "../api";

export const getJobPostingsByUserId = async (userId: string) => {
  const res = await api.get(`jobs/user-posts/${userId}`);
  return res.data;
};

export const getAppliedJobsByUserId = async (userId: string) => {
  const res = await api.get(`applications/user/${userId}/applied-jobs`);
  return res.data;
};

export const withdrawApplication = async (jobId: string) => {
  const res = await api.post(`applications/jobs/${jobId}/withdraw`);
  return res.data;
};

export const getAppliedUser = async (jobId: string) => {
  const res = await api.get(`applications/jobs/${jobId}/applied-users`);
  return res.data;
};

export const applyJob = async (jobId: string) => {
  console.log("Applying for job with ID:", jobId);
  const data = await api.post(`applications/jobs/${jobId}/apply`);
  return data;
};
