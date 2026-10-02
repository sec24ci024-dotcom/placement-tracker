# Placement Preparation Tracker



A full-stack web application that helps students track their placement preparation, monitor progress, and use AI-powered tools for interview preparation and personalized study planning.



## Live Application



Frontend:



https://placement-tracker-three-gray.vercel.app/



Backend:



https://placement-tracker-api-k8nj.onrender.com



## Problem Statement



Students preparing for placements often use multiple platforms to manage coding practice, aptitude preparation, courses, projects, and interview preparation.



The Placement Preparation Tracker brings these activities into one dashboard.



It allows students to:



- Track preparation tasks

- Mark tasks as completed

- Monitor overall progress

- Organize preparation into categories

- Prepare for interviews with AI

- Generate personalized study plans

- Get AI-based placement guidance



## Features



### Authentication



- User registration

- User login

- JWT-based authentication

- Protected API routes

- User-specific task data

- Automatic session handling

- Logout functionality



### Placement Tracker



Preparation is organized into categories:



- DSA

- Coding Practice

- Aptitude

- Courses

- Projects

- Interview Preparation



Users can:



- Add tasks

- Edit tasks

- Delete tasks

- Mark tasks as completed

- Search tasks

- Track category progress

- Track overall progress



### Progress Tracking



The dashboard displays:



- Total tasks

- Completed tasks

- Pending tasks

- Overall completion percentage

- Category-wise completion percentage

- Visual progress bars



### AI Placement Assistant



The AI Assistant uses the student's current placement progress to provide personalized guidance.



It can help with:



- What to study next

- DSA preparation

- Interview preparation

- Placement strategy

- Skill improvement

- Progress-based suggestions



### AI Interview Coach



The Interview Coach allows users to practice interview questions.



It provides AI-generated feedback based on:



- Interview category

- Question

- User's answer



### AI Study Plan Generator



Users can generate personalized study plans by providing:



- Number of days

- Study hours per day

- Preparation focus

- Current placement progress



The AI generates a structured preparation plan.



## AI Architecture



The application uses Groq for AI-powered features in both development and production.



```text

React
   |
Express Backend
   |
Groq API
   |
GPT-OSS 20B






