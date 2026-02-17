# Bbrains 🎓

A comprehensive Learning Management System with integrated gamification features, marketplace functionality, and digital wallet system.

## 🌟 Features

### Academic Management
- Course creation and enrollment
- Assignment management with submissions
- Automated grading system
- Announcements and notifications
- Student performance tracking

### Gamification System
- XP and leveling system
- Achievement badges
- Leaderboards (weekly, monthly, all-time)
- Progress tracking and milestones

### Marketplace
- Product catalog with search
- Shopping cart functionality
- Secure checkout process
- Order management and tracking

### Digital Wallet
- Virtual currency system
- PIN-protected transactions
- Peer-to-peer transfers
- Transaction history

### Administration
- Multi-role user management (Student, Teacher, Admin, Staff)
- Role-based access control (RBAC)
- Comprehensive audit logging
- College/institution management

## Technology Stack

- **Runtime:** Node.js 18+
- **Framework:** Express.js 5.2
- **Database:** PostgreSQL 14+
- **ORM:** Prisma 7.3
- **Authentication:** JWT with HTTP-only cookies
- **Validation:** Zod
- **Security:** bcrypt for password hashing
- **Language:** JavaScript

## Quick Start

### Prerequisites

- Node.js 18.0.0 or higher
- PostgreSQL 14.0 or higher
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/harshhhh1/Bbrains.git
   cd Bbrains/Backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and configure:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/Bbrains"
   JWT_SECRET="your-secret-key-min-32-characters"
   PORT=3000
   NODE_ENV=development
   ```

4. **Set up the database**
   ```bash
   # Run migrations
   npx prisma migrate dev
   
   # Generate Prisma Client
   npx prisma generate
   
   # (Optional) Seed database with sample data
   npm run db:seed
   ```

5. **Start the server**
   ```bash
   npm start
   ```

The API will be available at `http://localhost:3000`

## Project Structure

```
📁Backend/
├── 📁controllers/        # Request handlers
├── 📁routes/            # API route definitions
├── 📁middleware/        # Express middleware (auth, validation, etc.)
├── 📁services/          # Business logic layer
├── 📁utils/             # Helper functions and utilities
├── 📁prisma/            # Database schema and migrations
├── server.js          # Application entry point
└── package.json       # Dependencies and scripts
```

## Documentation

Comprehensive documentation is available:

- **[API Documentation](https://github.com/harshhhh1/Bbrains/wiki/API-DOCUMENTATION)** - Complete API reference with all endpoints
- **[Technical Documentation](https://github.com/harshhhh1/Bbrains/wiki)** - Architecture, database schema, deployment
- **[Developer Guide](http://github.com/harshhhh1/Bbrains/wiki/Developer-Guide)** - Setup, coding standards, contribution guide

## API Endpoints

### Authentication
- `POST /register` - Create new user account
- `POST /login` - Authenticate user
- `POST /logout` - End user session

### Users
- `GET /user/me` - Get current user profile
- `GET /user/students` - List all students
- `GET /user/teachers` - List all teachers
- `POST /user/claim-daily` - Claim daily rewards

### Academic
- `GET /academic/assignments` - List assignments
- `POST /academic/assignments` - Create assignment
- `POST /academic/submissions` - Submit assignment
- `GET /academic/announcements` - View announcements

### Marketplace
- `GET /market/products` - Browse products
- `POST /market/cart` - Add to cart
- `POST /market/checkout` - Purchase items

### Wallet
- `GET /wallet/me` - Get wallet balance
- `POST /wallet/transfer` - Transfer funds
- `GET /wallet/history` - Transaction history

### More Endpoints
See [API_DOCUMENTATION.md](https://github.com/harshhhh1/Bbrains/wiki/API-DOCUMENTATION) for the complete list of 100+ endpoints.

## Database Schema

The system uses PostgreSQL with 24 main tables:

- **Core:** User, UserDetails, College, Address
- **Academic:** Course, Assignment, Submission, Grade, Enrollment
- **Gamification:** Xp, Level, Achievement, Leaderboard
- **Commerce:** Product, Cart, Order, OrderItem, Wallet, TransactionHistory
- **System:** Role, AuditLog, Announcement

See [TECHNICAL_DOCUMENTATION.md](https://github.com/harshhhh1/Bbrains/wiki) for detailed schema information.

## Security Features

- JWT-based authentication with HTTP-only cookies
- Password hashing with bcrypt (10 salt rounds)
- Role-based access control (RBAC)
- PIN protection for wallet transactions
- Input validation with Zod schemas
- SQL injection prevention via Prisma ORM
- Comprehensive audit logging

## Testing

```bash
# Run tests (coming soon)
npm test

# View database in Prisma Studio
npx prisma studio
```

## Default User Roles

- **Student** - Access courses, submit assignments, use marketplace
- **Teacher** - Create assignments, grade submissions, manage courses
- **Admin** - Full system access, user management, system configuration
- **Staff** - Limited administrative capabilities

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'feat: Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

See [DEVELOPER_GUIDE.md](http://github.com/harshhhh1/Bbrains/wiki/Developer-Guide) for detailed contribution guidelines.

## Scripts

```bash
npm start          # Start development server with nodemon
npm run db:seed    # Seed database with sample data
npx prisma studio  # Open Prisma Studio (database GUI)
npx prisma migrate dev  # Create and run new migration
```

## Troubleshooting

**Port already in use:**
```bash
lsof -i :3000
kill -9 <PID>
```

**Database connection issues:**
- Verify PostgreSQL is running: `pg_isready`
- Check DATABASE_URL in `.env`
- Ensure database exists

**Prisma Client errors:**
```bash
npx prisma generate
```

See [DEVELOPER_GUIDE.md](http://github.com/harshhhh1/Bbrains/wiki/Developer-Guide) for more troubleshooting tips.

## License

This project is licensed under the ISC License.

## Author

**Harsh**
- GitHub: [@harshhhh1](https://github.com/harshhhh1)
- Discord: [golem.uwu](https://discord.com/users/967437862888960020)

## Acknowledgments

- Express.js team for the excellent web framework
- Prisma team for the amazing ORM
- All contributors and supporters of this project

---

**Built with ❤️ for modern education**
