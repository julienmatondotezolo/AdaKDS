# AdaKDS Production Testing

## 🌐 Production URLs
- **Backend**: https://api-kds.adasystems.app
- **Frontend**: https://ada-kds.vercel.app

## 🧪 Test Commands for Production

### Test 1: ✅ Valid Order (Should Work)
```bash
curl -X POST https://api-kds.adasystems.app/api/v1/restaurants/demo-restaurant/orders/ada-menu \
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
        "special_requests": "Extra basil",
        "price": 14.50
      },
      {
        "menu_item_id": "item_wine_chianti",
        "name": "Chianti Classico",
        "quantity": 1,
        "price": 8.00
      }
    ],
    "special_instructions": "Customer prefers thin crust"
  }'
```

### Test 2: ❌ Invalid Order (Should Fail)
```bash
curl -X POST https://api-kds.adasystems.app/api/v1/restaurants/demo-restaurant/orders/ada-menu \
  -H "Content-Type: application/json" \
  -H "Referer: https://ada-menu-builder.vercel.app" \
  -d '{
    "menu_id": "menu_ada_losteria_demo", 
    "source": "ada-menu-builder",
    "customer_name": "Table 15",
    "customer_type": "dine_in",
    "order_items": [
      {
        "menu_item_id": "item_nonexistent_burger",
        "name": "Mysterious Burger",
        "quantity": 1,
        "price": 25.00
      }
    ]
  }'
```

## 📱 Testing Steps
1. **Open Frontend**: https://ada-kds.vercel.app
2. **Run Valid Order**: Should see new order appear in real-time
3. **Run Invalid Order**: Should get error response, no order appears
4. **Check Stations**: Pizza → Hot Kitchen, Wine → Bar

## 🎯 Expected Results
- **Valid Order**: 201 Created + Real-time display in KDS
- **Invalid Order**: 400/404 Error + No display
- **Real-time Updates**: Socket.IO working between backend/frontend

## 🔍 Available Demo Menu Items
- item_pizza_margherita (€14.50) - Hot Kitchen
- item_pizza_prosciutto (€18.00) - Hot Kitchen
- item_caesar_salad (€12.00) - Cold Prep
- item_tiramisu (€8.50) - Cold Prep  
- item_wine_chianti (€8.00) - Bar