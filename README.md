# BMW Battery Analyzer

A powerful web application for analyzing and visualizing battery test data from CSV files. This tool provides interactive visualization capabilities and data analysis features specifically designed for battery development and testing at BMW Battery Cell Competence Center (BCCC).

# Video Demo
https://drive.google.com/file/d/16MKlxIJn9_ng7d0Ylw4aHPRetkUmMfpf/view?usp=sharing

## 🚀 Features

- **File Management**
  - Upload and process large CSV files
  - Support for various CSV data structures
  - Efficient data handling and processing
  - Automatic data validation

- **Data Visualization**
  - Interactive plots and graphs
  - Multiple visualization types (line plots, scatter plots, etc.)
  - Real-time data rendering
  - Customizable chart parameters

- **Interactive Features**
  - Zoom in/out capabilities
  - Pan across visualizations
  - Dynamic data filtering
  - Customizable axes and legends

- **User Configuration**
  - Configurable chart settings
  - Customizable visualization parameters
  - Save and load user preferences

- **Export Capabilities**
  - Download visualizations as images
  - Export processed data
  - Data analysis reports

## 🛠️ Technology Stack

- **Frontend**
  - React.js with TypeScript (Vite)
  - TailwindCSS for styling
  - Modern UI components
  - Chart visualization libraries

- **Backend**
  - Node.js with TypeScript
  - Express.js
  - Knex.js for database operations
  - File upload handling

- **Database**
  - PostgreSQL
  - Knex.js migrations and seeds
  - Efficient data storage and retrieval

## 📋 Prerequisites

- Node.js (v14.0.0 or higher)
- npm (v6.0.0 or higher)
- PostgreSQL (v12.0 or higher)
- Modern web browser with JavaScript enabled
- Environment variables configured (see .env.example)

## 🔧 Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/haibkhn/bmw-battery-analyzer.git
   cd bmw-battery-analyzer
   ```

2. Install PostgreSQL:
   
   **For macOS:**
   ```bash
   # Using Homebrew
   brew install postgresql@14
   brew services start postgresql@14
   ```

   **For Windows:**
   - Download and install PostgreSQL from [official website](https://www.postgresql.org/download/windows/)
   - Add PostgreSQL bin directory to system PATH

   **For Linux (Ubuntu/Debian):**
   ```bash
   sudo apt update
   sudo apt install postgresql postgresql-contrib
   sudo systemctl start postgresql
   sudo systemctl enable postgresql
   ```

3. Create Database and User:
   ```bash
   # Access PostgreSQL
   psql postgres

   # Create database and user (in psql)
   CREATE DATABASE bmw_battery_db;
   CREATE USER bmw_user WITH ENCRYPTED PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE bmw_battery_db TO bmw_user;
   
   # Exit psql
   \q
   ```

4. Install frontend dependencies:
   ```bash
   cd frontend
   npm install
   ```

5. Install backend dependencies:
   ```bash
   cd ../backend
   npm install
   ```

6. Configure environment variables:
   - Copy `.env.example` to `.env` in the backend directory
   - Update the following variables:
     ```env
     # Database Configuration
     DB_HOST=localhost
     DB_PORT=5432
     DB_NAME=bmw_battery_db
     DB_USER=bmw_user
     DB_PASSWORD=your_password

     # Server Configuration
     PORT=3000
     ```

7. Run database migrations:
   ```bash
   cd backend
   npm run migrate
   
   # Optional: Run seeds if you want sample data
   npm run seed
   ```

8. Start the development servers:

   Backend:
   ```bash
   cd backend
   npm run dev
   ```

   Frontend:
   ```bash
   cd frontend
   npm run dev
   ```

9. Access the application at `http://localhost:5173`

## 💻 Usage

1. **Upload Data**
   - Click the upload button to select your CSV file
   - The system will automatically process and validate the data
   - Supported file types: CSV files with battery test data

2. **Configure Visualization**
   - Select the data columns for X and Y axes
   - Choose the visualization type
   - Adjust chart parameters as needed
   - Configure display settings

3. **Interact with Charts**
   - Use mouse wheel or pinch gestures to zoom
   - Click and drag to pan across the visualization
   - Use the control panel to adjust display settings
   - Filter data based on specific criteria

4. **Export Results**
   - Download visualizations as images
   - Export processed data in various formats
   - Generate analysis reports

## 📁 Project Structure

```
bmw-battery-analyzer/
├── frontend/                # React frontend application
│   ├── src/                # Source files
│   ├── public/             # Static files
│   └── package.json        # Frontend dependencies
├── backend/                # Node.js backend server
│   ├── src/               # Source files
│   ├── migrations/        # Database migrations
│   ├── seeds/            # Database seeds
│   ├── uploads/           # File upload directory
│   └── package.json       # Backend dependencies
└── sample_data/           # Sample CSV files for testing
```

## 🗄️ Database Schema

The application uses the following main tables:

- `users` - User authentication and preferences
- `files` - Uploaded file metadata
- `battery_data` - Processed battery test data
- `configurations` - User visualization configurations

## 🔍 Troubleshooting

### Database Connection Issues

1. Verify PostgreSQL is running:
   ```bash
   # macOS
   brew services list
   
   # Linux
   sudo systemctl status postgresql
   
   # Windows
   services.msc  # Check PostgreSQL service status
   ```

2. Test database connection:
   ```bash
   psql -h localhost -U bmw_user -d bmw_battery_db
   ```

3. Common solutions:
   - Check if PostgreSQL service is running
   - Verify database credentials in `.env`
   - Ensure PostgreSQL is listening on the correct port
   - Check firewall settings

### Migration Issues

If you encounter migration issues:
```bash
# Rollback all migrations
npm run migrate:rollback

# Run migrations again
npm run migrate
```

## 📧 Contact

Project Link: https://github.com/haibkhn/bmw-battery-analyzer

## 🙏 Acknowledgments

- BMW Battery Cell Competence Center (BCCC)
- All contributors and testers