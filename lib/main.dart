import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'app/router.dart';
import 'theme/app_theme.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // In live production, initialize Supabase and Drift SQLite:
  // await Supabase.initialize(url: supabaseUrl, anonKey: supabaseAnonKey);
  // await AppDatabase.init();

  runApp(
    const ProviderScope(
      child: HubaalShopApp(),
    ),
  );
}

class HubaalShopApp extends ConsumerWidget {
  const HubaalShopApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.watch(routerProvider);

    return MaterialApp.router(
      title: 'HUBAAL SHOP',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      routerConfig: router,
      localizationsDelegates: const [
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
      ],
      supportedLocales: const [
        Locale('so', ''), // Somali
        Locale('en', ''), // English
      ],
      locale: const Locale('so', ''), // Default to Somali
    );
  }
}
