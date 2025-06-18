# Project Database Documentation

## Table of Contents

1. [Introduction](#introduction)
2. [Database Schema Overview](#database-schema-overview)
   - [User Info Table](#user-info-table)
   - [Users Table](#users-table)
   - [Availability Table](#availability-table)
   - [Bookings Table](#bookings-table)
   - [Expertise Tags Table](#expertise-tags-table)
   - [Mentees Table](#mentees-table)
   - [Mentor Availability Table](#mentor-availability-table)
   - [Mentor Calendar OAuth Table](#mentor-calendar-oauth-table)
   - [Mentor Expertise Table](#mentor-expertise-table)
   - [Mentor Reviews Table](#mentor-reviews-table)
   - [Mentor Social Links Table](#mentor-social-links-table)
   - [Mentoring Sessions Table](#mentoring-sessions-table)
   - [Mentors Table](#mentors-table)
3. [Row-Level Security (RLS) Policies](#row-level-security-rls-policies)
4. [Functions and Procedures](#functions-and-procedures)
5. [Sample Queries](#sample-queries)
6. [Data Flow](#data-flow)
7. [Version Control](#version-control)

## Introduction

This document provides a comprehensive overview of the database schema for the project, including tables, relationships, security policies, functions, and sample queries.

## Database Schema Overview

### User Info Table

- **Purpose**: Stores basic user information.
- **Columns**:
  - `id` (bigint, primary key): Unique identifier for each user.
  - `created_at` (timestamp with time zone): Timestamp of when the user was created.
  - `mentor` (boolean): Indicates if the user is a mentor.
  - `mentee` (boolean): Indicates if the user is a mentee.
  - `name` (text): User's name.
  - `email` (text): User's email address (unique).

### Users Table

- **Purpose**: Stores user account information.
- **Columns**:
  - `user_id` (uuid, primary key): Unique identifier for each user.
  - `created_at` (timestamp with time zone): Timestamp of when the user was created.
  - `name` (text): User's name.
  - `linkedin` (text): User's LinkedIn profile link.
  - `dob` (date): User's date of birth.

### Availability Table

- **Purpose**: Stores availability slots for mentors.
- **Columns**:
  - `id` (uuid, primary key): Unique identifier for each availability entry.
  - `mentor_id` (uuid): Identifier for the mentor.
  - `start_time` (timestamp with time zone): Start time of the availability.
  - `end_time` (timestamp with time zone): End time of the availability.
  - `status` (text): Status of the availability (default is 'available').
  - `created_at` (timestamp with time zone): Timestamp of when the entry was created.

### Bookings Table

- **Purpose**: Stores booking information for mentoring sessions.
- **Columns**:
  - `id` (uuid, primary key): Unique identifier for each booking.
  - `mentor_id` (text): Identifier for the mentor.
  - `mentor_name` (text): Name of the mentor.
  - `mentor_email` (text): Email of the mentor.
  - `user_id` (text): Identifier for the user.
  - `user_email` (text): Email of the user.
  - `date` (text): Date of the session.
  - `time` (text): Time of the session.
  - `session_type` (text): Type of the session.
  - `meeting_id` (text): Identifier for the meeting.
  - `meeting_url` (text): URL for the meeting.
  - `status` (text): Status of the booking (default is 'confirmed').
  - `created_at` (timestamp with time zone): Timestamp of when the booking was created.

### Expertise Tags Table

- **Purpose**: Stores tags for mentor expertise.
- **Columns**:
  - `id` (uuid, primary key): Unique identifier for each tag.
  - `name` (text): Name of the expertise tag (unique).
  - `created_at` (timestamp with time zone): Timestamp of when the tag was created.

### Mentees Table

- **Purpose**: Stores information about mentees.
- **Columns**:
  - `id` (uuid, primary key): Unique identifier for each mentee.
  - `user_id` (uuid): Identifier for the user.
  - `name` (text): Mentee's name.
  - `email` (text): Mentee's email address.
  - `dob` (date): Mentee's date of birth.
  - `created_at` (timestamp with time zone): Timestamp of when the mentee was created.
  - `linkedin` (text): Mentee's LinkedIn profile link.
  - `biography` (text): Mentee's biography.
  - `linkedin_url` (text): Mentee's LinkedIn URL.
  - `role` (text): Role of the user (default is 'mentee').
  - `profile_image_url` (text): URL for the mentee's profile image.

### Mentor Availability Table

- **Purpose**: Stores availability information for mentors.
- **Columns**:
  - `id` (uuid, primary key): Unique identifier for each availability entry.
  - `mentor_id` (uuid): Identifier for the mentor.
  - `start_time` (timestamp with time zone): Start time of the availability.
  - `end_time` (timestamp with time zone): End time of the availability.
  - `recurrence` (jsonb): Recurrence information for the availability.

### Mentor Calendar OAuth Table

- **Purpose**: Stores OAuth information for mentor calendars.
- **Columns**:
  - `id` (uuid, primary key): Unique identifier for each entry.
  - `mentor_id` (uuid): Identifier for the mentor.
  - `provider` (text): Name of the calendar provider.
  - `access_token` (text): Access token for the calendar.
  - `refresh_token` (text): Refresh token for the calendar.
  - `expires_at` (timestamp with time zone): Expiration time of the access token.

### Mentor Expertise Table

- **Purpose**: Links mentors to their expertise tags.
- **Columns**:
  - `mentor_id` (uuid): Identifier for the mentor.
  - `tag_id` (uuid): Identifier for the expertise tag.

### Mentor Reviews Table

- **Purpose**: Stores reviews for mentors.
- **Columns**:
  - `id` (uuid, primary key): Unique identifier for each review.
  - `mentor_id` (uuid): Identifier for the mentor.
  - `mentee_id` (uuid): Identifier for the mentee.
  - `session_id` (uuid): Identifier for the mentoring session.
  - `rating` (integer): Rating given by the mentee (1-5).
  - `feedback` (text): Feedback provided by the mentee.

### Mentor Social Links Table

- **Purpose**: Stores social media links for mentors.
- **Columns**:
  - `id` (uuid, primary key): Unique identifier for each entry.
  - `mentor_id` (uuid): Identifier for the mentor.
  - `platform` (text): Name of the social media platform.
  - `url` (text): URL for the social media profile.

### Mentoring Sessions Table

- **Purpose**: Stores information about mentoring sessions.
- **Columns**:
  - `id` (uuid, primary key): Unique identifier for each session.
  - `mentor_id` (uuid): Identifier for the mentor.
  - `mentee_id` (uuid): Identifier for the mentee.
  - `status` (text): Status of the session (e.g., upcoming, active, completed, cancelled).
  - `start_time` (timestamp with time zone): Start time of the session.
  - `end_time` (timestamp with time zone): End time of the session.
  - `cancelled_at` (timestamp with time zone): Timestamp of when the session was cancelled.
  - `created_at` (timestamp with time zone): Timestamp of when the session was created.

### Mentors Table

- **Purpose**: Stores information about mentors.
- **Columns**:
  - `id` (uuid, primary key): Unique identifier for each mentor.
  - `user_id` (uuid): Identifier for the user.
  - `name` (text): Mentor's name.
  - `email` (text): Mentor's email address.
  - `created_at` (timestamp with time zone): Timestamp of when the mentor was created.
  - `bio` (text): Biography of the mentor.
  - `linkedin` (text): Mentor's LinkedIn profile link.
  - `profile_image_url` (text): URL for the mentor's profile image.
  - `role` (text): Role of the user (default is 'mentor').

## Row-Level Security (RLS) Policies

- **Purpose**: To ensure that users can only access data that they are authorized to view.
- **Policies**:
  - **Users**: Only the user themselves can access their data.
  - **Mentees**: Only mentors can access mentee data.
  - **Mentors**: Only admins can access mentor data.

## Functions and Procedures

- **Purpose**: To encapsulate business logic at the database level.
- **Examples**:
  - Function to book a mentoring session.
  - Procedure to send confirmation emails for bookings.

## Sample Queries

- **Purpose**: To provide examples of common queries run against the database.
- **Examples**:
  - Query to find all available time slots for a given mentor.
  - Query to retrieve all feedback for a specific mentor.

## Data Flow

- **Purpose**: To describe how data moves through the system.
- **Description**: Data is collected through the user interface, processed by the application logic, and stored in the database. Reports are generated by querying the database and are sent to users via email.

## Version Control

- **Version 1.0**: Initial version of the database documentation.
