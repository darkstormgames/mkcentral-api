import { Player, Players, Team, Teams } from './index';

// ============================================
// PLAYER EXAMPLES
// ============================================

async function playerExamples() {
    console.log('=== PLAYER EXAMPLES ===\n');

    // Example 1: Search for players by name
    console.log('1. Search players by name:');
    const searchResults = await Players.Get('Rollo');
    console.log(`Found ${searchResults.Count} players matching "Rollo"`);
    if (searchResults.length > 0) {
        console.log(`First result: ${searchResults[0].Name} (ID: ${searchResults[0].Id})`);
    }

    // Example 2: Get a specific player by ID
    console.log('\n2. Get player by ID:');
    const player = await Player.Get(1655); // Rollo's ID
    console.log(`Player: ${player.Name}`);
    console.log(`Country: ${player.CountryCode}`);
    console.log(`Discord: ${player.Discord?.Username}`);
    console.log(`Friend Codes: ${player.FriendCodes.length}`);
    console.log(`Rosters: ${player.Rosters.length}`);

    // Example 3: Advanced filtering with PlayerFilter
    console.log('\n3. Filter players by country and game:');
    const filter = new Players.Filter({
        Country: Players.CountryCode.Germany,
        NameOrFC: 'Alex',
        Page: 1
    });
    const filteredPlayers = await Players.Get(filter);
    console.log(`Found ${filteredPlayers.PlayerCount} total German players matching "Alex"`);
    console.log(`Showing page 1 of ${filteredPlayers.PageCount}`);

    // Example 4: Load partial player data to full
    console.log('\n4. Load partial player to full:');
    console.log(' IsFull has some issues, still...');
    const partialPlayers = await Players.Get('Alex');
    if (partialPlayers.length > 0) {
        const partial = partialPlayers[0];
        console.log(`Before Load - IsFull: ${partial.IsFull}`);
        await partial.Load();
        console.log(`After Load - IsFull: ${partial.IsFull}`);
        console.log(`Loaded ${partial.Rosters.length} rosters`);
    }

    // Example 5: Pagination through player results
    console.log('\n5. Pagination example:');
    const paginatedFilter = new Players.Filter({ NameOrFC: 'Anna', Page: 1 });
    const paginatedResults = await Players.Get(paginatedFilter);
    console.log(`Page 1: ${paginatedResults.length} players`);

    if (typeof paginatedResults.LoadNextPage === 'function') {
        const hasNextPage = await paginatedResults.LoadNextPage();
        if (hasNextPage) {
            console.log(`Page 2: ${paginatedResults.length} players`);
        }
    } else {
        console.log('LoadNextPage method not found - skipping pagination test');
    }

    // Example 6: Load all pages at once
    console.log('\n6. Load all pages:');
    const allPagesFilter = new Players.Filter({ Country: Players.CountryCode.Chile });
    const allResults = await Players.Get(allPagesFilter);
    console.log(`Initial page has ${allResults.length} players`);
    await allResults.LoadAllPages();
    console.log(`All pages loaded: ${allResults.length} total Chilean players`);

    // Example 7: Check player status flags
    console.log('\n7. Check player status:');
    const statusCheck = await Player.Get(183); // Alex
    console.log(`Player: ${statusCheck.Name}`);
    console.log(`Is Banned: ${statusCheck.IsBanned}`);
    console.log(`Is Shadow: ${statusCheck.IsShadow}`);
    console.log(`Is Hidden: ${statusCheck.IsHidden}`);

    // Example 8: Access friend codes and roles
    console.log('\n8. Friend codes and roles:');
    const detailedPlayer = await Player.Get(1655);
    for (const fc of detailedPlayer.FriendCodes) {
        console.log(`${fc.Type}: ${fc.Fc} (Verified: ${fc.IsVerified})`);
    }
    for (const role of detailedPlayer.Roles) {
        console.log(`Role: ${role.Name}`);
    }

    // Example 9: Instance refresh with Load()
    console.log('\n9. Refresh instance data:');
    const refreshExample = await Players.Get('Anna');
    const initialCount = refreshExample.Count;
    console.log(`Initial count: ${initialCount}`);
    // Simulate filter change
    refreshExample.Filter.Page = 2;
    await refreshExample.Load();
    console.log(`After refresh: ${refreshExample.Count} players on page ${refreshExample.Filter.Page}`);
}

