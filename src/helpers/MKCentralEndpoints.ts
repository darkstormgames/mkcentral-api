/** MKCentral API GET Endpoints
*
* Players (paginated list)
* https://mkcentral.com/api/registry/players
* Options from '{ PlayerFilter } from ../lib/player/PlayerFilter'
* 
* Player (profile by Id)
* https://mkcentral.com/api/registry/players/{id}
* No options available, but sub-endpoints:
*   - https://mkcentral.com/api/tournaments/players/placements/{id}
*   - https://mkcentral.com/api/registry/players/{id}/getPlayerTransferHistory
* 
* Teams (paginated list)
* https://mkcentral.com/api/registry/teams?is_historical=false&is_active=true&sort_by_newest=false&min_player_count=6&page=1
* No options for now, on the ToDo
* 
* Team (profile by Id)
* https://mkcentral.com/api/registry/teams/35
* No options available, but sub-endpoints:
*   - https://mkcentral.com/api/tournaments/teams/placements/{id}
*   - https://mkcentral.com/api/registry/teams/transfers/approved?page=1&team_id={id}
*/
import { fetchHttpsContent } from '../lib/common/APIRequest';
import { PlayerFilter } from '../lib/player/PlayerFilter'
import * as readline from 'readline';

let playerIds: number[] = [ 183, 1655, 4187 ];
let teamIds: number[] = [ 35 ];

interface EndpointDefinition {
    name: string;
    url: string;
    method: 'GET';
    params?: string[];
    subEndpoints?: string[];
}

// Parse endpoints from the comment
const endpoints: EndpointDefinition[] = [
    {
        name: 'Players List',
        url: 'https://mkcentral.com/api/registry/players',
        method: 'GET',
        params: ['PlayerFilter options']
    },
    {
        name: 'Player Profile',
        url: 'https://mkcentral.com/api/registry/players/{id}',
        method: 'GET',
        params: ['id'],
        subEndpoints: [
            'https://mkcentral.com/api/tournaments/players/placements/{id}',
            'https://mkcentral.com/api/registry/players/{id}/getPlayerTransferHistory'
        ]
    },
    {
        name: 'Teams List',
        url: 'https://mkcentral.com/api/registry/teams',
        method: 'GET',
        params: ['is_historical', 'is_active', 'sort_by_newest', 'min_player_count', 'page']
    },
    {
        name: 'Team Profile',
        url: 'https://mkcentral.com/api/registry/teams/{id}',
        method: 'GET',
        params: ['id'],
        subEndpoints: [
            'https://mkcentral.com/api/tournaments/teams/placements/{id}',
            'https://mkcentral.com/api/registry/teams/transfers/approved'
        ]
    }
];

// Analyze response structure
async function analyzeEndpointResponse(url: string, params?: Record<string, any>) {
    try {
        const response = await fetchHttpsContent(url);
        const data = JSON.parse(response);
        return extractFieldDefinitions(data);
    } catch (error) {
        console.error(`Error fetching ${url}:`, error);
        return null;
    }
}

// Recursively extract field definitions
function extractFieldDefinitions(obj: any, prefix = ''): Record<string, string> {
    const fields: Record<string, string> = {};
    
    if (obj === null || obj === undefined) {
        return fields;
    }
    
    if (Array.isArray(obj)) {
        fields[prefix || 'root'] = 'array';
        if (obj.length > 0) {
            const childFields = extractFieldDefinitions(obj[0], `${prefix}[0]`);
            Object.assign(fields, childFields);
        }
    } else if (typeof obj === 'object') {
        for (const [key, value] of Object.entries(obj)) {
            const fieldPath = prefix ? `${prefix}.${key}` : key;
            
            if (value === null) {
                fields[fieldPath] = 'null';
            } else if (Array.isArray(value)) {
                fields[fieldPath] = 'array';
                if (value.length > 0) {
                    const childFields = extractFieldDefinitions(value[0], `${fieldPath}[0]`);
                    Object.assign(fields, childFields);
                }
            } else if (typeof value === 'object') {
                fields[fieldPath] = 'object';
                const childFields = extractFieldDefinitions(value, fieldPath);
                Object.assign(fields, childFields);
            } else {
                fields[fieldPath] = typeof value;
            }
        }
    } else {
        fields[prefix || 'root'] = typeof obj;
    }
    
    return fields;
}

