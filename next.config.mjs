import path from 'path';

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com'
      }
    ]
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      '@tanstack/react-query': path.resolve(process.cwd(), 'lib/shims/react-query.js'),
      'react-router-dom': path.resolve(process.cwd(), 'lib/shims/react-router-dom.js'),
      'lucide-react': path.resolve(process.cwd(), 'lib/shims/lucide-react.js'),
      sonner: path.resolve(process.cwd(), 'lib/shims/sonner.js'),
      'react-quill': path.resolve(process.cwd(), 'lib/shims/react-quill.js'),
      'react-quill/dist/quill.snow.css': path.resolve(process.cwd(), 'lib/shims/empty.css')
    };
    return config;
  }
};

export default nextConfig;