// ============================================
// TEAM EXAMPLES
// ============================================

async function teamExamples() {
    console.log('\n=== TEAM EXAMPLES ===\n');

    // Example 1: Search teams by name or tag
    console.log('1. Search teams by name/tag:');
    const teamSearch = await Teams.Get('HD');
    console.log(`Found ${teamSearch.Count} teams matching "HD"`);
    if (teamSearch.length > 0) {
        const firstTeam = teamSearch[0];
        console.log(`First result: ${firstTeam.Name} [${firstTeam.Tag}]`);
    }

    // Example 2: Get specific team by ID
    console.log('\n2. Get team by ID:');
    const team = await Team.Get(35); // Example team ID
    console.log(`Team: ${team.Name} [${team.Tag}]`);
    console.log(`Color: #${team.Color?.toString(16).padStart(6, '0')}`);
    console.log(`Language: ${team.Language}`);
    console.log(`Managers: ${team.Managers.length}`);
    console.log(`Rosters: ${team.Rosters.length}`);

    // Example 3: Filter teams with TeamFilter
    console.log('\n3. Filter teams:');
    const teamFilter = new Teams.Filter({
        NameOrTag: 'Racing',
        Game: Teams.Game.MK8dx,
        Mode: Teams.GameMode.CC150,
        Language: Teams.Language.EnglishSimplified,
        Page: 1
    });
    const filteredTeams = await Teams.Get(teamFilter);
    console.log(`Found ${filteredTeams.TeamCount} total teams matching criteria`);
    console.log(`Page 1 shows ${filteredTeams.Count} teams`);

    // Example 4: Load partial team to full
    console.log('\n4. Load partial team to full:');
    const partialTeams = await Teams.Get('Test');
    if (partialTeams.length > 0) {
        const partialTeam = partialTeams[0];
        console.log(`Before Load - IsFull: ${partialTeam.IsFull}`);
        await partialTeam.Load();
        console.log(`After Load - IsFull: ${partialTeam.IsFull}`);
        
        // Access roster players
        for (const roster of partialTeam.Rosters) {
            console.log(`Roster: ${roster.Game?.DisplayName} ${roster.Mode}`);
            console.log(`Players: ${roster.Players?.length ?? 0}`);
        }
    }

    // Example 5: Team pagination
    console.log('\n5. Team pagination:');
    const teamPages = await Teams.Get(new Teams.Filter({ Page: 1 }));
    console.log(`Total teams: ${teamPages.TeamCount}`);
    console.log(`Total pages: ${teamPages.PageCount}`);
    console.log(`Current page has ${teamPages.Count} teams`);

    // Debug: Check if LoadNextPage exists for Teams
    if (typeof teamPages.LoadNextPage === 'function') {
        const hasNext = await teamPages.LoadNextPage();
        if (hasNext) {
            console.log(`Page 2 has ${teamPages.Count} teams`);
        }
        const hasPrev = await teamPages.LoadPreviousPage();
        if (hasPrev) {
            console.log(`Back to page 1: ${teamPages.Count} teams`);
        }
    } else {
        console.log('Team pagination methods not found - skipping pagination test');
    }

    // Example 6: Access team details
    console.log('\n6. Team details:');
    const detailedTeam = await Team.Get(35);
    console.log(`Team: ${detailedTeam.Name}`);
    console.log(`Approval Status: ${detailedTeam.ApprovalStatus}`);
    console.log(`Is Historical: ${detailedTeam.IsHistorical}`);
    console.log(`Created: ${new Date(detailedTeam.CreationDate! * 1000).toLocaleDateString()}`);
    
    // List managers
    for (const manager of detailedTeam.Managers) {
        console.log(`Manager: ${manager.Name} (ID: ${manager.Id})`);
    }

    // Example 7: Load all team pages
    console.log('\n7. Load all team pages:');
    const allTeamFilter = new Teams.Filter({ 
        Game: Teams.Game.MK8dx,
        Mode: Teams.GameMode.CC200
    });
    const allTeams = await Teams.Get(allTeamFilter);
    console.log(`Initial load: ${allTeams.Count} teams`);
    await allTeams.LoadAllPages();
    console.log(`All pages loaded: ${allTeams.Count} total 200cc teams`);

    // Example 8: Access roster information
    console.log('\n8. Roster information:');
    const rosterTeam = await Team.Get(35);
    for (const roster of rosterTeam.Rosters) {
        console.log(`\nRoster: ${roster.Game?.DisplayName} ${roster.Mode}`);
        console.log(`Is Recruiting: ${roster.IsRecruiting}`);
        
        if (roster.Players && roster.Players.length > 0) {
            console.log(`Players (${roster.Players.length}):`);
            for (const player of roster.Players.slice(0, 3)) { // Show first 3
                const flags = [];
                if (player.IsLeader) flags.push('Leader');
                if (player.IsManager) flags.push('Manager');
                if (player.IsBaggerClause) flags.push('Bagger Clause');
                const flagStr = flags.length > 0 ? ` [${flags.join(', ')}]` : '';
                console.log(`  - ${player.Name}${flagStr}`);
            }
        }
    }
}