// Convert flat field definitions to hierarchical structure for display
function formatFieldsHierarchically(fields: Record<string, string>): string[] {
    const output: string[] = [];
    const processed = new Set<string>();
    
    // Sort fields by path to ensure parent fields come before children
    const sortedFields = Object.entries(fields).sort(([a], [b]) => a.localeCompare(b));
    
    for (const [path, type] of sortedFields) {
        if (processed.has(path)) continue;
        
        // Calculate indentation based on path depth
        const parts = path.split(/[\.\[\]]+/).filter(p => p && p !== '0');
        const indent = '  '.repeat(parts.length - 1);
        
        // Clean up the display name
        const displayName = parts[parts.length - 1] || 'root';
        
        // Check if this is an array or object with children
        const hasChildren = sortedFields.some(([p]) => 
            p !== path && p.startsWith(path) && (p.startsWith(path + '.') || p.startsWith(path + '['))
        );
        
        if (type === 'array') {
            output.push(`${indent}${displayName}: ${type}`);
            // Mark array index paths as processed since we'll show them as part of the array
            sortedFields.forEach(([p]) => {
                if (p.startsWith(path + '[0]')) {
                    processed.add(path + '[0]');
                }
            });
        } else if (type === 'object' && hasChildren) {
            output.push(`${indent}${displayName}: ${type}`);
        } else {
            output.push(`${indent}${displayName}: ${type}`);
        }
        
        processed.add(path);
    }
    
    return output;
}

// Create readline interface for CLI
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Helper function to prompt user
function prompt(question: string): Promise<string> {
    return new Promise(resolve => {
        rl.question(question, answer => {
            resolve(answer.trim());
        });
    });
}

// Display menu and get selection
async function showMainMenu(): Promise<string> {
    console.log('\n=== MKCentral API Endpoint Analyzer ===');
    console.log('1. Players List');
    console.log('2. Player Profile');
    console.log('3. Teams List');
    console.log('4. Team Profile');
    console.log('5. Crawl Players (Build comprehensive definition)');
    console.log('6. Crawl Teams (Build comprehensive definition)');
    console.log('7. Exit');
    
    return await prompt('\nSelect an option (1-7): ');
}

// Show ID selection menu for players
async function selectPlayerId(): Promise<number | null> {
    console.log('\n=== Select Player ID ===');
    playerIds.forEach((id, index) => {
        console.log(`${index + 1}. Player ${id}`);
    });
    console.log(`${playerIds.length + 1}. Enter custom ID`);
    console.log(`${playerIds.length + 2}. Back to main menu`);
    
    const choice = await prompt(`\nSelect an option (1-${playerIds.length + 2}): `);
    const choiceNum = parseInt(choice);
    
    if (choiceNum >= 1 && choiceNum <= playerIds.length) {
        return playerIds[choiceNum - 1];
    } else if (choiceNum === playerIds.length + 1) {
        const customId = await prompt('Enter player ID: ');
        return parseInt(customId) || null;
    }
    
    return null;
}

// Show ID selection menu for teams
async function selectTeamId(): Promise<number | null> {
    console.log('\n=== Select Team ID ===');
    teamIds.forEach((id, index) => {
        console.log(`${index + 1}. Team ${id}`);
    });
    console.log(`${teamIds.length + 1}. Enter custom ID`);
    console.log(`${teamIds.length + 2}. Back to main menu`);
    
    const choice = await prompt(`\nSelect an option (1-${teamIds.length + 2}): `);
    const choiceNum = parseInt(choice);
    
    if (choiceNum >= 1 && choiceNum <= teamIds.length) {
        return teamIds[choiceNum - 1];
    } else if (choiceNum === teamIds.length + 1) {
        const customId = await prompt('Enter team ID: ');
        return parseInt(customId) || null;
    }
    
    return null;
}

// Analyze and display endpoint data
async function analyzeAndDisplay(url: string, name: string) {
    console.log(`\n=== Analyzing ${name} ===`);
    console.log(`URL: ${url}`);
    console.log('Fetching data...\n');
    
    const fields = await analyzeEndpointResponse(url);
    if (fields) {
        console.log('Field Definitions:');
        const formatted = formatFieldsHierarchically(fields);
        formatted.forEach(line => console.log(line));
    } else {
        console.log('Failed to fetch or parse data.');
    }
    
    await prompt('\nPress Enter to continue...');
}

