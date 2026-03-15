# AdaKDS Database Setup & Testing

## 🗄️ Database Migration SQL

Run this SQL in your Supabase SQL editor to create the required tables:

```sql
-- Create orders table for KDS
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number VARCHAR(50) NOT NULL UNIQUE,
  restaurant_id VARCHAR(100) NOT NULL,
  published_menu_id VARCHAR(100),
  status VARCHAR(20) NOT NULL DEFAULT 'CREATED',
  customer_name VARCHAR(200) NOT NULL,
  customer_type VARCHAR(20) DEFAULT 'dine_in',
  customer_phone VARCHAR(50),
  customer_email VARCHAR(200),
  table_number VARCHAR(20),
  source VARCHAR(50) DEFAULT 'ada-menu-builder',
  payment_method VARCHAR(50),
  special_instructions TEXT,
  total_price DECIMAL(10,2) DEFAULT 0,
  estimated_prep_time INTEGER DEFAULT 10,
  created_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  estimated_ready_time TIMESTAMP WITH TIME ZONE,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  station VARCHAR(50) DEFAULT 'hot_kitchen',
  priority VARCHAR(20) DEFAULT 'normal'
);

-- Create published_menus table for menu validation
CREATE TABLE IF NOT EXISTS published_menus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id VARCHAR(100) NOT NULL,
  menu_id VARCHAR(100) NOT NULL UNIQUE,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  valid_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  valid_until TIMESTAMP WITH TIME ZONE,
  qr_code_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create menu_items table for item details
CREATE TABLE IF NOT EXISTS menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  published_menu_id UUID REFERENCES published_menus(id) ON DELETE CASCADE,
  menu_item_id VARCHAR(100) NOT NULL,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  category VARCHAR(100),
  estimated_prep_time INTEGER DEFAULT 10,
  is_available BOOLEAN DEFAULT true,
  station VARCHAR(50) DEFAULT 'hot_kitchen',
  allergens TEXT[],
  dietary_restrictions TEXT[],
  ingredients TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert demo published menu for L'Osteria
INSERT INTO published_menus (restaurant_id, menu_id, name, description, is_active, valid_from, valid_until, qr_code_url)
VALUES (
  'demo-restaurant',
  'menu_ada_losteria_demo',
  'L''Osteria Demo Menu',
  'Demo menu for AdaKDS integration testing',
  true,
  NOW() - INTERVAL '1 day',
  NOW() + INTERVAL '30 days',
  'https://ada-menu-builder.vercel.app/qr/menu_ada_losteria_demo'
) ON CONFLICT (menu_id) DO NOTHING;

-- Insert demo menu items for L'Osteria
INSERT INTO menu_items (published_menu_id, menu_item_id, name, description, price, category, estimated_prep_time, station, allergens)
VALUES 
(
  (SELECT id FROM published_menus WHERE menu_id = 'menu_ada_losteria_demo'),
  'item_pizza_margherita',
  'Pizza Margherita',
  'Tomato sauce, mozzarella, fresh basil',
  14.50,
  'pizza',
  12,
  'hot_kitchen',
  ARRAY['gluten', 'dairy']
),
(
  (SELECT id FROM published_menus WHERE menu_id = 'menu_ada_losteria_demo'),
  'item_spaghetti_carbonara',
  'Spaghetti Carbonara',
  'Pasta with eggs, pecorino romano, pancetta',
  16.00,
  'pasta',
  10,
  'hot_kitchen',
  ARRAY['gluten', 'dairy', 'eggs']
),
(
  (SELECT id FROM published_menus WHERE menu_id = 'menu_ada_losteria_demo'),
  'item_caesar_salad',
  'Caesar Salad',
  'Romaine lettuce, caesar dressing, parmesan, croutons',
  12.00,
  'salad',
  5,
  'cold_prep',
  ARRAY['gluten', 'dairy']
),
(
  (SELECT id FROM published_menus WHERE menu_id = 'menu_ada_losteria_demo'),
  'item_tiramisu',
  'Tiramisu',
  'Traditional Italian dessert with coffee and mascarpone',
  8.50,
  'dessert',
  2,
  'cold_prep',
  ARRAY['dairy', 'eggs']
),
(
  (SELECT id FROM published_menus WHERE menu_id = 'menu_ada_losteria_demo'),
  'item_wine_chianti',
  'Chianti Classico',
  'Traditional Tuscan red wine',
  8.00,
  'wine',
  1,
  'bar',
  ARRAY['sulfites']
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_orders_restaurant_status ON orders(restaurant_id, status);
CREATE INDEX IF NOT EXISTS idx_orders_created_time ON orders(created_time);
CREATE INDEX IF NOT EXISTS idx_published_menus_restaurant ON published_menus(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_menu ON menu_items(published_menu_id);

-- Enable RLS (Row Level Security) if needed
-- ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE published_menus ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
```

## 🧪 Test Order Submission

### Valid Order (Should Work):
```bash
curl -X POST https://api-kds.adasystems.app/api/v1/restaurants/demo-restaurant/orders/ada-menu \
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

### Another Valid Order:
```bash
curl -X POST https://api-kds.adasystems.app/api/v1/restaurants/demo-restaurant/orders/ada-menu \
  -H "Content-Type: application/json" \
  -H "Referer: https://ada-menu-builder.vercel.app" \
  -d '{
    "menu_id": "menu_ada_losteria_demo",
    "source": "ada-menu-builder",
    "customer_name": "Table 8",
    "customer_type": "dine_in",
    "table_number": "8",
    "order_items": [
      {
        "menu_item_id": "item_spaghetti_carbonara",
        "name": "Spaghetti Carbonara",
        "quantity": 1,
        "special_requests": "Extra pepper",
        "price": 16.00
      },
      {
        "menu_item_id": "item_caesar_salad",
        "name": "Caesar Salad",
        "quantity": 1,
        "special_requests": "Dressing on the side",
        "price": 12.00
      },
      {
        "menu_item_id": "item_tiramisu",
        "name": "Tiramisu",
        "quantity": 1,
        "price": 8.50
      }
    ]
  }'
```

## 📱 Frontend URLs
- **Production**: https://ada-kds.vercel.app  
- **Local**: http://localhost:5006

After running the SQL migration, the orders should appear in real-time on the KDS display!