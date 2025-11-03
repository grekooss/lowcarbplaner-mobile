import { Tabs } from 'expo-router'
import React from 'react'

import { HapticTab } from '@/components/haptic-tab'
import { IconSymbol } from '@/components/ui/icon-symbol'
import { Colors } from '@/constants/theme'
import { useColorScheme } from '@/hooks/use-color-scheme'

/**
 * Tab Layout - Główna nawigacja aplikacji
 *
 * Bottom Tabs zgodnie z planem implementacji:
 * 🏠 Dashboard - główny widok z posiłkami i makrami
 * 📅 Plan - widok tygodniowy planu posiłków
 * 🍳 Przepisy - lista wszystkich przepisów
 * 🛒 Lista - lista zakupów
 * 👤 Profil - ustawienia i profil użytkownika
 */
export default function TabLayout() {
  const colorScheme = useColorScheme()

  return (
    <Tabs
      initialRouteName='recipes'
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
      }}
    >
      <Tabs.Screen
        name='index'
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name='house.fill' color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name='meal-plan'
        options={{
          title: 'Plan',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name='calendar' color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name='recipes'
        options={{
          title: 'Przepisy',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name='fork.knife' color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name='shopping-list'
        options={{
          title: 'Lista',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name='cart.fill' color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name='profile'
        options={{
          title: 'Profil',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name='person.fill' color={color} />
          ),
        }}
      />
      {/* Hidden legacy explore screen */}
      <Tabs.Screen
        name='explore'
        options={{
          href: null, // Ukrywa w nawigacji
        }}
      />
    </Tabs>
  )
}
