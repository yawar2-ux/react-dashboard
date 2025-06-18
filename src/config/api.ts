export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: process.env.NEXT_PUBLIC_API_ENDPOINT_AUTH_LOGIN || '/rag_doc/login',
    LOGOUT: process.env.NEXT_PUBLIC_API_ENDPOINT_AUTH_LOGOUT || '/logout',
    SIGNUP: process.env.NEXT_PUBLIC_API_ENDPOINT_AUTH_SIGNUP || '/signup',
    RESET_PASSWORD: process.env.NEXT_PUBLIC_API_ENDPOINT_AUTH_RESET_PASSWORD || '/reset_password',
  },
  DOCUMENTS: {
    UPLOAD: process.env.NEXT_PUBLIC_API_ENDPOINT_DOCUMENTS_UPLOAD || '/upload_documents',
    PROCESS_URL: process.env.NEXT_PUBLIC_API_ENDPOINT_DOCUMENTS_PROCESS_URL || '/process_url',
  },
  CHAT: {
    QUERY: process.env.NEXT_PUBLIC_API_ENDPOINT_CHAT_QUERY || '/query',
    CHAT: process.env.NEXT_PUBLIC_API_ENDPOINT_CHAT_CHAT || '/chat',
  },
  IMAGES: {
    ANALYZE: process.env.NEXT_PUBLIC_API_ENDPOINT_IMAGES_ANALYZE || '/analyze_image',
  },
} as const;
