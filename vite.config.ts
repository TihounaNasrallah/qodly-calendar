import { PluginOption, defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react-swc';

import { initProxy } from './proxy.config';

const redirect = (opts: { from: string; to: string }): PluginOption => {
  return {
    name: 'redirect',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url.startsWith(opts.from)) {
          res.statusCode = 307;
          res.setHeader('Location', opts.to);
          res.setHeader('Content-Length', '0');
          return res.end();
        }

        return next();
      });
    },
  };
};

// https://vitejs.dev/config/
export default defineConfig(({ mode = 'local' }) => {
  const env = loadEnv(mode, process.cwd(), '');

  const port = env.PORT || 5001;
  const host = env.HOST || '0.0.0.0';

  const proxy = initProxy(env);

  return {
    plugins: [
      react(),
      redirect({
        from: '/studio/',
        to: '/',
      }),
    ],
    define: {
      'process.env': {},
    },
    server: {
      host,
      proxy,
      port: +port,
    },
  };
});
