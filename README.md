# AdaKDS Frontend - Kitchen Display System

Real-time kitchen display system for restaurants. Built with Next.js and Socket.IO for live order management.

## 🚀 Features

- **Real-time Order Display**: Live updates via WebSocket connection
- **Station-based Layout**: Orders organized by kitchen stations
- **Touch-friendly Interface**: Optimized for kitchen tablets and touch screens
- **Order Management**: Bump orders through workflow (New → Preparing → Ready → Complete)
- **Performance Metrics**: Real-time kitchen analytics and rush level indicators
- **Offline Support**: PWA with service worker for offline functionality
- **Sound Notifications**: Audio alerts for order status changes
- **Responsive Design**: Works on tablets, monitors, and mobile devices

## 🏗️ Architecture

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling with custom KDS theme
- **Socket.IO Client** - Real-time WebSocket communication
- **Zustand** - Lightweight state management
- **PWA** - Progressive Web App with offline support

## 🎨 Design System

### Colors
- **Ada Blue (#4d6aff)** - Primary brand color
- **Station Colors**: Hot Kitchen (red), Cold Prep (teal), Grill (yellow), Bar (green)
- **Status Colors**: New (emerald), Preparing (amber), Ready (red), Completed (gray)
- **Priority Colors**: Low (gray), Normal (blue), High (amber), Urgent (red)

### Layout
- **Responsive Grid**: 1-4 columns based on active stations
- **Station Columns**: Vertical order lists with station headers
- **Order Cards**: Compact cards with timing, items, and controls
- **Header Dashboard**: Real-time metrics and connection status

## 🛠️ Development

### Setup
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
npm start
```

### Environment Variables
```env
NEXT_PUBLIC_API_URL=https://api-kds.adasystems.app
NEXT_PUBLIC_WS_URL=wss://api-kds.adasystems.app
NEXT_PUBLIC_RESTAURANT_ID=demo-restaurant
NEXT_PUBLIC_AUTH_URL=https://auth.adasystems.app
```

## 📱 Components

### Core Components
- `KDSDisplay` - Main orchestration component
- `OrderCard` - Individual order display with controls
- `StationColumn` - Station-based order grouping
- `KDSHeader` - Dashboard header with metrics

### UI Components
- `Button` - Consistent button styling
- `Loading` - Kitchen-themed loading states

### Hooks
- `useSocket` - WebSocket connection and event handling
- `useKDSStore` - Zustand store with selectors

## 🔄 Real-time Events

### Socket.IO Events Handled
- `order_status_updated` - Order status changes
- `order_bumped` - Order workflow progression
- `station_updated` - Station configuration changes
- `display_config_updated` - Display settings updates
- `test_alert` - Test notifications
- `force_refresh` - Force page refresh

### API Integration
- **Orders API**: Get, update, bump, analytics
- **Stations API**: Get, create, update station configs
- **Display API**: Get/update display configuration

## 🏪 Kitchen Workflow

### Order Statuses
1. **New** → Fresh order, needs to start cooking
2. **Preparing** → Currently being prepared
3. **Ready** → Finished, ready for pickup/serve
4. **Completed** → Order fulfilled and cleared

### Station Organization
- **Hot Kitchen**: Pizza, pasta, hot dishes
- **Cold Prep**: Salads, cold appetizers, desserts
- **Grill**: Grilled meats, vegetables
- **Bar**: Drinks, cocktails, beverages

### Touch Controls
- **Bump Button**: Move order to next status
- **Complete Button**: Mark order as done
- **Quick Actions**: One-tap order management

## 📊 Performance Features

### Metrics Tracked
- Total active orders
- Orders by status (new, preparing, ready)
- Overdue order alerts
- Average preparation time
- Station capacity utilization

### Rush Level Indicators
- **Normal**: 0-4 active orders (green)
- **Moderate**: 5-9 active orders (yellow)
- **High**: 10-14 active orders (orange)
- **Extreme**: 15+ active orders (red)

## 🔊 Audio System

### Sound Notifications
- **New Order**: High pitch ding
- **Order Ready**: Bell sound
- **Order Bump**: Pleasant progression sound
- **Overdue Alert**: Urgent alert tone

### Audio Controls
- Volume adjustment in settings
- Enable/disable sound notifications
- Different tones for different events

## 📱 PWA Features

### Offline Support
- Service worker for static asset caching
- Offline fallback pages
- Background sync for order updates

### Installation
- Add to home screen capability
- Full-screen display mode
- App-like experience on tablets

## 🔐 Security

### Authentication
- Integration with AdaAuth SSO system
- Restaurant-specific access control
- Secure WebSocket connections

### Data Protection
- No sensitive customer data stored locally
- Real-time data only in memory
- Secure API communication

## 🚀 Deployment

### Vercel Deployment
```bash
# Deploy to Vercel
vercel --prod

# Custom domain setup
vercel domains add kds.adasystems.app
```

### Environment Setup
- Production API endpoint
- WebSocket URL configuration
- Restaurant ID configuration

## 📈 Business Integration

### L'Osteria Integration
- Restaurant ID: Connected to existing AdaMenu customer
- Station Setup: Hot Kitchen, Cold Prep, Grill, Bar
- Order Import: Real orders from AdaMenu system

### Pricing Model
- **Premium Add-on**: €150-250/month to AdaMenu subscription
- **Value Proposition**: Replace paper tickets, reduce kitchen errors
- **ROI**: Faster service, reduced mistakes, better customer experience

## 🔧 Configuration

### Display Settings
- Theme: Dark/Light mode
- Refresh interval: 30s/60s/2m
- Layout: 1-4 column grid
- Sound: Enable/disable + volume
- Auto-bump: Ready orders after delay

### Station Configuration
- Station colors and names
- Capacity settings
- Order routing rules
- Display order

## 🆘 Troubleshooting

### Common Issues
- **WebSocket disconnection**: Check network and API URL
- **Orders not updating**: Verify restaurant ID and API keys
- **Performance issues**: Check device memory and browser
- **Sound not working**: Check browser audio permissions

### Debug Mode
- Browser dev tools for WebSocket monitoring
- Console logs for API errors
- Network tab for request debugging

## 📞 Support

Part of the Ada Systems restaurant platform. For technical support:
- Backend API: `https://api-kds.adasystems.app/api-docs`
- Health Check: `https://api-kds.adasystems.app/health`
- Repository: `https://github.com/julienmatondotezolo/AdaKDS`

## 🔮 Future Features

### Planned Enhancements
- Voice commands for hands-free operation
- Order photos and allergen information
- Integration with kitchen timers
- Staff performance analytics
- Multi-language support
- Kitchen printer integration