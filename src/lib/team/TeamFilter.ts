import { GameMode } from '../common/GameMode';
import { Game } from '../common/Game';
import { Language } from '../common/Language';

export class TeamFilter {
    /**
     * Filter by team name only
     */
    public Name: string | null = null;
    /**
     * Filter by team tag only
     */
    public Tag: string | null = null;
    /**
     * Name or tag search
     */
    public NameOrTag: string | null = null;
    /**
     * Game to filter (e.g., Game.tryGet('mk8dx'))
     */
    public Game: Game | null = null;
    /**
     * Game mode to filter (e.g., GameMode.tryGet('150cc'))
     */
    public Mode: GameMode | null = null;
    /**
     * Preferred language to filter (e.g., Language.EnglishTraditional)
     */
    public Language: Language | null = null;
    /**
     * Filter recruiting teams
     */
    public IsRecruiting: boolean | null = null;
    /**
     * Filter historical teams
     */
    public IsHistorical: boolean | null = null;
    /**
     * Filter active teams
     */
    public IsActive: boolean | null = null;
    /**
     * Minimum roster size to filter
     */
    public MinPlayerCount: number | null = null;
    /**
     * Sort results by newest registration
     */
    public SortByNewest: boolean | null = false;
    /**
     * Page number for results
     */
    public Page: number | null = null;

    constructor(init?: Partial<TeamFilter>) {
        if (!init) return;
        Object.assign(this, init);
        // Normalize Mode when provided as a string
        if (typeof (init as any).Mode === 'string') {
            this.Mode = GameMode.tryGet((init as any).Mode);
        }
        // Normalize Game when provided as a string
        if (typeof (init as any).Game === 'string') {
            this.Game = Game.tryGet((init as any).Game);
        }
        // Normalize Language when provided as a string
        if (typeof (init as any).Language === 'string') {
            this.Language = (Object.values(Language) as string[]).includes((init as any).Language)
                ? (init as any).Language as Language
                : null;
        }
    }

    /**
     * Build a query string of URL parameters from the set fields.
     * Undefined/null/false values are omitted. Booleans are serialized as 'true'.
     */
    public ToQueryString(): string {
        const params: Record<string, string> = {};
        const add = (k: string, v: unknown) => {
            if (v === null || v === undefined) return;
            if (v instanceof GameMode) {
                params[k] = v.Key;
                return;
            }
            if (v instanceof Game) {
                params[k] = v.Key;
                return;
            }
            if (typeof v === 'string') {
                if (v.length === 0) return;
                params[k] = v;
            } else if (typeof v === 'number') {
                if (!Number.isFinite(v)) return;
                params[k] = String(v);
            } else if (typeof v === 'boolean') {
                if (v === false) return;
                params[k] = String(v);
            } else {
                params[k] = String(v);
            }
        };

        add('name', this.Name);
        add('tag', this.Tag);
        add('name_or_tag', this.NameOrTag);
        add('game', this.Game);
        add('mode', this.Mode);
        add('language', this.Language);
        add('is_recruiting', this.IsRecruiting);
        add('is_historical', this.IsHistorical);
        add('is_active', this.IsActive);
        add('min_player_count', this.MinPlayerCount);
        add('sort_by_newest', this.SortByNewest);
        add('page', this.Page);

        return Object.keys(params)
            .map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`)
            .join('&');
    }

    /**
     * Create a filter with repository defaults
     */
    public static Default(): TeamFilter {
        return new TeamFilter({
            Name: null,
            Tag: null,
            NameOrTag: null,
            Game: null,
            Mode: null,
            Language: null,
            IsRecruiting: null,
            IsHistorical: false,
            IsActive: true,
            MinPlayerCount: 6,
            SortByNewest: false,
            Page: 1,
        });
    }
}
