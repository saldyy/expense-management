import { useLocalSearchParams } from 'expo-router';

import { CategoryForm } from '@/screens/category-form';

export default function EditCategoryRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return <CategoryForm categoryId={id} />;
}
