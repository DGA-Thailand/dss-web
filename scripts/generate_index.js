import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const controlsDir = path.join(__dirname, '..', 'public', 'controls');
const indexFile = path.join(controlsDir, 'index.json');

function generateIndex() {
    if (!fs.existsSync(controlsDir)) {
        console.error(`Directory not found: ${controlsDir}`);
        return;
    }

    const files = fs.readdirSync(controlsDir).filter(file => file.endsWith('.json') && file !== 'index.json');

    const indexData = [];

    for (const file of files) {
        const filePath = path.join(controlsDir, file);
        const content = fs.readFileSync(filePath, 'utf-8');
        try {
            const data = JSON.parse(content);

            const indexEntry = {
                ControlID: data.ControlID || data.AI_Processed?.Topic || file.replace('.json', ''),
                OriginalTopic: data.OriginalTopic || '',
                AI_Topic: data.AI_Processed?.Topic || "",
                AI_Recommendations: data.AI_Processed?.Recommendations || [],
                Category: data.Category || 'Uncategorized',
                ApplicationType: data.Metadata?.ApplicationType || '-',
                ServiceType: data.Metadata?.ServiceType || '-',
                Compliance: data.Metadata?.Compliance || '-',
                ImpactLevels: data.Metadata?.ImpactLevels || {},
                ProcessingError: data.ProcessingError || false
            };

            indexData.push(indexEntry);
        } catch (err) {
            console.error(`Error parsing ${file}:`, err.message);
        }
    }

    // Sort the indexData by ControlID
    indexData.sort((a, b) => a.ControlID.localeCompare(b.ControlID));

    fs.writeFileSync(indexFile, JSON.stringify(indexData, null, 2), 'utf-8');
    console.log(`Generated index.json with ${indexData.length} entries.`);
}

generateIndex();
