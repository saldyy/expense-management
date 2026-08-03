import { useLocalSearchParams } from 'expo-router';

import { TransactionForm } from '@/screens/transaction-form';

export default function EditTransactionRoute() {
  // Route-specific concern: read params here, not inside the screen body.
  const { id } = useLocalSearchParams<{ id: string }>();

  return <TransactionForm transactionId={id} />;
}