// Add interface for crawl configuration
interface CrawlConfig {
    startId: number;
    endId: number;
    sampleSize: number; // How many IDs to actually check
    randomSample: boolean; // Whether to use random sampling
}

// Add interface for comprehensive field info
interface FieldInfo {
    types: Map<string, number>; // Track each type and its occurrence count
    totalOccurrences: number;
    uniqueValues?: Set<any>; // For collecting unique values like roles
}

// Enhanced field extraction for crawling
function extractFieldsWithValues(obj: any, prefix = '', collectValues = false): Map<string, FieldInfo> {
    const fields = new Map<string, FieldInfo>();
    
    if (obj === null || obj === undefined) {
        return fields;
    }
    
    if (Array.isArray(obj)) {
        const info: FieldInfo = { 
            types: new Map([['array', 1]]), 
            totalOccurrences: 1 
        };
        fields.set(prefix || 'root', info);
        
        if (obj.length > 0) {
            const childFields = extractFieldsWithValues(obj[0], `${prefix}[0]`, collectValues);
            childFields.forEach((info, path) => fields.set(path, info));
        }
    } else if (typeof obj === 'object') {
        for (const [key, value] of Object.entries(obj)) {
            const fieldPath = prefix ? `${prefix}.${key}` : key;
            
            if (value === null) {
                fields.set(fieldPath, { 
                    types: new Map([['null', 1]]), 
                    totalOccurrences: 1 
                });
            } else if (Array.isArray(value)) {
                fields.set(fieldPath, { 
                    types: new Map([['array', 1]]), 
                    totalOccurrences: 1 
                });
                if (value.length > 0) {
                    const childFields = extractFieldsWithValues(value[0], `${fieldPath}[0]`, collectValues);
                    childFields.forEach((info, path) => fields.set(path, info));
                }
            } else if (typeof value === 'object') {
                fields.set(fieldPath, { 
                    types: new Map([['object', 1]]), 
                    totalOccurrences: 1 
                });
                const childFields = extractFieldsWithValues(value, fieldPath, collectValues);
                childFields.forEach((info, path) => fields.set(path, info));
            } else {
                const type = typeof value;
                const info: FieldInfo = { 
                    types: new Map([[type, 1]]), 
                    totalOccurrences: 1 
                };
                
                // Collect role values specifically
                if (collectValues && (key === 'role' || fieldPath.includes('role'))) {
                    info.uniqueValues = new Set([value]);
                }
                
                fields.set(fieldPath, info);
            }
        }
    } else {
        fields.set(prefix || 'root', { 
            types: new Map([[typeof obj, 1]]), 
            totalOccurrences: 1 
        });
    }
    
    return fields;
}

// Merge field information from multiple sources
function mergeFieldInfo(target: Map<string, FieldInfo>, source: Map<string, FieldInfo>) {
    source.forEach((sourceInfo, path) => {
        if (target.has(path)) {
            const targetInfo = target.get(path)!;
            targetInfo.totalOccurrences++;
            
            // Merge type occurrences
            sourceInfo.types.forEach((count, type) => {
                targetInfo.types.set(type, (targetInfo.types.get(type) || 0) + count);
            });
            
            // Merge unique values if present
            if (sourceInfo.uniqueValues && targetInfo.uniqueValues) {
                sourceInfo.uniqueValues.forEach(val => targetInfo.uniqueValues!.add(val));
            } else if (sourceInfo.uniqueValues) {
                targetInfo.uniqueValues = new Set(sourceInfo.uniqueValues);
            }
        } else {
            target.set(path, {
                types: new Map(sourceInfo.types),
                totalOccurrences: 1,
                uniqueValues: sourceInfo.uniqueValues ? new Set(sourceInfo.uniqueValues) : undefined
            });
        }
    });
}

