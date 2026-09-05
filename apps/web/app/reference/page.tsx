import { ApiReference } from '@scalar/nextjs-api-reference';

export default function ReferencePage() {
  return (
    <ApiReference
      configuration={{
        spec: {
          url: '/openapi.json',
        },
        theme: 'default',
        layout: 'classic',
      }}
    />
  );
}
