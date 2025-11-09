import { Tabs } from 'expo-router'
import React from 'react'
import { View, Text } from 'react-native'

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

// Podstawowa wysokość reklamy Google AdMob
const AD_BASE_HEIGHT = 60

export default function TabLayout() {
  const colorScheme = useColorScheme()

  // Wysokość kontenera reklamy
  const adContainerHeight = AD_BASE_HEIGHT

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        initialRouteName='recipes'
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarStyle: {
            height: 70,
            paddingBottom: 12,
            paddingTop: 12,
            position: 'absolute',
            bottom: adContainerHeight,
            left: 0,
            right: 0,
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

      {/* Miejsce na reklamę Google AdMob - przykleja się do samego dołu */}
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: adContainerHeight,
          backgroundColor: '#F8F9FA',
          borderTopWidth: 1,
          borderTopColor: '#E2E8F0',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <View
          style={{
            backgroundColor: '#E5E7EB',
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 4,
          }}
        >
          <Text
            style={{
              fontSize: 12,
              color: '#6B7280',
            }}
          >
            Miejsce na reklamę Google AdMob
          </Text>
        </View>
      </View>
    </View>
  )
}
