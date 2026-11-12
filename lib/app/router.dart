import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

final GlobalKey<NavigatorState> _rootNavigatorKey = GlobalKey<NavigatorState>();
final GlobalKey<NavigatorState> _shellNavigatorKey = GlobalKey<NavigatorState>();

final routerProvider = Provider<GoRouter>((ref) {
  return GoRouter(
    navigatorKey: _rootNavigatorKey,
    initialLocation: '/dashboard',
    routes: [
      ShellRoute(
        navigatorKey: _shellNavigatorKey,
        builder: (context, state, child) {
          return Scaffold(
            body: child,
            bottomNavigationBar: NavigationBar(
              selectedIndex: _calculateSelectedIndex(state.matchedLocation),
              onDestinationSelected: (int index) {
                switch (index) {
                  case 0:
                    context.go('/dashboard');
                    break;
                  case 1:
                    context.go('/customers');
                    break;
                  case 2:
                    context.go('/new-debt');
                    break;
                  case 3:
                    context.go('/payments');
                    break;
                  case 4:
                    context.go('/reports');
                    break;
                }
              },
              destinations: const [
                NavigationDestination(
                  icon: Icon(Icons.dashboard_outlined),
                  selectedIcon: Icon(Icons.dashboard),
                  label: 'Dashboard',
                ),
                NavigationDestination(
                  icon: Icon(Icons.people_outline),
                  selectedIcon: Icon(Icons.people),
                  label: 'Customers',
                ),
                NavigationDestination(
                  icon: Icon(Icons.add_circle_outline, color: Color(0xFFFF8A00)),
                  selectedIcon: Icon(Icons.add_circle, color: Color(0xFFFF8A00)),
                  label: 'New Debt',
                ),
                NavigationDestination(
                  icon: Icon(Icons.payment_outlined),
                  selectedIcon: Icon(Icons.payment),
                  label: 'Payments',
                ),
                NavigationDestination(
                  icon: Icon(Icons.bar_chart_outlined),
                  selectedIcon: Icon(Icons.bar_chart),
                  label: 'Reports',
                ),
              ],
            ),
          );
        },
        routes: [
          GoRoute(
            path: '/dashboard',
            builder: (context, state) => const Placeholder(),
          ),
          GoRoute(
            path: '/customers',
            builder: (context, state) => const Placeholder(),
            routes: [
              GoRoute(
                path: ':id',
                builder: (context, state) => const Placeholder(),
              ),
            ],
          ),
          GoRoute(
            path: '/new-debt',
            builder: (context, state) => const Placeholder(),
          ),
          GoRoute(
            path: '/payments',
            builder: (context, state) => const Placeholder(),
          ),
          GoRoute(
            path: '/reports',
            builder: (context, state) => const Placeholder(),
          ),
        ],
      ),
    ],
  );
});

int _calculateSelectedIndex(String location) {
  if (location.startsWith('/dashboard')) return 0;
  if (location.startsWith('/customers')) return 1;
  if (location.startsWith('/new-debt')) return 2;
  if (location.startsWith('/payments')) return 3;
  if (location.startsWith('/reports')) return 4;
  return 0;
}
