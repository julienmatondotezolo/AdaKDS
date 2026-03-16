#!/usr/bin/env node
/**
 * Simple test script to verify backend API connection
 * Run: node test-backend-connection.js
 */

const API_BASE_URL = 'http://localhost:5005';
const RESTAURANT_ID = 'losteria';

async function testAPI() {
  console.log('🔗 Testing AdaKDS Backend Connection...\n');
  
  // Test health endpoint
  try {
    console.log('1. Testing health endpoint...');
    const healthResponse = await fetch(`${API_BASE_URL}/health`);
    if (healthResponse.ok) {
      const health = await healthResponse.json();
      console.log('✅ Health check passed:', health);
    } else {
      console.log('❌ Health check failed:', healthResponse.status);
    }
  } catch (error) {
    console.log('❌ Health check error:', error.message);
  }

  console.log('');

  // Test orders endpoint
  try {
    console.log('2. Testing orders endpoint...');
    const ordersResponse = await fetch(`${API_BASE_URL}/api/v1/restaurants/${RESTAURANT_ID}/orders`);
    if (ordersResponse.ok) {
      const orders = await ordersResponse.json();
      console.log('✅ Orders endpoint accessible');
      console.log('   Response format:', Object.keys(orders));
      if (orders.orders) {
        console.log('   Number of orders:', orders.orders.length);
        if (orders.orders.length > 0) {
          const firstOrder = orders.orders[0];
          console.log('   First order sample:');
          console.log('   - ID:', firstOrder.id);
          console.log('   - Order Number:', firstOrder.order_number);
          console.log('   - Status:', firstOrder.status);
          console.log('   - Items:', firstOrder.items?.length || 0);
        }
      }
    } else {
      console.log('❌ Orders endpoint failed:', ordersResponse.status);
      const errorText = await ordersResponse.text();
      console.log('   Error:', errorText);
    }
  } catch (error) {
    console.log('❌ Orders endpoint error:', error.message);
  }

  console.log('');

  // Test stations endpoint
  try {
    console.log('3. Testing stations endpoint...');
    const stationsResponse = await fetch(`${API_BASE_URL}/api/v1/restaurants/${RESTAURANT_ID}/stations`);
    if (stationsResponse.ok) {
      const stations = await stationsResponse.json();
      console.log('✅ Stations endpoint accessible');
      console.log('   Response format:', Object.keys(stations));
      if (stations.stations) {
        console.log('   Number of stations:', stations.stations.length);
        stations.stations.forEach((station, index) => {
          console.log(`   - Station ${index + 1}: ${station.name} (${station.code})`);
        });
      }
    } else {
      console.log('❌ Stations endpoint failed:', stationsResponse.status);
    }
  } catch (error) {
    console.log('❌ Stations endpoint error:', error.message);
  }

  console.log('');

  // Test Socket.IO connection
  try {
    console.log('4. Testing Socket.IO connection...');
    const socketResponse = await fetch(`${API_BASE_URL}/socket.io/?EIO=4&transport=polling`);
    if (socketResponse.ok) {
      console.log('✅ Socket.IO endpoint accessible');
      console.log('   This indicates real-time features should work');
    } else {
      console.log('⚠️  Socket.IO endpoint not accessible (status:', socketResponse.status, ')');
      console.log('   Real-time updates may not work');
    }
  } catch (error) {
    console.log('⚠️  Socket.IO endpoint error:', error.message);
    console.log('   Real-time updates may not work');
  }

  console.log('\n🏁 Backend connection test complete!');
  console.log('\nNext steps:');
  console.log('1. Make sure your AdaKDS backend is running on localhost:5005');
  console.log('2. Start the frontend: npm run dev');
  console.log('3. Open http://localhost:5006 in your browser');
}

testAPI().catch(console.error);