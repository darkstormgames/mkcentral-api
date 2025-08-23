import { FriendCodeType } from './FriendCode';
import { CountryCode } from '../common/CountryCode';

export class PlayerFilter {
    /** Filter by player name only */
    public Name: string | null = null;
    /** Filter by player Friend Code only */
    public FriendCode: string | null = null;
    /** Name or friend code search */
    public NameOrFC: string | null = null;
    /** Type of friend code to match */
    public FCType: FriendCodeType | null = null;
    /** Country code to filter */
    public Country: CountryCode | null = null;
    /** Filter hidden players */
    public IsHidden: boolean | null = null;
    /** Filter shadow players */
    public IsShadow: boolean | null = null;
    /** Filter banned players */
    public IsBanned: boolean | null = null;
    /** Discord user ID to filter */
    public DiscordId: string | null = null;
    /** Request detailed player data */
    public Detailed: boolean | null = null;
    /** Page number for results */
    public Page: number | null = null;
    /** Registration ID to filter */
    public RegistrationId: number | null = null;
    /** Only include players with matching friend codes */
    public MatchingFCsOnly: boolean = false;
    /** Include banned, hidden, and shadow players in results */
    public IncludeShadowPlayers: boolean = false;
    /** Sort results by newest registration */
    public SortByNewest: boolean | null = false;
    /** Filter by connected user presence */
    public HasConnectedUser: boolean | null = null;

    constructor(init?: Partial<PlayerFilter>) {
        if (!init) return;
        Object.assign(this, init);
    }

    /**
     * Build a query string of URL parameters from the set fields.
     * 
     * Undefined/null/false values are omitted. Booleans are serialized as 'true'.
     */
    public ToQueryString(): string {
        const params: Record<string, string> = {};
        const add = (k: string, v: unknown) => {
            if (v === null || v === undefined) return;
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
        add('friend_code', this.FriendCode);
        add('name_or_fc', this.NameOrFC);
        add('fc_type', this.FCType);
        add('country', this.Country);
        add('is_hidden', this.IsHidden);
        add('is_shadow', this.IsShadow);
        add('is_banned', this.IsBanned);
        add('discord_id', this.DiscordId);
        add('detailed', this.Detailed);
        add('page', this.Page);
        add('registration_id', this.RegistrationId);
        add('matching_fcs_only', this.MatchingFCsOnly);
        add('include_shadow_players', this.IncludeShadowPlayers);
        add('sort_by_newest', this.SortByNewest);
        add('has_connected_user', this.HasConnectedUser);

        return Object.keys(params)
            .map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`)
            .join('&');
    }

    /**
     * Create a filter with repository defaults
     */
    public static Default(): PlayerFilter {
        return new PlayerFilter({
            Name: null,
            FriendCode: null,
            NameOrFC: null,
            FCType: null,
            Country: null,
            IsHidden: false,
            IsShadow: false,
            IsBanned: false,
            DiscordId: null,
            Detailed: true,
            Page: 1,
            RegistrationId: null,
            MatchingFCsOnly: true,
            IncludeShadowPlayers: false,
            SortByNewest: false,
            HasConnectedUser: null,
        });
    }
}
