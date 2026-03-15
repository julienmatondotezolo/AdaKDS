# AdaKDS Real-Time Order Testing

## Backend Status
- **Backend**: http://localhost:5005
- **Frontend**: http://localhost:5007
- **Restaurant ID**: demo-restaurant

## Available Mock Menu Items
- `item_pizza_margherita` - Pizza Margherita (€14.50) - hot_kitchen
- `item_pizza_prosciutto` - Pizza Prosciutto (€18.00) - hot_kitchen  
- `item_caesar_salad` - Caesar Salad (€12.00) - cold_prep
- `item_tiramisu` - Tiramisu (€8.50) - cold_prep
- `item_wine_chianti` - Chianti Classico (€8.00) - bar

## Test Command 1: ✅ VALID ORDER (Should Work)

```bash
curl -X POST http://localhost:5005/api/v1/restaurants/demo-restaurant/orders/ada-menu \
  -H "Content-Type: application/json" \
  -H "Referer: https://ada-menu-builder.vercel.app" \
  -d '{
    "menu_id": "menu_ada_losteria_demo",
    "source": "ada-menu-builder",
    "referrer": "https://ada-menu-builder.vercel.app/qr/menu_ada_losteria_demo",
    "customer_name": "Table 12",
    "customer_type": "dine_in",
    "table_number": "12",
    "order_items": [
      {
        "menu_item_id": "item_pizza_margherita",
        "name": "Pizza Margherita",
        "quantity": 2,
        "special_requests": "Extra basil, light cheese",
        "price": 14.50
      },
      {
        "menu_item_id": "item_wine_chianti", 
        "name": "Chianti Classico",
        "quantity": 1,
        "price": 8.00
      }
    ],
    "special_instructions": "Customer prefers thin crust",
    "payment_method": "card"
  }'
```

## Test Command 2: ❌ INVALID ORDER (Should Fail)

```bash
curl -X POST http://localhost:5005/api/v1/restaurants/demo-restaurant/orders/ada-menu \
  -H "Content-Type: application/json" \
  -H "Referer: https://ada-menu-builder.vercel.app" \
  -d '{
    "menu_id": "menu_ada_losteria_demo",
    "source": "ada-menu-builder", 
    "referrer": "https://ada-menu-builder.vercel.app/qr/menu_ada_losteria_demo",
    "customer_name": "Table 15",
    "customer_type": "dine_in",
    "table_number": "15",
    "order_items": [
      {
        "menu_item_id": "item_nonexistent_burger",
        "name": "Mysterious Burger",
        "quantity": 1,
        "special_requests": "Make it appear magically",
        "price": 25.00
      },
      {
        "menu_item_id": "item_fake_drink",
        "name": "Unicorn Tears",
        "quantity": 2,
        "price": 15.00
      }
    ],
    "special_instructions": "Items that do not exist in menu",
    "payment_method": "magic"
  }'
```

## Expected Results

### Valid Order (Test 1):
- **HTTP Status**: 201 Created
- **Response**: Order accepted with generated order ID and number
- **Frontend**: Should show new order cards in Kitchen Display in real-time
- **Stations**: Pizza goes to Hot Kitchen, Wine goes to Bar

### Invalid Order (Test 2):  
- **HTTP Status**: 400 Bad Request or 404 Not Found
- **Response**: Error message about invalid menu items
- **Frontend**: No new orders should appear
- **Reason**: Menu items don't exist in demo menu

## Monitoring
- **Backend Logs**: Check console for order processing messages
- **Frontend**: Open http://localhost:5007 to see real-time updates
- **WebSocket**: Orders should appear instantly via Socket.IO