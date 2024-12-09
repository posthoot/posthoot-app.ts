'use client';

import { useEffect, useState } from 'react';
import SwaggerUI from 'swagger-ui-react';
import type { SwaggerUIProps } from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';

export default function ApiDocs() {
  const [spec, setSpec] = useState<SwaggerUIProps['spec']>(null);

  useEffect(() => {
    fetch('/api/docs')
      .then((response) => response.json())
      .then((data) => setSpec(data));
  }, []);

  if (!spec) {
    return <div>Loading API documentation...</div>;
  }

  return (
    <div className="api-docs">
      <SwaggerUI spec={spec} />
      <style jsx global>{`
        .swagger-ui .topbar {
          display: none;
        }
        .api-docs {
          padding: 2rem;
        }
      `}</style>
    </div>
  );
} 