// Helper to determine the final type string from collected type information
function determineTypeString(info: FieldInfo, successCount: number): string {
    const types = Array.from(info.types.keys()).filter(t => t !== 'null');
    const hasNull = info.types.has('null');
    const coverage = ((info.totalOccurrences / successCount) * 100).toFixed(1);
    
    // If field doesn't appear in all objects, it's optional (can be undefined)
    const isOptional = info.totalOccurrences < successCount;
    
    let typeStr: string;
    
    if (types.length === 0) {
        // Only null values found
        typeStr = 'null';
    } else if (types.length === 1) {
        // Single type (plus possibly null)
        typeStr = types[0];
        if (hasNull) {
            typeStr += ' | null';
        }
    } else {
        // Multiple types found
        typeStr = types.join(' | ');
        if (hasNull) {
            typeStr += ' | null';
        }
    }
    
    // Add coverage and optional indicator
    let suffix = ` (${coverage}%)`;
    if (isOptional) {
        suffix += ' [optional]';
    }
    
    return typeStr + suffix;
}

// Configure crawl parameters
async function configureCrawl(type: 'player' | 'team'): Promise<CrawlConfig | null> {
    const maxId = type === 'player' ? 78550 : 3380;
    
    console.log(`\n=== Configure ${type} crawl ===`);
    console.log(`Maximum ID: ${maxId}`);
    console.log('1. Quick sample (10 random IDs)');
    console.log('2. Medium sample (50 random IDs)');
    console.log('3. Large sample (100 random IDs)');
    console.log('4. Extra large sample (500 random IDs)');
    console.log('5. Custom configuration');
    console.log('6. FULL CRAWL (ALL IDs) - WARNING: This will take a long time!');
    console.log('7. Back to main menu');
    
    const choice = await prompt('\nSelect an option (1-7): ');
    
    switch (choice) {
        case '1':
            return { startId: 1, endId: maxId, sampleSize: 10, randomSample: true };
        case '2':
            return { startId: 1, endId: maxId, sampleSize: 50, randomSample: true };
        case '3':
            return { startId: 1, endId: maxId, sampleSize: 100, randomSample: true };
        case '4':
            return { startId: 1, endId: maxId, sampleSize: 500, randomSample: true };
        case '5':
            const startId = parseInt(await prompt(`Enter start ID (1-${maxId}): `)) || 1;
            const endId = parseInt(await prompt(`Enter end ID (${startId}-${maxId}): `)) || maxId;
            const sampleSize = parseInt(await prompt(`Enter sample size (1-${Math.min(endId - startId + 1, 1000)}): `)) || 10;
            const randomChoice = await prompt('Use random sampling? (y/n): ');
            return {
                startId: Math.max(1, Math.min(startId, maxId)),
                endId: Math.min(endId, maxId),
                sampleSize: Math.min(sampleSize, endId - startId + 1),
                randomSample: randomChoice.toLowerCase() === 'y'
            };
        case '6':
            // Full crawl warning and confirmation
            console.log('\n⚠️  WARNING: Full Crawl Selected ⚠️');
            console.log(`This will attempt to fetch ${maxId} ${type} records.`);
            console.log(`Estimated time: ${Math.ceil(maxId * 0.1 / 60)} minutes (at 100ms per request)`);
            console.log('This may consume significant bandwidth and could trigger rate limiting.');
            
            const confirm = await prompt('\nAre you sure you want to proceed? (yes/no): ');
            if (confirm.toLowerCase() !== 'yes') {
                console.log('Full crawl cancelled.');
                return null;
            }
            
            // Ask if they want to start from a specific ID (useful for resuming)
            const resumeChoice = await prompt('Do you want to resume from a specific ID? (y/n): ');
            let resumeId = 1;
            if (resumeChoice.toLowerCase() === 'y') {
                resumeId = parseInt(await prompt(`Enter starting ID (1-${maxId}): `)) || 1;
            }
            
            return {
                startId: resumeId,
                endId: maxId,
                sampleSize: maxId - resumeId + 1,
                randomSample: false
            };
        default:
            return null;
    }
}

// Generate IDs for crawling
function generateCrawlIds(config: CrawlConfig): number[] {
    const ids: number[] = [];
    
    if (config.randomSample) {
        const availableIds = new Set<number>();
        for (let i = config.startId; i <= config.endId; i++) {
            availableIds.add(i);
        }
        
        while (ids.length < config.sampleSize && availableIds.size > 0) {
            const randomIndex = Math.floor(Math.random() * availableIds.size);
            const id = Array.from(availableIds)[randomIndex];
            ids.push(id);
            availableIds.delete(id);
        }
    } else {
        const step = Math.max(1, Math.floor((config.endId - config.startId) / config.sampleSize));
        for (let i = config.startId; i <= config.endId && ids.length < config.sampleSize; i += step) {
            ids.push(i);
        }
    }
    
    return ids.sort((a, b) => a - b);
}

