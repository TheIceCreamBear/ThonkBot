import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

export function listenerInit() {
    console.log('Initializing Listeners...');
    
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    
    const listenerFiles = fs.readdirSync(__dirname).filter(file => file.endsWith('.ts') && !file.includes('loader.ts'));
    
    for (const file of listenerFiles) {
        import(path.join(__dirname, file));
    }
    
    console.log('Listeners Initialized Successfully.');
}
