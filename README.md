# Collaborative To-Do List


This is a **collaborative task management web application** built with Next.js 14, TypeScript, and Tailwind CSS. Here's how it works and its key features:

### Core Functionality

- **User Authentication**: Simple name-based login with session persistence across browser refreshes
- **Task Management**: Users can add, complete, and delete tasks with real-time updates
- **Collaborative Workspace**: Multiple users can work on shared task lists simultaneously
- **Task Ownership**: Clear separation between your own tasks and team members' tasks


### Key Features

- **Real-time Synchronization**: Tasks update instantly across browser tabs using BroadcastChannel API
- **Active Members Display**: Dropdown showing all currently active team members with their status
- **User Profile Management**: Profile dropdown with user info and logout functionality
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Session Persistence**: Maintains user login state and data across page refreshes


### User Interface

- **Clean Task Sections**: "My Tasks" and "Team Tasks" are displayed separately for better organization
- **Navigation Bar**: Contains active members dropdown, user profile menu, and connection status
- **Modern UI**: Built with shadcn/ui components featuring consistent styling and smooth interactions
- **Visual Feedback**: Loading states, hover effects, and clear visual indicators for task ownership


### Technical Architecture

- **React Context API**: Manages global state for tasks, users, and authentication
- **Local Storage**: Persists user sessions and task data
- **BroadcastChannel**: Enables real-time updates across browser tabs
- **TypeScript**: Full type safety with proper interfaces for users and tasks


The app demonstrates real-time collaboration features with dummy data and provides a solid foundation that could easily be extended with actual backend services for true multi-user functionality.

## Features

- **Real-time Collaboration**: Multiple users can add, complete, and delete tasks simultaneously
- **Live Presence**: See who's currently online with colored avatars
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Type Safety**: Built with TypeScript for robust development
- **Modern UI**: Clean, minimal design with Tailwind CSS

## Tech Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **AirState SDK** (@airstate/client and @airstate/react)
- **Lucide React** (Icons)

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- AirState account and App ID

### Installation

1. Clone the repository:
\`\`\`bash
git clone <repository-url>
cd collaborative-todo-app
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
# or
yarn install
\`\`\`

3. Set up environment variables:
\`\`\`bash
cp .env.example .env.local
\`\`\`

4. Edit `.env.local` and add your AirState App ID:
\`\`\`env
NEXT_PUBLIC_AIRSTATE_APP_ID=your_actual_app_id_here
\`\`\`

### Getting Your AirState App ID

1. Visit [AirState Dashboard](https://airstate.dev/dashboard)
2. Create a new app or select an existing one
3. Copy the App ID from your dashboard
4. Paste it into your `.env.local` file

### Running the Application

\`\`\`bash
npm run dev
# or
yarn dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. **Join Session**: Enter your name to join the collaborative workspace
2. **Add Tasks**: Use the input form to create new tasks with optional descriptions
3. **Manage Tasks**: Check off completed tasks or delete them entirely
4. **See Collaborators**: View other users online in the presence bar
5. **Real-time Sync**: All changes sync instantly across all connected clients

## Project Structure

\`\`\`
├── app/
│   ├── layout.tsx          # Root layout with fonts and analytics
│   ├── page.tsx            # Main application page
│   └── globals.css         # Global styles and Tailwind configuration
├── components/
│   ├── AddTaskForm.tsx     # Form component for adding new tasks
│   ├── TaskList.tsx        # List component displaying all tasks
│   ├── PresenceBar.tsx     # Shows online users and connection status
│   └── ConnectionStatus.tsx # Connection indicator component
├── lib/
│   └── airstate.ts         # AirState client configuration and utilities
├── types/
│   └── index.ts            # TypeScript type definitions
└── README.md
\`\`\`

## Key Components

### TaskList
- Displays all tasks sorted by completion status
- Shows task creator information
- Handles task completion and deletion
- Responsive design for mobile devices

### AddTaskForm
- Expandable form for adding tasks
- Supports keyboard shortcuts (Cmd/Ctrl + Enter)
- Optional description field

### PresenceBar
- Shows online user count
- Displays user avatars with initials
- Live connection indicator
- Responsive avatar sizing

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add your environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_AIRSTATE_APP_ID`
4. Deploy!

### Other Platforms

The app can be deployed to any platform that supports Next.js applications. Make sure to set the required environment variables.

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_AIRSTATE_APP_ID` | Your AirState application ID | Yes |

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues related to:
- **AirState**: Visit [AirState Documentation](https://docs.airstate.dev)
- **Next.js**: Visit [Next.js Documentation](https://nextjs.org/docs)
- **This Project**: Open an issue in this repository