// Crawl endpoints and collect comprehensive data
async function crawlEndpoints(type: 'player' | 'team', config: CrawlConfig) {
    const baseUrl = type === 'player' 
        ? 'https://mkcentral.com/api/registry/players/'
        : 'https://mkcentral.com/api/registry/teams/';
    
    const ids = generateCrawlIds(config);
    const allFields = new Map<string, FieldInfo>();
    const missingFields = new Map<string, number>(); // Track which IDs are missing which fields
    let successCount = 0;
    let failCount = 0;
    
    // Determine if this is a full crawl
    const isFullCrawl = !config.randomSample && config.sampleSize > 1000;
    
    console.log(`\n=== ${isFullCrawl ? 'FULL CRAWL' : 'Crawling'} ${type}s ===`);
    console.log(`Analyzing ${ids.length} IDs: ${ids.slice(0, 5).join(', ')}${ids.length > 5 ? '...' : ''}`);
    if (isFullCrawl) {
        console.log(`Started at: ${new Date().toLocaleString()}`);
    }
    console.log('Progress:');
    
    const startTime = Date.now();
    let lastProgressUpdate = Date.now();
    
    for (let i = 0; i < ids.length; i++) {
        const id = ids[i];
        
        // Update progress more frequently for full crawls
        const now = Date.now();
        if (isFullCrawl && (now - lastProgressUpdate > 1000 || i === ids.length - 1)) {
            const elapsed = (now - startTime) / 1000;
            const rate = successCount / elapsed;
            const remaining = (ids.length - i) / rate;
            const eta = new Date(now + remaining * 1000).toLocaleTimeString();
            
            process.stdout.write(`\r[${i + 1}/${ids.length}] ID: ${id} | Success: ${successCount} | Failed: ${failCount} | Rate: ${rate.toFixed(1)}/s | ETA: ${eta}    `);
            lastProgressUpdate = now;
        } else if (!isFullCrawl) {
            process.stdout.write(`\r[${i + 1}/${ids.length}] Analyzing ${type} ${id}... (Success: ${successCount}, Failed: ${failCount})`);
        }
        
        try {
            const response = await fetchHttpsContent(baseUrl + id);
            const data = JSON.parse(response);
            const fields = extractFieldsWithValues(data, '', true);
            
            // Track this successful fetch
            successCount++;
            
            // Merge field data
            mergeFieldInfo(allFields, fields);
            
            // Track missing fields for this object
            allFields.forEach((_, fieldPath) => {
                if (!fields.has(fieldPath)) {
                    if (!missingFields.has(fieldPath)) {
                        missingFields.set(fieldPath, 0);
                    }
                    missingFields.set(fieldPath, missingFields.get(fieldPath)! + 1);
                }
            });
        } catch (error) {
            failCount++;
        }
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // For full crawls, add periodic saves or checkpoints
        if (isFullCrawl && i > 0 && i % 1000 === 0) {
            console.log(`\n\nCheckpoint at ID ${id}: ${successCount} successful, ${failCount} failed`);
            console.log(`Memory usage: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`);
            
            // Option to save intermediate results
            const saveChoice = await prompt('Save intermediate results? (y/n/c to continue without asking): ');
            if (saveChoice.toLowerCase() === 'y') {
                // Save logic would go here
                console.log('Intermediate results would be saved here (not implemented)');
            } else if (saveChoice.toLowerCase() !== 'c') {
                // Continue without further prompts
            }
        }
    }
    
    const totalTime = (Date.now() - startTime) / 1000;
    console.log(`\n\nCrawl complete! Success: ${successCount}, Failed: ${failCount}`);
    console.log(`Total time: ${Math.floor(totalTime / 60)}m ${Math.floor(totalTime % 60)}s`);
    console.log(`Average rate: ${(successCount / totalTime).toFixed(2)} requests/second`);
    
    // Display comprehensive results
    console.log('\n=== Comprehensive Field Definition ===');
    const sortedFields = Array.from(allFields.entries()).sort(([a], [b]) => a.localeCompare(b));
    
    // Convert to format for hierarchical display
    const fieldDefs: Record<string, string> = {};
    const roleValues = new Set<string>();
    
    sortedFields.forEach(([path, info]) => {
        fieldDefs[path] = determineTypeString(info, successCount);
        
        // Collect role values
        if (info.uniqueValues && path.includes('role')) {
            info.uniqueValues.forEach(val => roleValues.add(String(val)));
        }
    });
    
    const formatted = formatFieldsHierarchically(fieldDefs);
    formatted.forEach(line => console.log(line));
    
    // Display role values if this is a player crawl
    if (type === 'player' && roleValues.size > 0) {
        console.log('\n=== Discovered Role Values ===');
        Array.from(roleValues).sort().forEach(role => {
            console.log(`  - ${role}`);
        });
    }
    
    // Show type distribution for fields with multiple types
    const mixedTypeFields = sortedFields.filter(([_, info]) => info.types.size > 1);
    if (mixedTypeFields.length > 0) {
        console.log('\n=== Fields with Mixed Types ===');
        mixedTypeFields.forEach(([path, info]) => {
            console.log(`  ${path}:`);
            info.types.forEach((count, type) => {
                const percentage = ((count / info.totalOccurrences) * 100).toFixed(1);
                console.log(`    - ${type}: ${count} occurrences (${percentage}%)`);
            });
        });
    }
    
    // Show always-null fields
    const alwaysNullFields = sortedFields.filter(([_, info]) => 
        info.types.size === 1 && info.types.has('null')
    );
    if (alwaysNullFields.length > 0) {
        console.log('\n=== Always Null Fields ===');
        alwaysNullFields.forEach(([path]) => {
            console.log(`  - ${path}`);
        });
    }
    
    // For full crawls, show more detailed statistics
    if (isFullCrawl) {
        console.log('\n=== Full Crawl Statistics ===');
        console.log(`Total IDs attempted: ${ids.length}`);
        console.log(`Successful fetches: ${successCount} (${((successCount/ids.length)*100).toFixed(2)}%)`);
        console.log(`Failed fetches: ${failCount} (${((failCount/ids.length)*100).toFixed(2)}%)`);
        console.log(`Total unique fields discovered: ${allFields.size}`);
        console.log(`Fields with 100% coverage: ${sortedFields.filter(([_, info]) => info.totalOccurrences === successCount).length}`);
        console.log(`Optional fields: ${sortedFields.filter(([_, info]) => info.totalOccurrences < successCount).length}`);
    }
    
    await prompt('\nPress Enter to continue...');
}

