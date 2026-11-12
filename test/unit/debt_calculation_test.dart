// Unit test for HUBAAL SHOP Customer Debt Ledger & Calculations

class DebtCalculator {
  static double calculateItemSubtotal(double quantity, double unitPrice) {
    return double.parse((quantity * unitPrice).toStringAsFixed(2));
  }

  static double calculateDebtTotal(List<Map<String, double>> items) {
    double total = 0.0;
    for (var item in items) {
      total += (item['quantity'] ?? 0.0) * (item['unitPrice'] ?? 0.0);
    }
    return double.parse(total.toStringAsFixed(2));
  }

  static double calculateBalance({
    required double openingBalance,
    required List<double> charges,
    required List<double> payments,
    double adjustments = 0.0,
  }) {
    final double totalCharges = charges.fold(0.0, (sum, item) => sum + item);
    final double totalPayments = payments.fold(0.0, (sum, item) => sum + item);
    return double.parse(
      (openingBalance + totalCharges - totalPayments + adjustments).toStringAsFixed(2),
    );
  }
}

void main() {
  // Test 1: Example from user brief:
  // Rice Basmati (2 @ $25 = $50) + Sugar (3 @ $10 = $30) + Cooking Oil (1 @ $15 = $15) = $95
  final items = [
    {'quantity': 2.0, 'unitPrice': 25.0},
    {'quantity': 3.0, 'unitPrice': 10.0},
    {'quantity': 1.0, 'unitPrice': 15.0},
  ];
  final debtTotal = DebtCalculator.calculateDebtTotal(items);
  assert(debtTotal == 95.0, 'Test 1 Failed: Expected 95.0, got $debtTotal');

  // Test 2: Partial Payment of $35 reduces balance to $60
  final balAfterPartial = DebtCalculator.calculateBalance(
    openingBalance: 0.0,
    charges: [debtTotal],
    payments: [35.0],
  );
  assert(balAfterPartial == 60.0, 'Test 2 Failed: Expected 60.0, got $balAfterPartial');

  // Test 3: Full Payment clears debt
  final balAfterFull = DebtCalculator.calculateBalance(
    openingBalance: 0.0,
    charges: [debtTotal],
    payments: [35.0, 60.0],
  );
  assert(balAfterFull == 0.0, 'Test 3 Failed: Expected 0.0, got $balAfterFull');

  print('All HUBAAL SHOP Flutter customer debt unit tests passed!');
}
