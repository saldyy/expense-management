import { useLocalSearchParams } from 'expo-router';

import type { CategoryKind } from '@/db/schema';
import { CategoryForm } from '@/screens/category-form';

export default function NewCategoryRoute() {
  const { kind } = useLocalSearchParams<{ kind?: CategoryKind }>();

  return <CategoryForm initialKind={kind} />;
}
