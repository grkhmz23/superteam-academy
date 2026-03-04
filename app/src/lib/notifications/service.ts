/**
 * Notification service for Superteam Academy
 * Handles in-app notifications for various events
 */

import { prisma } from '@/lib/db/client';

export type NotificationType =
  | 'job_application'
  | 'job_application_status'
  | 'project_feedback'
  | 'project_like'
  | 'mentorship_request'
  | 'mentorship_accepted'
  | 'mentorship_reminder'
  | 'idea_interest'
  | 'idea_interest_status';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: Date;
}

export interface CreateNotificationInput {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
}

/**
 * Create a new notification
 */
export async function createNotification(
  input: CreateNotificationInput
): Promise<Notification> {
  // For now, we'll use a simple in-memory approach
  // In production, this would persist to database
  const notification: Notification = {
    id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    ...input,
    read: false,
    createdAt: new Date(),
  };

  // TODO: Persist to database when Notification model is added
  return notification;
}

/**
 * Notify job poster of new application
 */
export async function notifyJobApplication(
  jobPosterId: string,
  jobTitle: string,
  applicantName: string
): Promise<Notification> {
  return createNotification({
    userId: jobPosterId,
    type: 'job_application',
    title: 'New Job Application',
    message: `${applicantName} applied to "${jobTitle}"`,
    link: '/jobs/applications',
  });
}

/**
 * Notify applicant of status change
 */
export async function notifyApplicationStatus(
  applicantId: string,
  jobTitle: string,
  status: string
): Promise<Notification> {
  const statusMessages: Record<string, string> = {
    accepted: 'Congratulations! Your application was accepted.',
    rejected: 'Your application was not selected.',
    reviewed: 'Your application is being reviewed.',
  };

  return createNotification({
    userId: applicantId,
    type: 'job_application_status',
    title: 'Application Status Update',
    message: `${statusMessages[status] || `Status: ${status}`} for "${jobTitle}"`,
    link: '/jobs/applications',
  });
}

/**
 * Notify project owner of new feedback
 */
export async function notifyProjectFeedback(
  ownerId: string,
  projectTitle: string,
  reviewerName: string
): Promise<Notification> {
  return createNotification({
    userId: ownerId,
    type: 'project_feedback',
    title: 'New Project Feedback',
    message: `${reviewerName} left feedback on "${projectTitle}"`,
    link: `/projects`,
  });
}

/**
 * Notify project owner of new like
 */
export async function notifyProjectLike(
  ownerId: string,
  projectTitle: string
): Promise<Notification> {
  return createNotification({
    userId: ownerId,
    type: 'project_like',
    title: 'Project Liked',
    message: `Someone liked your project "${projectTitle}"`,
    link: `/projects`,
  });
}

/**
 * Notify mentor of booking request
 */
export async function notifyMentorshipRequest(
  mentorId: string,
  menteeName: string,
  topic: string
): Promise<Notification> {
  return createNotification({
    userId: mentorId,
    type: 'mentorship_request',
    title: 'New Mentorship Request',
    message: `${menteeName} requested a session on "${topic}"`,
    link: '/sessions',
  });
}

/**
 * Notify mentee of accepted session
 */
export async function notifyMentorshipAccepted(
  menteeId: string,
  mentorName: string
): Promise<Notification> {
  return createNotification({
    userId: menteeId,
    type: 'mentorship_accepted',
    title: 'Mentorship Session Confirmed',
    message: `${mentorName} accepted your session request`,
    link: '/sessions',
  });
}

/**
 * Notify idea owner of new interest
 */
export async function notifyIdeaInterest(
  ownerId: string,
  ideaTitle: string,
  interestedPartyName: string,
  role: string
): Promise<Notification> {
  return createNotification({
    userId: ownerId,
    type: 'idea_interest',
    title: 'New Interest in Your Idea',
    message: `${interestedPartyName} is interested as ${role} in "${ideaTitle}"`,
    link: '/ideas',
  });
}

/**
 * Notify user of interest status change
 */
export async function notifyIdeaInterestStatus(
  userId: string,
  ideaTitle: string,
  status: string
): Promise<Notification> {
  const statusMessages: Record<string, string> = {
    accepted: 'Your interest was accepted! Check your email for next steps.',
    declined: 'The team decided to pursue other candidates.',
  };

  return createNotification({
    userId,
    type: 'idea_interest_status',
    title: 'Interest Status Update',
    message: `${statusMessages[status] || `Status: ${status}`} for "${ideaTitle}"`,
    link: '/ideas/interests',
  });
}

/**
 * Send session reminder (scheduled for 24h and 1h before)
 */
export async function sendSessionReminder(
  userId: string,
  sessionTime: Date,
  hoursBefore: number
): Promise<Notification> {
  return createNotification({
    userId,
    type: 'mentorship_reminder',
    title: 'Upcoming Mentorship Session',
    message: `Your session starts in ${hoursBefore} hour${hoursBefore > 1 ? 's' : ''}`,
    link: '/sessions',
  });
}
