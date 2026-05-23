function safeJsonLdStringify(data: unknown) {
  try {
    return JSON.stringify(data, (_key, value) => (typeof value === 'bigint' ? value.toString() : value));
  } catch {
    return '{}';
  }
}

export default function JsonLd({ id, data }: { id: string; data: unknown }) {
  return <script id={id} type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLdStringify(data) }} />;
}