// Main CLI loop
async function runCLI() {
    let running = true;
    
    while (running) {
        const choice = await showMainMenu();
        
        switch (choice) {
            case '1':
                await analyzeAndDisplay(
                    'https://mkcentral.com/api/registry/players?page=1',
                    'Players List'
                );
                break;
                
            case '2':
                const playerId = await selectPlayerId();
                if (playerId) {
                    await analyzeAndDisplay(
                        `https://mkcentral.com/api/registry/players/${playerId}`,
                        `Player ${playerId}`
                    );
                }
                break;
                
            case '3':
                await analyzeAndDisplay(
                    'https://mkcentral.com/api/registry/teams?is_historical=false&is_active=true&sort_by_newest=false&min_player_count=6&page=1',
                    'Teams List'
                );
                break;
                
            case '4':
                const teamId = await selectTeamId();
                if (teamId) {
                    await analyzeAndDisplay(
                        `https://mkcentral.com/api/registry/teams/${teamId}`,
                        `Team ${teamId}`
                    );
                }
                break;
                
            case '5':
                const playerConfig = await configureCrawl('player');
                if (playerConfig) {
                    await crawlEndpoints('player', playerConfig);
                }
                break;
                
            case '6':
                const teamConfig = await configureCrawl('team');
                if (teamConfig) {
                    await crawlEndpoints('team', teamConfig);
                }
                break;
                
            case '7':
                running = false;
                console.log('\nExiting...');
                break;
                
            default:
                console.log('\nInvalid option. Please try again.');
        }
    }
    
    rl.close();
}

// Replace the old analyzeAllEndpoints function call
// analyzeAllEndpoints().catch(console.error);

// Run the CLI
runCLI().catch(error => {
    console.error('Error:', error);
    rl.close();
});