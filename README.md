# Road Trip Booking Platform

A modern car rental booking platform built with React, TypeScript, and Node.js.

## Features

- User authentication and registration
- Car browsing and booking
- Admin dashboard for car and user management
- Responsive design with modern UI components
- Real-time booking system

## Technologies Used

- **Frontend**: React, TypeScript, Vite, Tailwind CSS, shadcn/ui
- **Backend**: Node.js, Express
- **Database**: (Configure as needed)

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd road-trip-booking-platform
```

2. Install dependencies:
```bash
# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../server
npm install
```

3. Start the development servers:

```bash
# Start frontend (from frontend directory)
npm run dev

# Start backend (from server directory)
npm start
```

The frontend will be available at `http://localhost:8080` and the backend at `http://localhost:3000`.

## Project Structure

```
road-trip-booking-platform/
├── frontend/          # React frontend application
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Page components
│   │   ├── services/    # API services
│   │   └── hooks/       # Custom React hooks
│   └── public/          # Static assets
└── server/             # Node.js backend
    └── index.js        # Express server
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.
