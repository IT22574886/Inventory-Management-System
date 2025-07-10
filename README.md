# Inventory Management & E-commerce System

A full-stack web application combining inventory management with online shopping capabilities, built with Spring Boot backend and React frontend.

## 🚀 Features

### Backend (Spring Boot)

- **RESTful API** with role-based authentication (Admin/Customer)
- **Inventory Management**: CRUD operations for products with image uploads
- **Smart Stock Tracking**: Automatic status updates (In Stock/Low Stock/Out of Stock)
- **Order Processing**: Complete e-commerce order management
- **User Management**: Secure authentication and authorization

### Frontend (React)

- **Responsive UI** with Bootstrap 5.3.7
- **Role-based Access**: Different interfaces for Admin and Customer
- **Shopping Experience**: Product browsing, cart management, checkout
- **Admin Dashboard**: Inventory management with real-time updates

## 🛠️ Technology Stack

### Backend

- **Java 21** with Spring Boot 3.4.4
- **Spring Data JPA** with Hibernate
- **MySQL** Database
- **Maven** for dependency management

### Frontend

- **React 19** with React Router
- **Bootstrap 5.3.7** for responsive design
- **Axios** for API communication
- **Context API** for state management

## 📁 Project Structure

```
Inventory management/
├── demo/                    # Spring Boot Backend
│   ├── src/main/java/
│   │   └── com/example/demo/
│   │       ├── controller/  # REST Controllers
│   │       ├── model/       # JPA Entities
│   │       ├── repository/  # Data Access Layer
│   │       └── exception/   # Custom Exceptions
│   └── src/main/resources/
│       └── application.properties
├── frontend-/              # React Frontend
│   ├── src/
│   │   ├── Components/     # React Components
│   │   ├── context/        # Auth Context
│   │   └── App.js
│   └── package.json
└── README.md
```

## 🔧 Setup Instructions

### Prerequisites

- Java 21
- Node.js 16+
- MySQL Database
- Maven

### Backend Setup

1. Navigate to the `demo` directory
2. Configure database in `application.properties`
3. Run: `mvn spring-boot:run`

### Frontend Setup

1. Navigate to the `frontend-` directory
2. Install dependencies: `npm install`
3. Start development server: `npm start`

## 🔐 Authentication

- **Admin Role**: Full access to inventory management
- **Customer Role**: Shopping and order placement
- **Registration**: New users default to Customer role

## 📝 API Endpoints

### Authentication

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Inventory Management (Admin Only)

- `GET /inventory` - Get all items
- `POST /inventory` - Add new item
- `PUT /inventory/{id}` - Update item
- `DELETE /inventory/{id}` - Delete item
- `POST /inventory/itemImg` - Upload item image

### Shopping (Public/Customer)

- `GET /api/shop/products` - Get available products
- `POST /api/shop/order` - Place order
- `GET /api/shop/orders/{userEmail}` - Get user orders

## 🎯 Key Features

1. **Real-time Inventory Tracking**
2. **Secure Role-based Access**
3. **Image Upload System**
4. **Shopping Cart Management**
5. **Order Processing**
6. **Responsive Design**

## 📸 Screenshots

_Add screenshots of your application here_

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License.

---

**Built with ❤️ using Spring Boot and React**
