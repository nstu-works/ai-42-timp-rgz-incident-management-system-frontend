// orval.config.ts
import { defineConfig } from 'orval'

export default defineConfig({
  ims: {
    input: 'http://localhost:8000/api/openapi.json',
    output: {
      mode: 'tags-split',
      target: 'src/api/generated',
      client: 'react-query',
      httpClient: 'axios',
      override: {
        mutator: {
          path: 'src/lib/axios.ts',
          name: 'axiosInstance',
        },
      },
    },
  },
})
