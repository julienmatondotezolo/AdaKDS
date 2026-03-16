"use client";

import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import AppLayout from '@/components/layout/app-layout';

interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  category: string;
  estimated_prep_time?: number;
  is_available: boolean;
  station_assignment?: string | null;
}

interface Station {
  id: string;
  name: string;
  code: string;
  color: string;
  categories: string[];
  active: boolean;
  display_order: number;
}

interface MenuCategory {
  id: string;
  name: string;
  items?: MenuItem[];
}

export default function MenuAssignmentsPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const restaurantId = 'c1cbea71-ece5-4d63-bb12-fe06b03d1140'; // Demo restaurant

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load menu items, categories, and stations in parallel
      const [itemsResponse, categoriesResponse, stationsResponse] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api-kds.adasystems.app'}/api/v1/restaurants/${restaurantId}/menu/items`),
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api-kds.adasystems.app'}/api/v1/restaurants/${restaurantId}/menu/categories`),
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api-kds.adasystems.app'}/api/v1/stations?restaurant_id=${restaurantId}`)
      ]);

      if (!itemsResponse.ok || !categoriesResponse.ok || !stationsResponse.ok) {
        throw new Error('Failed to load menu data');
      }

      const [itemsData, categoriesData, stationsData] = await Promise.all([
        itemsResponse.json(),
        categoriesResponse.json(),
        stationsResponse.json()
      ]);

      setMenuItems(itemsData.items || []);
      setCategories(categoriesData.categories || []);
      setStations(stationsData.stations || []);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = async (result: any) => {
    const { source, destination, draggableId } = result;

    // If dropped outside a droppable area
    if (!destination) return;

    // If dropped in the same position
    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }

    const menuItemId = draggableId;
    const sourceStationId = source.droppableId === 'unassigned' ? null : source.droppableId;
    const destStationId = destination.droppableId === 'unassigned' ? null : destination.droppableId;

    try {
      // If moving to a station
      if (destStationId) {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'https://api-kds.adasystems.app'}/api/v1/restaurants/${restaurantId}/stations/${destStationId}/assign-items`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              // Add authorization header when auth is implemented
            },
            body: JSON.stringify({
              menu_item_ids: [menuItemId],
              replace_existing: false
            })
          }
        );

        if (!response.ok) {
          throw new Error('Failed to assign item');
        }
      }

      // If removing from station
      if (sourceStationId && !destStationId) {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'https://api-kds.adasystems.app'}/api/v1/restaurants/${restaurantId}/stations/${sourceStationId}/items/${menuItemId}`,
          {
            method: 'DELETE',
            headers: {
              // Add authorization header when auth is implemented
            }
          }
        );

        if (!response.ok) {
          throw new Error('Failed to remove assignment');
        }
      }

      // Update local state
      setMenuItems(items => 
        items.map(item => 
          item.id === menuItemId 
            ? { ...item, station_assignment: destStationId }
            : item
        )
      );

    } catch (err) {
      console.error('Error updating assignment:', err);
      setError('Failed to update assignment');
    }
  };

  const filteredItems = menuItems.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const unassignedItems = filteredItems.filter(item => !item.station_assignment);
  const assignedItemsByStation = stations.reduce((acc, station) => {
    acc[station.id] = filteredItems.filter(item => item.station_assignment === station.id);
    return acc;
  }, {} as Record<string, MenuItem[]>);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading menu assignments...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-600 text-lg">Error: {error}</div>
      </div>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Menu Item Assignments</h1>

      {/* Controls */}
      <div className="mb-6 flex flex-wrap gap-4">
        {/* Category Filter */}
        <div>
          <label className="block text-sm font-medium mb-2">Category</label>
          <select 
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2"
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category.id} value={category.name}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Search */}
        <div className="flex-1 min-w-64">
          <label className="block text-sm font-medium mb-2">Search Items</label>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search menu items..."
            className="w-full border border-gray-300 rounded-md px-3 py-2"
          />
        </div>

        {/* Refresh Button */}
        <div>
          <label className="block text-sm font-medium mb-2 opacity-0">Refresh</label>
          <button
            onClick={() => loadData()}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Refresh Menu
          </button>
        </div>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          
          {/* Unassigned Items */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4 text-gray-700">
              Unassigned Items ({unassignedItems.length})
            </h3>
            <Droppable droppableId="unassigned">
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`min-h-32 space-y-2 ${
                    snapshot.isDraggingOver ? 'bg-blue-50' : ''
                  }`}
                >
                  {unassignedItems.map((item, index) => (
                    <Draggable key={item.id} draggableId={item.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`bg-white p-3 rounded border shadow-sm cursor-move ${
                            snapshot.isDragging ? 'shadow-lg' : ''
                          }`}
                        >
                          <div className="font-medium">{item.name}</div>
                          <div className="text-sm text-gray-600">{item.category}</div>
                          <div className="text-sm text-green-600 font-medium">€{item.price}</div>
                          {item.estimated_prep_time && (
                            <div className="text-xs text-gray-500">~{item.estimated_prep_time}min</div>
                          )}
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                  {unassignedItems.length === 0 && (
                    <div className="text-gray-500 text-center py-8">
                      No unassigned items
                    </div>
                  )}
                </div>
              )}
            </Droppable>
          </div>

          {/* Station Columns */}
          {stations.map(station => (
            <div key={station.id} className="bg-white rounded-lg border p-4">
              <h3 
                className="text-lg font-semibold mb-4 flex items-center"
                style={{ color: station.color }}
              >
                <div 
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: station.color }}
                />
                {station.name} ({assignedItemsByStation[station.id]?.length || 0})
              </h3>
              
              <Droppable droppableId={station.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`min-h-32 space-y-2 ${
                      snapshot.isDraggingOver ? 'bg-green-50' : ''
                    }`}
                  >
                    {assignedItemsByStation[station.id]?.map((item, index) => (
                      <Draggable key={item.id} draggableId={item.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`bg-gray-50 p-3 rounded border cursor-move ${
                              snapshot.isDragging ? 'shadow-lg' : ''
                            }`}
                          >
                            <div className="font-medium">{item.name}</div>
                            <div className="text-sm text-gray-600">{item.category}</div>
                            <div className="text-sm text-green-600 font-medium">€{item.price}</div>
                            {item.estimated_prep_time && (
                              <div className="text-xs text-gray-500">~{item.estimated_prep_time}min</div>
                            )}
                          </div>
                        )}
                      </Draggable>
                    )) || []}
                    {provided.placeholder}
                    {!assignedItemsByStation[station.id]?.length && (
                      <div className="text-gray-500 text-center py-8">
                        Drop items here to assign to {station.name}
                      </div>
                    )}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>

      {/* Summary */}
      <div className="mt-8 bg-blue-50 rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-2">Assignment Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <div className="text-2xl font-bold text-blue-600">{menuItems.length}</div>
            <div className="text-sm text-gray-600">Total Items</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">
              {menuItems.filter(item => item.station_assignment).length}
            </div>
            <div className="text-sm text-gray-600">Assigned</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-orange-600">
              {menuItems.filter(item => !item.station_assignment).length}
            </div>
            <div className="text-sm text-gray-600">Unassigned</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600">{stations.length}</div>
            <div className="text-sm text-gray-600">Active Stations</div>
          </div>
        </div>
      </div>
      </div>
    </AppLayout>
  );
}