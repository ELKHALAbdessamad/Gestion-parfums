# Admin Panel Setup Guide

## Quick Start

### 1. Access the Admin Panel

**Option A: Direct File Access**
```
Open: myApp/admin/index.html in your web browser
```

**Option B: Using a Local Server**
```bash
cd myApp/admin
python -m http.server 8000
# Then open: http://localhost:8000
```

### 2. Login

Use these credentials:
- **Email**: `admin@parfums.com`
- **Password**: `admin123`

### 3. Navigate the Dashboard

The admin panel has 4 main sections:

#### 📊 Dashboard
- View key statistics
- See recent orders
- Monitor revenue
- Track user growth

#### 🌹 Parfums Management
- View all parfums
- Add new parfums
- Edit existing parfums
- Delete parfums
- Manage inventory

#### 📦 Orders Management
- View all orders
- Update order status
- Track deliveries
- View customer details

#### 👥 Users Management
- View all users
- Check user statistics
- See order history
- Track user activity

## Features

### Dashboard Statistics
- **Total Parfums**: Number of products in catalog
- **Total Orders**: Number of orders placed
- **Total Users**: Number of registered users
- **Revenue**: Total sales amount

### Parfums Management
- Add new parfums with:
  - Name
  - Brand
  - Price
  - Stock quantity
  - Description
- Edit existing parfums
- Delete parfums
- View all parfums in table format

### Orders Management
- View all orders with:
  - Order ID
  - Customer name
  - Number of items
  - Total amount
  - Order status
  - Order date
- Update order status
- View order details

### Users Management
- View all users with:
  - User ID
  - Name
  - Email
  - Join date
  - Number of orders
- View user details
- Track user activity

## Keyboard Shortcuts

- `Ctrl + D` - Go to Dashboard
- `Ctrl + P` - Go to Parfums
- `Ctrl + O` - Go to Orders
- `Ctrl + U` - Go to Users

## Tips & Tricks

1. **Quick Add**: Click "+ Add Parfum" button to quickly add new products
2. **Search**: Use browser's Ctrl+F to search within tables
3. **Export**: Copy table data and paste into Excel
4. **Refresh**: Press F5 to refresh data
5. **Logout**: Click "Logout" button to exit admin panel

## Troubleshooting

### Admin Panel Won't Load
- Check if backend server is running
- Verify API URL is correct (192.168.1.4:8890)
- Clear browser cache and reload

### Data Not Showing
- Ensure backend is running
- Check network connection
- Verify database has data
- Check browser console for errors

### Login Issues
- Verify credentials are correct
- Check if localStorage is enabled
- Clear browser cookies and try again

## API Connection

The admin panel connects to:
```
http://192.168.1.4:8890/api
```

Make sure:
1. Backend server is running
2. MySQL database is connected
3. API endpoints are accessible
4. CORS is enabled

## File Locations

```
myApp/
├── admin/
│   ├── index.html      # Main admin page
│   ├── styles.css      # Styling
│   ├── app.js          # Application logic
│   └── README.md       # Admin documentation
└── ADMIN_SETUP.md      # This file
```

## Next Steps

1. ✅ Open admin panel
2. ✅ Login with credentials
3. ✅ Explore dashboard
4. ✅ Manage parfums
5. ✅ Track orders
6. ✅ Monitor users

## Support

For issues or feature requests, contact the development team.

---

**Version**: 1.0  
**Last Updated**: December 2024  
**Status**: Production Ready
