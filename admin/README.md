# Admin Panel - Parfums App

A comprehensive admin dashboard for managing the Parfums e-commerce application.

## Features

### 📊 Dashboard
- Overview statistics (Total Parfums, Orders, Users, Revenue)
- Recent orders display
- Quick stats with trends

### 🌹 Parfums Management
- View all parfums
- Add new parfums
- Edit existing parfums
- Delete parfums
- Manage stock levels

### 📦 Orders Management
- View all orders
- Update order status
- Track order details
- Customer information

### 👥 Users Management
- View all users
- User statistics
- Order history per user
- User details

## Access

### Login Credentials
- **Email**: `admin@parfums.com`
- **Password**: `admin123`

## How to Use

1. **Open Admin Panel**
   ```
   Open myApp/admin/index.html in your browser
   ```

2. **Login**
   - Enter admin credentials
   - Click Login

3. **Navigate**
   - Use sidebar menu to switch between sections
   - Dashboard shows overview
   - Manage parfums, orders, and users

## File Structure

```
admin/
├── index.html      # Main HTML file
├── styles.css      # Styling
├── app.js          # Application logic
└── README.md       # This file
```

## Features Breakdown

### Dashboard
- Real-time statistics
- Recent orders list
- Revenue tracking
- User growth metrics

### Parfums Management
- Add new parfums with details
- Edit existing parfums
- Delete parfums
- View stock levels
- Search and filter

### Orders Management
- View all orders
- Update order status (Confirmed, In Transit, Delivered)
- Customer details
- Order history

### Users Management
- View all registered users
- User statistics
- Order count per user
- Join date tracking

## API Integration

The admin panel connects to the backend API at:
```
http://192.168.1.4:8890/api
```

### Endpoints Used
- `GET /api/parfums` - Get all parfums
- `GET /api/commandes/:userId` - Get orders
- `POST /api/parfums` - Add parfum (coming soon)
- `PUT /api/parfums/:id` - Update parfum (coming soon)
- `DELETE /api/parfums/:id` - Delete parfum (coming soon)

## Styling

The admin panel features:
- Modern gradient design
- Responsive layout
- Smooth animations
- Professional color scheme
- Mobile-friendly interface

## Future Enhancements

- [ ] Real-time data updates
- [ ] Advanced filtering and search
- [ ] Export reports (PDF, Excel)
- [ ] User activity logs
- [ ] Sales analytics
- [ ] Inventory alerts
- [ ] Email notifications
- [ ] Multi-language support

## Security Notes

⚠️ **Important**: This is a basic admin panel. For production:
- Implement proper authentication
- Use JWT tokens
- Add role-based access control
- Validate all inputs
- Use HTTPS
- Implement rate limiting
- Add audit logs

## Support

For issues or questions, contact the development team.