// ============================================
// COMBINED EXAMPLES
// ============================================

async function combinedExamples() {
    console.log('\n=== COMBINED EXAMPLES ===\n');

    // Example 1: Find player's teams
    console.log('1. Find all teams for a player:');
    const player = await Player.Get(183);
    console.log(`Player: ${player.Name}`);
    console.log(`Teams:`);
    for (const roster of player.Rosters) {
        console.log(`  - ${roster.TeamName} [${roster.TeamTag}] - ${roster.Game?.DisplayName} ${roster.Mode}`);
    }

    // Example 2: Find team members
    console.log('\n2. Find all members of a team:');
    const team = await Team.Get(35);
    console.log(`Team: ${team.Name}`);
    for (const roster of team.Rosters) {
        console.log(`\n${roster.Game?.DisplayName} ${roster.Mode} Roster:`);
        if (roster.Players) {
            for (const member of roster.Players) {
                const roleFlags = [];
                if (member.IsLeader) roleFlags.push('★ ');
                if (member.IsManager) roleFlags.push('♔ ');
                const prefix = roleFlags.length > 0 ? roleFlags.join('') + ' ' : '';
                console.log(`  ${prefix}${member.Name}`);
            }
        }
    }

    // Example 3: Country statistics
    console.log('\n3. Players by country:');
    const countries = [Players.CountryCode.UnitedStates, Players.CountryCode.Germany, Players.CountryCode.Japan];
    for (const country of countries) {
        const filter = new Players.Filter({ Country: country, Page: 1 });
        const results = await Players.Get(filter);
        console.log(`${country}: ${results.PlayerCount} players`);
    }
}

// ============================================
// ERROR HANDLING EXAMPLES
// ============================================

async function errorHandlingExamples() {
    console.log('\n=== ERROR HANDLING EXAMPLES ===\n');

    // Example 1: Handle invalid player ID
    console.log('1. Invalid player ID:');
    try {
        await Player.Get(99999999);
    } catch (error: any) {
        console.log(`Error: ${error.message}`);
    }

    // Example 2: Handle invalid team ID
    console.log('\n2. Invalid team ID:');
    try {
        await Team.Get(-1);
    } catch (error: any) {
        console.log(`Error: ${error.message}`);
    }

    // Example 3: Handle network errors (would need network to be down)
    console.log('\n3. Network error handling:');
    try {
        const players = await Players.Get('test');
        console.log(`Success: Found ${players.Count} players`);
    } catch (error: any) {
        if (error.name === 'NetworkError') {
            console.log('Network error occurred');
        } else if (error.name === 'HTTPError') {
            console.log(`HTTP error: ${error.message}`);
        } else {
            console.log(`Unexpected error: ${error.message}`);
        }
    }
}

// ============================================
// MAIN EXECUTION
// ============================================

async function runExamples() {
    try {
        await playerExamples();
        await teamExamples();
        await combinedExamples();
        await errorHandlingExamples();
    } catch (error: any) {
        console.error('Example execution failed:', error);
    }
}

// Run examples if this file is executed directly
if (require.main === module) {
    runExamples().then(() => {
        console.log('\n=== EXAMPLES COMPLETE ===');
    }).catch(console.error);
}

export { playerExamples, teamExamples, combinedExamples, errorHandlingExamples, runExamples };

