# Music Player

A full-stack music streaming application built with modern web technologies. This project provides features similar to SoundCloud, allowing users to upload, listen to, and organize music.

## Features

- **User Authentication**: Secure sign-up and sign-in with Clerk.
- **User Profiles**: View and manage user profiles.
- **Audio Uploading & Streaming**: Upload music files and stream them with a persistent player.
- **Playlist Management**: Create, view, and manage personal playlists.
- **Song Liking**: Like and keep track of your favorite songs.
- **Search Functionality**: Search for songs and artists.
- **Custom Queue Management**: Manage the currently playing song queue.

## Tech Stack

### Frontend
- **Framework**: [Next.js](https://nextjs.org/) (with Turbopack)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **UI Library**: [React](https://react.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Component Library**: [HeroUI](https://heroui.dev/)
- **State Management**: React Context API

### Backend
- **Runtime**: [Node.js](https://nodejs.org/)
- **Framework**: Next.js API Routes
- **Database**: [PostgreSQL](https://www.postgresql.org/)
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/)
- **Database Hosting**: [Neon](https://neon.tech/)

### Services
- **Authentication**: [Clerk](https://clerk.com/)
- **File Storage**: [UploadThing](https://uploadthing.com/)

### Tooling
- **Package Manager**: [Bun](https://bun.sh/)
- **Linting & Formatting**: [Biome](https://biomejs.dev/)
- **Database Migrations**: Drizzle Kit

## Getting Started

Follow these instructions to get the project up and running on your local machine.

### Prerequisites

- [Node.js](https://nodejs.org/en/download/) (v20 or higher recommended)
- [Bun](https://bun.sh/docs/installation)
- A [Neon](https://neon.tech/) account for the PostgreSQL database.
- A [Clerk](https://clerk.com/) account for authentication.
- An [UploadThing](https://uploadthing.com/) account for file storage.

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/music-player.git
    cd music-player
    ```

2.  **Install dependencies:**
    ```bash
    bun install
    ```

3.  **Set up environment variables:**
    -   Create a `.env` file in the root of the project by copying the example file:
        ```bash
        cp .env.example .env
        ```
    -   Fill in the required values in the `.env` file. See the [Environment Variables](#environment-variables) section for more details.

4.  **Run database migrations:**
    ```bash
    bun drizzle-kit push
    ```

5.  **Run the development server:**
    ```bash
    bun run dev
    ```

The application should now be running at `http://localhost:3000`.

## Environment Variables

You need to create a `.env` file in the project root and add the following variables. You can get these values from your Neon, Clerk, and UploadThing dashboards.

```
# Neon Database Connection String
DATABASE_URL="your_database_url"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="your_clerk_publishable_key"
CLERK_SECRET_KEY="your_clerk_secret_key"
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/"
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/"

# Clerk Webhooks
CLERK_WEBHOOK_SECRET="your_clerk_webhook_secret"

# UploadThing
UPLOADTHING_SECRET="your_uploadthing_secret"
UPLOADTHING_APP_ID="your_uploadthing_app_id"
```

## Available Scripts

-   `bun run dev`: Starts the development server with Turbopack.
-   `bun run build`: Builds the application for production.
-   `bun run start`: Starts the production server.
-   `bun run lint`: Checks the code for linting issues using Biome.
-   `bun run format`: Formats the code using Biome.

## Project Structure

Here is a high-level overview of the project's directory structure:

```
.
├── app/                  # Next.js App Router pages and API routes
├── assets/               # Static image assets
├── components/           # Reusable React components
├── lib/                  # Shared libraries, utilities, and services
│   ├── data/             # Data fetching logic
│   ├── db/               # Drizzle ORM schema and configuration
│   ├── player-context.tsx # Global state for the music player
│   └── plugins/          # Additional plugins
├── public/               # Publicly accessible files
├── utils/                # Utility functions
├── .env.example          # Example environment variables
├── drizzle.config.ts     # Drizzle Kit configuration
├── next.config.ts        # Next.js configuration
└── package.json          # Project dependencies and scripts
```

## License

This project is licensed under the MIT License.
