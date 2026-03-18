# JF Collections - Static Bag Ecommerce Website

A static ecommerce website for JF Collections showcasing bag products with an administrative panel for content management.

## Project Structure

```
/
├── public/                  # Static website files
│   ├── index.html          # Product catalog page
│   ├── product/            # Individual product pages
│   ├── about.html
│   ├── contact.html
│   ├── css/                # Stylesheets
│   ├── js/                 # Client-side JavaScript
│   ├── data/               # Product data (JSON)
│   └── images/             # Product images
├── admin/                   # Admin panel
│   ├── index.html          # Admin dashboard
│   ├── login.html          # Admin login page
│   ├── css/                # Admin styles
│   └── js/                 # Admin JavaScript
├── server/                  # Admin backend
│   ├── api/                # API endpoints
│   ├── middleware/         # Express middleware
│   ├── utils/              # Utility functions
│   └── server.js           # Express server
└── tests/                   # Test files
    ├── properties/         # Property-based tests
    └── unit/               # Unit tests
```

## Installation

```bash
npm install
```

## Development

Start the admin backend server:
```bash
npm run dev
```

## Testing

Run all tests:
```bash
npm test
```

Run tests with coverage:
```bash
npm run test:coverage
```

## Linting

```bash
npm run lint
```

## Technology Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Node.js, Express
- **Authentication**: JWT, bcrypt
- **Image Processing**: Sharp
- **Testing**: Jest, fast-check
