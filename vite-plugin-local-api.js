import fs from 'fs/promises';
import path from 'path';

export default function localApiPlugin() {
  return {
    name: 'local-api-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url.startsWith('/api/')) return next();

        const dataDir = path.resolve(process.cwd(), 'src/data');

        // Ensure data directory exists
        try {
          await fs.access(dataDir);
        } catch {
          await fs.mkdir(dataDir, { recursive: true });
        }

        // GET /api/init - Load all data at once to populate frontend cache
        if (req.url === '/api/init' && req.method === 'GET') {
          try {
            const files = await fs.readdir(dataDir);
            const isAdmin = req.headers['x-user-role'] === 'admin';
            for (const file of files) {
              if (file.endsWith('.json')) {
                const key = file.replace('.json', '');
                const content = await fs.readFile(path.join(dataDir, file), 'utf-8');
                let parsed = JSON.parse(content || '[]');
                
                // Mask anonymous submissions for non-admins
                if (key === 'submissions' && !isAdmin) {
                  parsed = parsed.map(sub => {
                    if (sub.isAnonymous) {
                      return { ...sub, userId: 'anon', username: 'Anonymous' };
                    }
                    return sub;
                  });
                }
                
                data[key] = parsed;
              }
            }
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(data));
          } catch (e) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: e.message }));
          }
          return;
        }

        // POST /api/:collection - Overwrite the file with the new array
        const match = req.url.match(/^\/api\/([a-zA-Z0-9_]+)$/);
        if (match && req.method === 'POST') {
          const collection = match[1];
          let body = '';
          req.on('data', chunk => { body += chunk.toString(); });
          req.on('end', async () => {
            try {
              const filePath = path.join(dataDir, `${collection}.json`);
              let incomingData = JSON.parse(body);
              
              if (collection === 'submissions') {
                try {
                  const existingContent = await fs.readFile(filePath, 'utf-8');
                  const existingData = JSON.parse(existingContent || '[]');
                  
                  // Smart merge: restore true identity for anonymous submissions
                  incomingData = incomingData.map(inc => {
                    if (inc.isAnonymous && inc.userId === 'anon') {
                      const ex = existingData.find(e => e.id === inc.id);
                      if (ex) {
                        return { ...inc, userId: ex.userId, username: ex.username };
                      }
                    }
                    return inc;
                  });
                } catch (e) {
                  // File might not exist yet, safe to ignore
                }
              }
              
              await fs.writeFile(filePath, JSON.stringify(incomingData, null, 2), 'utf-8');
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true }));
            } catch (e) {
              res.statusCode = 500;
              res.end(JSON.stringify({ error: e.message }));
            }
          });
          return;
        }

        res.statusCode = 404;
        res.end(JSON.stringify({ error: 'Not found' }));
      });
    }
  };
}
